const mongoose = require('mongoose');

const MedicalRecordSchema = new mongoose.Schema({
  petId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  diagnosis: {
    type: String,
    required: [true, 'Онош оруулна уу']
  },
  treatment: {
    type: String,
    required: [true, 'Эмчилгээ оруулна уу']
  },
  notes: {
    type: String
  },
  followUpDate: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MedicalRecord', MedicalRecordSchema);
