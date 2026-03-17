const Pet = require("../models/Pet");

exports.createPet = async (req, res, next) => {
    try {
        const { name, species, age, gender, imageUrl, owner } = req.body;

        if (!owner) {
            return res.status(400).json({
                success: false,
                error: "Эзэмшигчийн ID (owner) заавал шаардлагатай",
            });
        }

        const newPet = await Pet.create({
            name,
            species,
            age,
            gender,
            imageUrl,
            owner
        });

        res.status(201).json({
            success: true,
            data: newPet,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
};

exports.getUserPets = async (req, res, next) => {
    try {
        const pets = await Pet.find({ owner: req.params.userId }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: pets.length,
            data: pets,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
};

exports.getAllPets = async (req, res, next) => {
    try {
        const pets = await Pet.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: pets.length,
            data: pets,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
};

exports.deletePet = async (req, res, next) => {
    try {
        const petId = req.params.id;
        
        await Pet.findByIdAndDelete(petId);
        
        res.status(200).json({
            success: true,
            data: {},
            message: "Амьтны мэдээлэл амжилттай устгагдлаа"
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
};
