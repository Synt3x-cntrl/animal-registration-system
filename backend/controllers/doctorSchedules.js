const DoctorSchedule = require("../models/DoctorSchedule");

exports.createSchedule = async (req, res, next) => {
    try {
        const { doctorId, date } = req.body;

        if (!doctorId || !date) {
            return res.status(400).json({
                success: false,
                error: "Эмчийн ID болон Огноо (он сар өдөр цаг минут) заавал шаардлагатай",
            });
        }

        const exists = await DoctorSchedule.findOne({ doctorId, date });

        if (exists) {
            return res.status(400).json({
                success: false,
                error: "Энэ цаг дээр хуваарь үүссэн байна.",
            });
        }

        const newSchedule = await DoctorSchedule.create({
            doctorId,
            date
        });

        res.status(201).json({
            success: true,
            data: newSchedule,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
};

exports.getDoctorSchedules = async (req, res, next) => {
    try {
        let query = { doctorId: req.params.doctorId };
        if (req.query.isBooked !== undefined) {
            query.isBooked = req.query.isBooked === 'true';
        }

        const schedules = await DoctorSchedule.find(query).sort({ date: 1 }).lean();

        res.status(200).json({
            success: true,
            count: schedules.length,
            data: schedules,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
};

exports.deleteSchedule = async (req, res, next) => {
    try {
        const doc = await DoctorSchedule.findById(req.params.id);

        if (!doc) {
            return res.status(404).json({
                success: false,
                error: `Хуваарь олдсонгүй id: ${req.params.id}`,
            });
        }

        if (doc.isBooked) {
            return res.status(400).json({
                success: false,
                error: "Захиалга хийгдсэн цагийг устгах боломжгүй",
            });
        }

        await DoctorSchedule.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            data: {},
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
};
