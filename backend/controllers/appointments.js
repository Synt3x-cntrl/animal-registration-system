const Appointment = require("../models/Appointment");
const DoctorSchedule = require("../models/DoctorSchedule");
const User = require("../models/User");

exports.createAppointment = async (req, res, next) => {
    try {
        const { petName, reason, ownerId, doctorId, scheduleId } = req.body;

        if (!ownerId || !doctorId || !scheduleId) {
            return res.status(400).json({
                success: false,
                error: "Эзэмшигчийн ID, Эмчийн ID, Цагийн хуваарь (scheduleId) заавал шаардлагатай",
            });
        }

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

        const newAppointment = await Appointment.create({
            petName,
            date: scheduleDoc.date,
            reason,
            ownerId,
            doctorId,
            scheduleId
        });

        scheduleDoc.isBooked = true;
        await scheduleDoc.save();

        res.status(201).json({
            success: true,
            data: newAppointment,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
};

exports.getUserAppointments = async (req, res, next) => {
    try {
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
        const appointments = await Appointment.find({ doctorId: req.params.doctorId })
            .populate('ownerId', 'firstname lastname phone email')
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
        const apptDoc = await Appointment.findById(req.params.id);

        if (!apptDoc) {
            return res.status(404).json({ success: false, error: "Захиалга олдсонгүй" });
        }

        if (apptDoc.scheduleId) {
            await DoctorSchedule.findByIdAndUpdate(apptDoc.scheduleId, { isBooked: false });
        }

        await Appointment.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, message: "Захиалга амжилттай устгагдлаа" });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
