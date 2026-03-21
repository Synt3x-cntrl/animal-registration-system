const User = require('../models/User');
const Pet = require('../models/Pet');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');

exports.getUserStats = async (req, res) => {
    try {
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
        const doctorId = req.params.doctorId;
        
        const today = new Date();
        const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        const todayAppointments = await Appointment.find({ doctorId });
        const countToday = todayAppointments.filter(app => app.date && app.date.startsWith(localDate)).length;

        const docUser = await User.findById(doctorId);
        let docNameCount = 0;
        if (docUser) {
            // Эмчийн нэрээр хадгалагдсан түүхийг олох (case insensitive)
            docNameCount = await MedicalRecord.countDocuments({ 
                doctorName: { $regex: docUser.firstname, $options: 'i' } 
            });
        }

        res.status(200).json({
            success: true,
            data: {
                todayAppointments: countToday,
                totalPatientsSeen: docNameCount
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
