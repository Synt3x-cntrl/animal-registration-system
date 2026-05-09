const { OpenAI } = require('openai');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
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
        if (!openai) {
            return res.status(500).json({
                success: false,
                error: "OpenAI API Key тохируулагдаагүй байна."
            });
        }
        const { message, userId } = req.body;
        let user = null;
        if (userId) {
            user = await User.findById(userId);
        }

        // 1. OpenAI-д мессеж явуулж, function calling хийх боломжтой эсэхийг шалгана
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "Чи бол Amitani Delguur-ийн ухаалаг туслах байна. Хэрэглэгчид цаг захиалахад тусалдаг. Google Calendar ашиглан сул цаг хайж, цаг захиалж өгнө. Монгол хэлээр харилцана." },
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
                                petName: { type: "string", description: "Амьтны нэр" }
                            },
                            required: ["summary", "startTime", "endTime"]
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

            if (functionName === "checkAvailability") {
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

                    // MongoDB дээр мөн хадгалах
                    await Appointment.create({
                        petName: args.petName || "Үл мэдэгдэх",
                        petId: req.body.petId || user._id,
                        date: args.startTime,
                        reason: args.summary,
                        ownerId: user._id,
                        googleEventId: event.id
                    });

                    functionResponse = `Амьтны цаг амжилттай захиалагдлаа. Calendar дээр нэмэгдсэн.`;
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
