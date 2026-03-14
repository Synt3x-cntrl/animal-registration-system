const { admin } = require("../db");

const db = admin.database();

// @desc    Эмнэлгийн үзлэг шинээр нэмэх
// @route   POST /api/v1/medical-records
// @access  Public
exports.createRecord = async (req, res, next) => {
    try {
        const { petName, doctorName, date, symptoms, diagnosis, treatment, ownerEmail, ownerId } = req.body;

        let finalOwnerId = ownerId;

        // Эмч имэйлээр нь хайж оруулж байвал
        if (ownerEmail) {
            const snapshot = await db.ref("users").orderByChild("email").equalTo(ownerEmail).limitToFirst(1).once("value");
            if (!snapshot.exists()) {
                return res.status(404).json({
                    success: false,
                    error: `Имэйл хаягаар хэрэглэгч олдсонгүй: ${ownerEmail}`
                });
            }

            snapshot.forEach(childSnapshot => {
                finalOwnerId = childSnapshot.key;
            });
        }

        if (!finalOwnerId) {
            return res.status(400).json({
                success: false,
                error: "Эзэмшигчийн ID (ownerId) эсвэл Имэйл (ownerEmail) заавал шаардлагатай",
            });
        }

        const newRecord = {
            petName,
            doctorName,
            date,
            symptoms,
            diagnosis,
            treatment,
            ownerId: finalOwnerId,
            createdAt: admin.database.ServerValue.TIMESTAMP
        };

        const newRecordRef = await db.ref("medical_records").push(newRecord);

        res.status(201).json({
            success: true,
            data: { _id: newRecordRef.key, ...newRecord },
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
};

// @desc    Тодорхой хэрэглэгчийн эмнэлгийн түүхийг авах
// @route   GET /api/v1/medical-records/user/:userId
// @access  Public
exports.getUserRecords = async (req, res, next) => {
    try {
        const snapshot = await db.ref("medical_records")
            .orderByChild("ownerId")
            .equalTo(req.params.userId)
            .once("value");

        const records = [];

        if (snapshot.exists()) {
            // Хэрэглэгчийн мэдээллийг нэг удаа татах
            const ownerDoc = await db.ref("users").child(req.params.userId).once("value");
            const ownerInfo = ownerDoc.exists() ? ownerDoc.val() : {};

            snapshot.forEach(childSnapshot => {
                records.push({
                    _id: childSnapshot.key,
                    ...childSnapshot.val(),
                    ownerEmail: ownerInfo.email || '',
                    ownerPhone: ownerInfo.phone || '',
                });
            });

            // Sort manually by date DESC
            records.sort((a, b) => {
                const dateA = new Date(a.date || 0);
                const dateB = new Date(b.date || 0);
                return dateB - dateA;
            });
        }

        res.status(200).json({
            success: true,
            count: records.length,
            data: records,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
};

// @desc    Эмчийн бүртгэсэн бүх эмнэлгийн түүхийг авах
// @route   GET /api/v1/medical-records/doctor/:doctorName
// @access  Public
exports.getDoctorRecords = async (req, res, next) => {
    try {
        const doctorName = decodeURIComponent(req.params.doctorName);

        const snapshot = await db.ref("medical_records")
            .orderByChild("doctorName")
            .equalTo(doctorName)
            .once("value");

        const records = [];

        if (snapshot.exists()) {
            // Хэрэглэгчдийн мэдээллийг cache хийх
            const ownerCache = {};

            for (const [key, data] of Object.entries(snapshot.val())) {
                let ownerEmail = '';
                let ownerPhone = '';

                if (data.ownerId) {
                    if (!ownerCache[data.ownerId]) {
                        const ownerDoc = await db.ref("users").child(data.ownerId).once("value");
                        ownerCache[data.ownerId] = ownerDoc.exists() ? ownerDoc.val() : {};
                    }
                    const ownerInfo = ownerCache[data.ownerId];
                    ownerEmail = ownerInfo.email || '';
                    ownerPhone = ownerInfo.phone || '';
                }

                records.push({
                    _id: key,
                    ...data,
                    ownerEmail,
                    ownerPhone,
                });
            }

            records.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
        }

        res.status(200).json({
            success: true,
            count: records.length,
            data: records,
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
