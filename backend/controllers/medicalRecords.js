const MedicalRecord = require("../models/MedicalRecord");
const User = require("../models/User");

exports.createRecord = async (req, res, next) => {
    try {
        const { petName, doctorName, date, symptoms, diagnosis, treatment, ownerEmail, ownerId } = req.body;

        let finalOwnerId = ownerId;

        if (ownerEmail) {
            const user = await User.findOne({ email: ownerEmail });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: `Имэйл хаягаар хэрэглэгч олдсонгүй: ${ownerEmail}`
                });
            }
            finalOwnerId = user._id;
        }

        if (!finalOwnerId) {
            return res.status(400).json({
                success: false,
                error: "Эзэмшигчийн ID (ownerId) эсвэл Имэйл (ownerEmail) заавал шаардлагатай",
            });
        }

        const newRecord = await MedicalRecord.create({
            petName,
            doctorName,
            date,
            symptoms,
            diagnosis,
            treatment,
            ownerId: finalOwnerId
        });

        res.status(201).json({
            success: true,
            data: newRecord,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
};

exports.getUserRecords = async (req, res, next) => {
    try {
        const records = await MedicalRecord.find({ ownerId: req.params.userId })
            .populate('ownerId', 'email phone')
            .sort({ date: -1 })
            .lean();

        const formattedRecords = records.map(record => ({
            ...record,
            ownerEmail: record.ownerId?.email || '',
            ownerPhone: record.ownerId?.phone || '',
            ownerId: record.ownerId?._id || record.ownerId
        }));

        res.status(200).json({
            success: true,
            count: formattedRecords.length,
            data: formattedRecords,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
};

exports.getDoctorRecords = async (req, res, next) => {
    try {
        const doctorName = decodeURIComponent(req.params.doctorName);

        const records = await MedicalRecord.find({ doctorName })
            .populate('ownerId', 'email phone')
            .sort({ date: -1 })
            .lean();

        const formattedRecords = records.map(record => ({
            ...record,
            ownerEmail: record.ownerId?.email || '',
            ownerPhone: record.ownerId?.phone || '',
            ownerId: record.ownerId?._id || record.ownerId
        }));

        res.status(200).json({
            success: true,
            count: formattedRecords.length,
            data: formattedRecords,
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
