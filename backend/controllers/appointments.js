const { admin, db } = require("../db");

// @desc    Цаг шинээр захиалах
// @route   POST /api/v1/appointments
// @access  Public
exports.createAppointment = async (req, res, next) => {
    try {
        const { petName, reason, ownerId, doctorId, scheduleId } = req.body;

        if (!ownerId || !doctorId || !scheduleId) {
            return res.status(400).json({
                success: false,
                error: "Эзэмшигчийн ID, Эмчийн ID, Цагийн хуваарь (scheduleId) заавал шаардлагатай",
            });
        }

        // Fetch the schedule
        const scheduleRef = db.ref("doctor_schedules").child(scheduleId);
        const scheduleDoc = await scheduleRef.once("value");

        if (!scheduleDoc.exists()) {
            return res.status(404).json({
                success: false,
                error: "Цагийн хуваарь олдсонгүй",
            });
        }

        const scheduleData = scheduleDoc.val();

        if (scheduleData.isBooked) {
            return res.status(400).json({
                success: false,
                error: "Энэ цаг хэдийнээ захиалагдсан байна. Өөр цаг сонгоно уу.",
            });
        }

        // Create appointment using the schedule's exact date
        const newAppointment = {
            petName,
            date: scheduleData.date,
            reason,
            ownerId,
            doctorId,
            scheduleId,
            createdAt: admin.database.ServerValue.TIMESTAMP
        };

        const newApptRef = await db.ref("appointments").push(newAppointment);

        // Mark schedule as booked
        await scheduleRef.update({ isBooked: true });

        res.status(201).json({
            success: true,
            data: { _id: newApptRef.key, ...newAppointment },
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
};

// @desc    Тодорхой хэрэглэгчийн захиалсан цагуудыг авах
// @route   GET /api/v1/appointments/user/:userId
// @access  Public
exports.getUserAppointments = async (req, res, next) => {
    try {
        const snapshot = await db.ref("appointments")
            .orderByChild("ownerId")
            .equalTo(req.params.userId)
            .once("value");

        const appointments = [];

        if (snapshot.exists()) {
            // Manual populate for doctorId
            for (const [key, data] of Object.entries(snapshot.val())) {
                let doctorData = null;

                if (data.doctorId) {
                    const doctorDoc = await db.ref("users").child(data.doctorId).once("value");
                    if (doctorDoc.exists()) {
                        const docInfo = doctorDoc.val();
                        doctorData = {
                            _id: doctorDoc.key,
                            firstname: docInfo.firstname,
                            lastname: docInfo.lastname
                        };
                    }
                }

                appointments.push({
                    _id: key,
                    ...data,
                    doctorId: doctorData || data.doctorId
                });
            }

            // Client-side sort by date ASC
            appointments.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
        }

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

// @desc    Тодорхой эмчийн дээрх бүх захиалгыг авах
// @route   GET /api/v1/appointments/doctor/:doctorId
// @access  Public
exports.getDoctorAppointments = async (req, res, next) => {
    try {
        const snapshot = await db.ref("appointments")
            .orderByChild("doctorId")
            .equalTo(req.params.doctorId)
            .once("value");

        const appointments = [];

        if (snapshot.exists()) {
            // Manual populate for ownerId
            for (const [key, data] of Object.entries(snapshot.val())) {
                let ownerData = null;

                if (data.ownerId) {
                    const ownerDoc = await db.ref("users").child(data.ownerId).once("value");
                    if (ownerDoc.exists()) {
                        const ownerInfo = ownerDoc.val();
                        ownerData = {
                            _id: ownerDoc.key,
                            firstname: ownerInfo.firstname,
                            lastname: ownerInfo.lastname,
                            phone: ownerInfo.phone,
                            email: ownerInfo.email
                        };
                    }
                }

                appointments.push({
                    _id: key,
                    ...data,
                    ownerId: ownerData || data.ownerId
                });
            }

            // Client-side sort by date ASC
            appointments.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
        }

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

// @desc    Захиалга устгах (эмч бүртгэсний дараа)
// @route   DELETE /api/v1/appointments/:id
// @access  Public
exports.deleteAppointment = async (req, res, next) => {
    try {
        const apptRef = db.ref("appointments").child(req.params.id);
        const apptDoc = await apptRef.once("value");

        if (!apptDoc.exists()) {
            return res.status(404).json({ success: false, error: "Захиалга олдсонгүй" });
        }

        const apptData = apptDoc.val();

        // Цагийн хуваарийг чөлөөлөх
        if (apptData.scheduleId) {
            await db.ref("doctor_schedules").child(apptData.scheduleId).update({ isBooked: false });
        }

        await apptRef.remove();

        res.status(200).json({ success: true, message: "Захиалга амжилттай устгагдлаа" });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
