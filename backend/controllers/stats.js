const User = require('../models/User');
const Pet = require('../models/Pet');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const { cleanupExpiredData } = require("../utils/cleanup");

exports.getUserStats = async (req, res) => {
    try {
        await cleanupExpiredData();
        const userId = req.params.userId;
        const totalPets = await Pet.countDocuments({ owner: userId });
        
        const today = new Date();
        const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        // Бүх цаг захиалгыг татаад огноогоор нь шүүх (Учир нь String байдлаар хадгалагдаж байгаа)
        const allAppointments = await Appointment.find({ ownerId: userId }).sort({ date: 1 });
        const nextAppointment = allAppointments.find(app => app.date && app.date >= localDate);

        let nextApptDiff = null;
        let nextAppointmentPetName = null;
        if (nextAppointment) {
            nextAppointmentPetName = nextAppointment.petName;
            const nextDate = new Date(nextAppointment.date);
            const todayReset = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const diffTime = nextDate - todayReset;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            nextApptDiff = diffDays >= 0 ? diffDays : null;
        }

        res.status(200).json({
            success: true,
            data: {
                totalPets,
                nextAppointmentDays: nextApptDiff,
                nextAppointmentPetName
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getDoctorStats = async (req, res) => {
    try {
        await cleanupExpiredData();
        const doctorId = req.params.doctorId;
        const docUser = await User.findById(doctorId);
        if (!docUser) return res.status(404).json({ success: false, error: "Эмч олдсонгүй" });

        const today = new Date();
        const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        // Helper to get date string N days ago
        const getDateXDaysAgo = (days) => {
            const d = new Date();
            d.setDate(d.getDate() - days);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        };

        const date7DaysAgo = getDateXDaysAgo(7);
        const date30DaysAgo = getDateXDaysAgo(30);

        // 1. Today's appointments
        const todayAppointments = await Appointment.find({ doctorId });
        const countToday = todayAppointments.filter(app => app.date && app.date.startsWith(localDate)).length;

        // 2. Patient history counts (using doctorName)
        const doctorNameRegex = { $regex: docUser.firstname, $options: 'i' };

        const totalSeen = await MedicalRecord.countDocuments({ doctorName: doctorNameRegex });
        const last7DaysSeen = await MedicalRecord.countDocuments({ 
            doctorName: doctorNameRegex,
            date: { $gte: date7DaysAgo }
        });
        const last30DaysSeen = await MedicalRecord.countDocuments({ 
            doctorName: doctorNameRegex,
            date: { $gte: date30DaysAgo }
        });

        res.status(200).json({
            success: true,
            data: {
                todayAppointments: countToday,
                totalPatientsSeen: totalSeen,
                last7DaysSeen,
                last30DaysSeen
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
