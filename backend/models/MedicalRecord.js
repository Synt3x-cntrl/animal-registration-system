const mongoose = require('mongoose');

const MedicalRecordSchema = new mongoose.Schema({
    petName: { type: String, required: true },
    doctorName: { type: String },
    date: { type: String },
    symptoms: { type: String },
    diagnosis: { type: String },
    treatment: { type: String },
    treatments: [{ type: String }],
    notes: { type: String },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MedicalRecord', MedicalRecordSchema);
