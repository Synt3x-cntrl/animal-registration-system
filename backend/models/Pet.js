const mongoose = require('mongoose');

const PetSchema = new mongoose.Schema({
    name: { type: String, required: true },
    species: { type: String },
    birthdate: { type: String },
    age: { type: String },
    gender: { type: String },
    breed: { type: String },
    color: { type: String },
    weight: { type: Number },
    imageUrl: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pet', PetSchema);
