const { admin } = require("../db");

const db = admin.database();

// @desc    Амьтан шинээр нэмэх
// @route   POST /api/v1/pets
// @access  Public
exports.createPet = async (req, res, next) => {
    try {
        const { name, species, age, gender, imageUrl, owner } = req.body;

        if (!owner) {
            return res.status(400).json({
                success: false,
                error: "Эзэмшигчийн ID (owner) заавал шаардлагатай",
            });
        }

        const newPet = {
            name,
            species,
            age,
            gender,
            imageUrl,
            owner,
            createdAt: admin.database.ServerValue.TIMESTAMP
        };

        const newPetRef = await db.ref("pets").push(newPet);

        res.status(201).json({
            success: true,
            data: { _id: newPetRef.key, ...newPet },
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
};

// @desc    Тодорхой хэрэглэгчийн амьтдыг авах
// @route   GET /api/v1/pets/user/:userId
// @access  Public
exports.getUserPets = async (req, res, next) => {
    try {
        const snapshot = await db.ref("pets")
            .orderByChild("owner")
            .equalTo(req.params.userId)
            .once("value");

        const pets = [];

        if (snapshot.exists()) {
            snapshot.forEach(childSnapshot => {
                const petData = childSnapshot.val();
                pets.push({
                    _id: childSnapshot.key,
                    ...petData,
                    createdAt: petData.createdAt ? new Date(petData.createdAt).toISOString() : undefined
                });
            });

            // Sort manually by createdAt DESC since Realtime DB only allows one orderBy
            pets.sort((a, b) => {
                const dateA = new Date(a.createdAt || 0);
                const dateB = new Date(b.createdAt || 0);
                return dateB - dateA;
            });
        }

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

// @desc    Бүх амьтдын мэдээллийг авах (Админ эрхтэй)
// @route   GET /api/v1/pets
// @access  Public (should be protected in real app)
exports.getAllPets = async (req, res, next) => {
    try {
        const snapshot = await db.ref("pets").once("value");
        const pets = [];

        if (snapshot.exists()) {
            snapshot.forEach(childSnapshot => {
                const petData = childSnapshot.val();
                pets.push({
                    _id: childSnapshot.key,
                    ...petData,
                    createdAt: petData.createdAt ? new Date(petData.createdAt).toISOString() : undefined
                });
            });

            pets.sort((a, b) => {
                const dateA = new Date(a.createdAt || 0);
                const dateB = new Date(b.createdAt || 0);
                return dateB - dateA;
            });
        }

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

// @desc    Амьтан устгах (Админ эсвэл эзэмшигч)
// @route   DELETE /api/v1/pets/:id
// @access  Public
exports.deletePet = async (req, res, next) => {
    try {
        const petId = req.params.id;
        
        await db.ref('pets').child(petId).remove();
        
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
