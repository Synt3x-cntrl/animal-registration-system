const mongoose = require('mongoose');

const DailySummarySchema = new mongoose.Schema({
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // 'YYYY-MM-DD'
    totalPatientsSeen: { type: Number, default: 0 },
    records: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MedicalRecord' }],
    notes: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DailySummary', DailySummarySchema);
