const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    petName: { type: String, required: true },
    petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
    date: { type: String, required: true },
    reason: { type: String },
    serviceType: { type: String, default: 'Examination' }, // 'Examination', 'Bathing', 'Grooming', 'NailClipping' etc.
    status: { type: String, default: 'Booked' }, // 'Booked', 'Completed', 'Cancelled'
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional for non-medical services
    scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'DoctorSchedule' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
