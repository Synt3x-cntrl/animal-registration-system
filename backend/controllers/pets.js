const Pet = require("../models/Pet");
const User = require("../models/User");

exports.createPet = async (req, res, next) => {
    try {
        const { name, species, birthdate, age, gender, breed, color, weight, imageUrl, owner } = req.body;

        if (!owner) {
            return res.status(400).json({
                success: false,
                error: "Эзэмшигчийн ID (owner) заавал шаардлагатай",
            });
        }

        const newPet = await Pet.create({
            name,
            species,
            birthdate,
            age,
            gender,
            breed,
            color,
            weight,
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

exports.updatePet = async (req, res, next) => {
    try {
        const pet = await Pet.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!pet) {
            return res.status(404).json({
                success: false,
                error: "Амьтан олдсонгүй"
            });
        }

        res.status(200).json({
            success: true,
            data: pet
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
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
        const pets = await Pet.find().populate('owner', 'firstname lastname email phone').sort({ createdAt: -1 });

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

exports.searchPets = async (req, res, next) => {
    try {
        const q = req.query.q;
        if (!q) {
            return res.status(200).json({ success: true, count: 0, data: [] });
        }

        const users = await User.find({ phone: { $regex: q, $options: 'i' } });
        const userIds = users.map(u => u._id);

        const pets = await Pet.find({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { owner: { $in: userIds } }
            ]
        }).populate('owner', 'firstname lastname phone email');

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

exports.requestPassport = async (req, res, next) => {
    try {
        const pet = await Pet.findById(req.params.id);
        if (!pet) {
            return res.status(404).json({ success: false, error: "Амьтан олдсонгүй" });
        }
        
        if (pet.passportStatus !== 'none' && pet.passportStatus !== 'rejected') {
            return res.status(400).json({ success: false, error: "Пасспорт аль хэдийн хүсэлт илгээгдсэн эсвэл зөвшөөрөгдсөн байна" });
        }

        pet.passportStatus = 'requested';
        await pet.save();

        res.status(200).json({ success: true, data: pet, message: "Пасспортын хүсэлт амжилттай илгээгдлээ" });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.getPassportRequests = async (req, res, next) => {
    try {
        const pets = await Pet.find({ passportStatus: 'requested' }).populate('owner', 'firstname lastname phone email');
        
        res.status(200).json({ success: true, count: pets.length, data: pets });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.evaluatePassport = async (req, res, next) => {
    try {
        const { status } = req.body; // 'approved' or 'rejected'
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, error: "Буруу төлөв байна" });
        }

        const pet = await Pet.findById(req.params.id);
        if (!pet) {
            return res.status(404).json({ success: false, error: "Амьтан олдсонгүй" });
        }

        pet.passportStatus = status;
        if (status === 'approved') {
            // Generate a random passport ID (e.g., PAS-MONGOLIA-random)
            pet.passportId = 'PAS-MN-' + Math.random().toString(36).substr(2, 6).toUpperCase();
            pet.passportIssueDate = new Date();
        }

        await pet.save();

        res.status(200).json({ success: true, data: pet, message: "Хүсэлт амжилттай шийдвэрлэгдлээ" });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
