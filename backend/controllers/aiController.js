const { OpenAI } = require('openai');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const DoctorSchedule = require('../models/DoctorSchedule');
const { getBusySlots, createCalendarEvent } = require('../utils/googleCalendar');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../config/config.env') });

let openai;
try {
    if (process.env.OPENAI_API_KEY) {
        openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
} catch (err) {
    console.error("OpenAI initialization failed:", err.message);
}

/**
 * AI Чат контроллер
 */
exports.chatWithAI = async (req, res) => {
    try {
        const { message, userId } = req.body;

        // Хэрэв OpenAI Key байхгүй бол Simulated AI ажиллуулна
        if (!openai) {
            const msg = message.toLowerCase();
            let simulatedReply = "";

            if (msg.includes("завтай") || msg.includes("цаг") || msg.includes("өдөр") || msg.includes("хэзээ")) {
                // Эмч нарын оруулсан сул цагийг хайх
                const availableSlots = await DoctorSchedule.find({ isBooked: false })
                    .populate('doctorId', 'name')
                    .sort({ date: 1 })
                    .limit(5);

                if (availableSlots.length > 0) {
                    let slotsText = availableSlots.map(s => 
                        `${s.date} (${s.doctorId ? s.doctorId.name : 'Эмч'})`
                    ).join(", ");
                    simulatedReply = `Одоогоор дараах сул цагууд байна: ${slotsText}. Та аль нэгийг нь сонгож захиалах уу?`;
                } else {
                    simulatedReply = "Уучлаарай, одоогоор эмч нарын оруулсан сул цаг байхгүй байна.";
                }
            } else if (msg.includes("захиалах") || msg.includes("авъя") || msg.includes("тийм")) {
                simulatedReply = "Таны цагийг амжилттай захиаллаа! (Demo горимд таны Calendar дээр event үүсэхгүй болохыг анхаарна уу. Жинхэнэ захиалга хийхийн тулд OpenAI Key тохируулах шаардлагатай).";
            } else if (msg.includes("тэмдэглэл") || msg.includes("онош") || msg.includes("бич")) {
                simulatedReply = "Амьтны үзлэгийн тэмдэглэлийг амжилттай хадгаллаа! Онош: Ханиад, Эмчилгээ: Сироп уулгах. (Demo горим)";
            } else {
                simulatedReply = userId 
                    ? "Сайн байна уу! Би Amitani Delguur-ийн туслах байна. Танд юугаар туслах вэ? Би эмч нарын хуваарийг шалгаж, цаг захиалж өгөх боломжтой."
                    : "Сайн байна уу! Би Amitani Delguur-ийн туслах байна. Та Gmail-ээр нэвтэрвэл би таны календартай холбогдож, эмчийн цаг захиалж өгч чадна.";
            }

            return res.status(200).json({
                success: true,
                reply: simulatedReply
            });
        }
        let user = null;
        if (userId) {
            user = await User.findById(userId);
        }

        // 1. OpenAI-д мессеж явуулж, function calling хийх боломжтой эсэхийг шалгана
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "Чи бол Amitani Delguur-ийн ухаалаг туслах байна. Хэрэглэгчид эмчийн цаг захиалахад тусалдаг. Эхлээд 'getAvailableDoctorSlots' ашиглан эмч нарын оруулсан сул цагуудыг шалгаж хэрэглэгчид санал болгоно. Хэрэв сул цаг байхгүй бол 'Уучлаарай, одоогоор эмч нарын оруулсан сул цаг байхгүй байна' гэж хэлнэ. Хэрэглэгч цагаа сонгосны дараа 'bookAppointment' ашиглан захиална. Мөн Google Calendar ашиглан сул цаг давхар шалгаж болно. Монгол хэлээр харилцана." },
                { role: "user", content: message }
            ],
            tools: [
                {
                    type: "function",
                    function: {
                        name: "checkAvailability",
                        description: "Тодорхой өдөр болон цагт сул байгаа эсэхийг шалгана",
                        parameters: {
                            type: "object",
                            properties: {
                                date: { type: "string", description: "Өдөр (YYYY-MM-DD)" },
                                startTime: { type: "string", description: "Эхлэх цаг (ISO string)" },
                                endTime: { type: "string", description: "Дуусах цаг (ISO string)" }
                            },
                            required: ["startTime", "endTime"]
                        }
                    }
                },
                {
                    type: "function",
                    function: {
                        name: "bookAppointment",
                        description: "Шинэ цаг захиална",
                        parameters: {
                            type: "object",
                            properties: {
                                summary: { type: "string", description: "Захиалгын нэр (жишээ нь: Вакцин хийлгэх)" },
                                startTime: { type: "string", description: "Эхлэх цаг (ISO string)" },
                                endTime: { type: "string", description: "Дуусах цаг (ISO string)" },
                                petName: { type: "string", description: "Амьтны нэр" },
                                slotId: { type: "string", description: "Сонгосон хуваарийн ID (заавал биш)" }
                            },
                            required: ["summary", "startTime", "endTime"]
                        }
                    }
                },
                {
                    type: "function",
                    function: {
                        name: "saveMedicalRecord",
                        description: "Амьтны үзлэгийн тэмдэглэл болон оношийг хадгална",
                        parameters: {
                            type: "object",
                            properties: {
                                petName: { type: "string", description: "Амьтны нэр" },
                                diagnosis: { type: "string", description: "Онош" },
                                treatment: { type: "string", description: "Эмчилгээний заавар" },
                                notes: { type: "string", description: "Нэмэлт тэмдэглэл" },
                                followUpDate: { type: "string", description: "Давтан үзлэгийн огноо (YYYY-MM-DD)" }
                            },
                            required: ["petName", "diagnosis", "treatment"]
                        }
                    }
                },
                {
                    type: "function",
                    function: {
                        name: "getAvailableDoctorSlots",
                        description: "Эмч нарын оруулсан сул цагуудын жагсаалтыг авна",
                        parameters: {
                            type: "object",
                            properties: {}
                        }
                    }
                }
            ],
            tool_choice: "auto",
        });

        const responseMessage = response.choices[0].message;

        // 2. Хэрэв AI function call хийх шаардлагатай гэж үзвэл
        if (responseMessage.tool_calls) {
            const toolCall = responseMessage.tool_calls[0];
            const functionName = toolCall.function.name;
            const args = JSON.parse(toolCall.function.arguments);

            let functionResponse;

            if (functionName === "getAvailableDoctorSlots") {
                const slots = await DoctorSchedule.find({ isBooked: false })
                    .populate('doctorId', 'name')
                    .sort({ date: 1 })
                    .limit(10);
                
                if (slots.length === 0) {
                    functionResponse = "Одоогоор эмч нарын оруулсан сул цаг байхгүй байна.";
                } else {
                    functionResponse = JSON.stringify(slots.map(s => ({
                        id: s._id,
                        date: s.date,
                        doctor: s.doctorId ? s.doctorId.name : 'Unknown'
                    })));
                }
            } else if (functionName === "checkAvailability") {
                if (!user || !user.googleRefreshToken) {
                    functionResponse = "Хэрэглэгч нэвтрээгүй байна. Хуанли шалгахын тулд заавал Gmail-ээр нэвтрэх шаардлагатай.";
                } else {
                    const busySlots = await getBusySlots(user.googleRefreshToken, args.startTime, args.endTime);
                    functionResponse = busySlots.length === 0 ? "Тухайн цагт завтай байна." : "Тухайн цагт завгүй байна.";
                }
            } else if (functionName === "bookAppointment") {
                if (!user || !user.googleRefreshToken) {
                    functionResponse = "Хэрэглэгч нэвтрээгүй байна. Цаг захиалахын тулд заавал Gmail-ээр нэвтрэх шаардлагатай.";
                } else {
                    const event = await createCalendarEvent(user.googleRefreshToken, {
                        summary: args.summary,
                        startTime: args.startTime,
                        endTime: args.endTime,
                        description: `Амьтны нэр: ${args.petName || 'Мэдэгдэхгүй'}`
                    });

                    // Хэрэв тодорхой slotId өгөгдсөн бол түүнийг ашиглана, үгүй бол огноогоор хайж хаана
                    let schedule = null;
                    if (args.slotId) {
                        schedule = await DoctorSchedule.findById(args.slotId);
                    } else {
                        schedule = await DoctorSchedule.findOne({ date: args.startTime, isBooked: false });
                    }

                    if (schedule) {
                        schedule.isBooked = true;
                        await schedule.save();
                    }

                    // MongoDB дээр мөн хадгалах
                    await Appointment.create({
                        petName: args.petName || "Үл мэдэгдэх",
                        petId: req.body.petId || user._id,
                        date: args.startTime,
                        reason: args.summary,
                        ownerId: user._id,
                        doctorId: schedule ? schedule.doctorId : null,
                        scheduleId: schedule ? schedule._id : null,
                        googleEventId: event ? event.id : null
                    });

                    functionResponse = `Амьтны цаг амжилттай захиалагдлаа. ${schedule ? 'Эмчийн хуваарь шинэчлэгдсэн.' : ''}`;
                }
            } else if (functionName === "saveMedicalRecord") {
                if (!user) {
                    functionResponse = "Хэрэглэгч нэвтрээгүй байна. Тэмдэглэл хадгалахын тулд заавал нэвтэрнэ үү.";
                } else {
                    // Энд Pet-ийг нэрээр нь хайж олох логик нэмж болно, эсвэл шууд хадгална
                    await MedicalRecord.create({
                        petId: req.body.petId || user._id, // Жишээ болгож
                        ownerId: user._id,
                        diagnosis: args.diagnosis,
                        treatment: args.treatment,
                        notes: args.notes,
                        followUpDate: args.followUpDate
                    });
                    functionResponse = `${args.petName}-ийн үзлэгийн тэмдэглэлийг амжилттай хадгаллаа. Онош: ${args.diagnosis}`;
                }
            }

            // 3. AI-д функцийн үр дүнг буцааж өгөөд эцсийн хариултыг авна
            const secondResponse = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: "Чи бол Amitani Delguur-ийн ухаалаг туслах." },
                    { role: "user", content: message },
                    responseMessage,
                    {
                        tool_call_id: toolCall.id,
                        role: "tool",
                        name: functionName,
                        content: functionResponse,
                    },
                ],
            });

            return res.status(200).json({
                success: true,
                reply: secondResponse.choices[0].message.content
            });
        }

        // Хэрэв функц дуудах шаардлагагүй бол шууд хариулна
        res.status(200).json({
            success: true,
            reply: responseMessage.content
        });

    } catch (error) {
        console.error("AI Chat Error:", error);
        res.status(500).json({
            success: false,
            error: "AI-тай харилцахад алдаа гарлаа"
        });
    }
};
