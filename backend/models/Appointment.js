const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    petName: { type: String, required: true },
    date: { type: String, required: true },
    reason: { type: String },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'DoctorSchedule' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
