const DailySummary = require('../models/DailySummary');
const MedicalRecord = require('../models/MedicalRecord');

// Өдрийн тайлан хадгалах
exports.createDailySummary = async (req, res) => {
    try {
        const { doctorId, doctorName, date, notes } = req.body;

        if (!doctorId || !doctorName || !date) {
            return res.status(400).json({ success: false, error: 'Эмчийн мэдээлэл болон огноо шаардлагатай.' });
        }

        // Тухайн өдөр тухайн эмчийн үүсгэсэн үзлэгийн түүхийг шүүж олох
        const records = await MedicalRecord.find({ 
            doctorName: doctorName,
            date: date 
        });

        const recordIds = records.map(record => record._id);

        const newSummary = await DailySummary.create({
            doctorId,
            date,
            totalPatientsSeen: records.length,
            records: recordIds,
            notes
        });

        res.status(201).json({
            success: true,
            data: newSummary
        });
    } catch (error) {
        console.error('Өдрийн тайлан хадгалахад алдаа:', error);
        res.status(500).json({ success: false, error: 'Серверийн алдаа.' });
    }
};

// Эмчийн бүх тайланг татах
exports.getDoctorSummaries = async (req, res) => {
    try {
        const { doctorId } = req.params;

        const summaries = await DailySummary.find({ doctorId })
            .populate('records')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: summaries
        });
    } catch (error) {
        console.error('Тайлан татахад алдаа:', error);
        res.status(500).json({ success: false, error: 'Серверийн алдаа.' });
    }
};
