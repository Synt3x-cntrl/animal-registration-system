const { admin, db } = require("../db");

// @desc    Эмч өөрийн боломжтой цагийг нэмэх
// @route   POST /api/v1/doctor-schedules
// @access  Public
exports.createSchedule = async (req, res, next) => {
    try {
        const { doctorId, date } = req.body;

        if (!doctorId || !date) {
            return res.status(400).json({
                success: false,
                error: "Эмчийн ID болон Огноо (он сар өдөр цаг минут) заавал шаардлагатай",
            });
        }

        const schedulesRef = db.ref("doctor_schedules");

        // Check if exact slot already exists (Realtime DB can only query one child, so query doctorId and filter date)
        const snapshot = await schedulesRef.orderByChild("doctorId").equalTo(doctorId).once("value");
        let exists = false;

        if (snapshot.exists()) {
            snapshot.forEach(child => {
                if (child.val().date === date) {
                    exists = true;
                }
            });
        }

        if (exists) {
            return res.status(400).json({
                success: false,
                error: "Энэ цаг дээр хуваарь үүссэн байна.",
            });
        }

        const newSchedule = {
            doctorId,
            date,
            isBooked: false,
            createdAt: admin.database.ServerValue.TIMESTAMP
        };

        const newScheduleRef = await schedulesRef.push(newSchedule);

        res.status(201).json({
            success: true,
            data: { _id: newScheduleRef.key, ...newSchedule },
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
};

// @desc    Тодорхой эмчийн цагийн хуваарийг авах
// @route   GET /api/v1/doctor-schedules/:doctorId
// @access  Public
exports.getDoctorSchedules = async (req, res, next) => {
    try {
        const snapshot = await db.ref("doctor_schedules")
            .orderByChild("doctorId")
            .equalTo(req.params.doctorId)
            .once("value");

        let schedules = [];

        if (snapshot.exists()) {
            snapshot.forEach(doc => {
                schedules.push({ _id: doc.key, ...doc.val() });
            });

            if (req.query.isBooked !== undefined) {
                const isBooked = req.query.isBooked === 'true';
                schedules = schedules.filter(s => s.isBooked === isBooked);
            }

            schedules.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
        }

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

// @desc    Эмчийн цуцлах (устгах) хуваарь
// @route   DELETE /api/v1/doctor-schedules/:id
// @access  Public
exports.deleteSchedule = async (req, res, next) => {
    try {
        const scheduleRef = db.ref("doctor_schedules").child(req.params.id);
        const doc = await scheduleRef.once("value");

        if (!doc.exists()) {
            return res.status(404).json({
                success: false,
                error: `Хуваарь олдсонгүй id: ${req.params.id}`,
            });
        }

        const scheduleData = doc.val();

        if (scheduleData.isBooked) {
            return res.status(400).json({
                success: false,
                error: "Захиалга хийгдсэн цагийг устгах боломжгүй",
            });
        }

        await scheduleRef.remove();

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
