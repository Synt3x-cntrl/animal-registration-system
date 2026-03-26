const Appointment = require("../models/Appointment");
const DoctorSchedule = require("../models/DoctorSchedule");
const User = require("../models/User");
const { cleanupExpiredData } = require("../utils/cleanup");

exports.createAppointment = async (req, res, next) => {
    try {
        const { petName, petId, reason, ownerId, doctorId, scheduleId, date, serviceType } = req.body;

        if (!petId || !ownerId) {
            return res.status(400).json({
                success: false,
                error: "Амьтны ID болон эзэмшигчийн ID заавал шаардлагатай",
            });
        }

        let apptDate;
        if (scheduleId) {
            const scheduleDoc = await DoctorSchedule.findById(scheduleId);

            if (!scheduleDoc) {
                return res.status(404).json({
                    success: false,
                    error: "Цагийн хуваарь олдсонгүй",
                });
            }

            if (scheduleDoc.isBooked) {
                return res.status(400).json({
                    success: false,
                    error: "Энэ цаг хэдийнээ захиалагдсан байна. Өөр цаг сонгоно уу.",
                });
            }
            apptDate = scheduleDoc.date;
            scheduleDoc.isBooked = true;
            await scheduleDoc.save();
        } else if (date) {
            apptDate = date;
        } else {
            return res.status(400).json({
                success: false,
                error: "Огноо эсвэл Цагийн хуваарь (scheduleId) заавал шаардлагатай",
            });
        }

        // --- Double Booking Prevention ---
        const existingAppointment = await Appointment.findOne({ 
            date: apptDate, 
            doctorId: doctorId || null,
            status: { $ne: 'Cancelled' } 
        });

        if (existingAppointment) {
            return res.status(400).json({
                success: false,
                error: "Энэ цаг дээр захиалга аль хэдийн хийгдсэн байна. Өөр цаг сонгоно уу.",
            });
        }
        // ---------------------------------

        const newAppointment = await Appointment.create({
            petName,
            petId,
            date: apptDate,
            reason,
            serviceType: serviceType || 'Examination',
            ownerId,
            doctorId,
            scheduleId
        });

        // Create Notification for the user
        try {
            const Notification = require("../models/Notification");
            await Notification.create({
                user: ownerId,
                title: '📅 Цаг захиалга баталгаажлаа',
                message: `${petName} амьтны ${new Date(apptDate).toLocaleDateString()} ${new Date(apptDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} үзлэгийн цаг амжилттай захиалагдлаа.`,
                type: 'success'
            });
        } catch (nErr) {
            console.error("Failed to create notification:", nErr);
        }

        res.status(201).json({
            success: true,
            data: newAppointment,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message.includes("validation") ? "Мэдээлэл дутуу эсвэл буруу байна" : error.message,
        });
    }
};

exports.getUserAppointments = async (req, res, next) => {
    try {
        await cleanupExpiredData();
        const appointments = await Appointment.find({ ownerId: req.params.userId })
            .populate('doctorId', 'firstname lastname')
            .sort({ date: 1 })
            .lean();

        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
};

exports.getDoctorAppointments = async (req, res, next) => {
    try {
        await cleanupExpiredData();
        const appointments = await Appointment.find({
            $or: [
                { doctorId: req.params.doctorId },
                { doctorId: null }
            ]
        })
            .populate('ownerId', 'firstname lastname phone email')
            .populate('petId', 'name species breed gender color birthdate age weight imageUrl')
            .sort({ date: 1 })
            .lean();

        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
};

exports.deleteAppointment = async (req, res, next) => {
    try {
        const { received } = req.query;
        const apptDoc = await Appointment.findById(req.params.id);

        if (!apptDoc) {
            return res.status(404).json({ success: false, error: "Захиалга олдсонгүй" });
        }

        if (apptDoc.scheduleId) {
            if (received === 'true') {
                // If service was received, delete the schedule slot permanently
                await DoctorSchedule.findByIdAndDelete(apptDoc.scheduleId);
            } else {
                // If just cancelled, make it available again
                await DoctorSchedule.findByIdAndUpdate(apptDoc.scheduleId, { isBooked: false });
            }
        }

        await Appointment.findByIdAndDelete(req.params.id);

        res.status(200).json({ 
            success: true, 
            message: received === 'true' ? "Үйлчилгээ дуусч, цаг бүрмөсөн устлаа" : "Захиалга амжилттай цуцлагдлаа" 
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.updateAppointmentStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        ).populate('doctorId', 'firstname lastname');

        if (!appointment) {
            return res.status(404).json({ success: false, error: "Захиалга олдсонгүй" });
        }

        // If marked as completed, create a medical record entry and then DELETE the appointment/schedule
        if (status === 'Completed') {
            try {
                // Pre-validation to ensure data integrity
                if (!appointment.petName || !appointment.ownerId) {
                    return res.status(400).json({ success: false, error: "Захиалгын мэдээлэл дутуу байна (Амьтны нэр эсвэл Эзэмшигчийг олох боломжгүй)" });
                }

                const MedicalRecord = require("../models/MedicalRecord");
                const serviceNames = {
                    'Bathing': '🛁 Усанд оруулах',
                    'Grooming': '✂️ Үс засах / Гоо сайхан',
                    'NailClipping': '🐾 Хумс авах',
                    'Examination': '🩺 Эмчийн үзлэг'
                };
                
                const doctorName = appointment.doctorId 
                    ? `${appointment.doctorId.firstname} ${appointment.doctorId.lastname}`
                    : 'Манай ажилтан';

                // 1. Create history record
                await MedicalRecord.create({
                    petName: appointment.petName,
                    doctorName: doctorName,
                    date: appointment.date,
                    diagnosis: serviceNames[appointment.serviceType] || appointment.serviceType || 'Үйлчилгээ',
                    treatment: 'Амжилттай хийгдсэн',
                    notes: appointment.reason || '',
                    ownerId: appointment.ownerId
                });

                // 2. Delete schedule slot
                if (appointment.scheduleId) {
                    await DoctorSchedule.findByIdAndDelete(appointment.scheduleId);
                }

                // 3. Delete the appointment
                await Appointment.findByIdAndDelete(req.params.id);

                return res.status(200).json({
                    success: true,
                    message: "Үйлчилгээ дууссан тул тэмдэглэл үүсэж, цаг устлаа.",
                    data: null
                });

            } catch (err) {
                console.error("Critical error in updateAppointmentStatus completion block:", err);
                return res.status(500).json({ 
                    success: false, 
                    error: `Түүх үүсгэх эсвэл цаг устгахад алдаа гарлаа: ${err.message}` 
                });
            }
        }

        res.status(200).json({
            success: true,
            data: appointment,
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.getAllAppointments = async (req, res, next) => {
    try {
        await cleanupExpiredData();
        const appointments = await Appointment.find()
            .populate('ownerId', 'firstname lastname phone email')
            .populate('doctorId', 'firstname lastname')
            .sort({ date: 1 })
            .lean();

        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments,
        });
    } catch (error) {
        res.status(400).json({ success: false, error: "Мэдээлэл татахад алдаа гарлаа" });
    }
};
