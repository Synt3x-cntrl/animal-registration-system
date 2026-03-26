const User = require("../models/User");
const Pet = require("../models/Pet");
const Appointment = require("../models/Appointment");
const MedicalRecord = require("../models/MedicalRecord");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


exports.register = async (req, res, next) => {
    try {
        const { firstname, lastname, email, phone, password, role } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: "Энэ имэйл хаягаар бүртгэл үүссэн байна",
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            firstname,
            lastname,
            email,
            phone,
            password: hashedPassword,
            role: role || "user"
        });

        const userObj = newUser.toObject();
        delete userObj.password;

        res.status(200).json({
            success: true,
            message: "Амжилттай бүртгэгдлээ",
            user: userObj,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: "Имэйл болон нууц үгээ оруулна уу",
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                error: "Имэйл эсвэл нууц үг буруу байна",
            });
        }

        if (!user.password) {
            return res.status(401).json({
                success: false,
                error: "Энэ хаяг нууц үггүй (Gmail гэх мэтээр бүртгүүлсэн) байна. Нууц үгээр нэвтрэх боломжгүй.",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: "Имэйл эсвэл нууц үг буруу байна",
            });
        }

        const userObj = user.toObject();
        delete userObj.password;

        res.status(200).json({
            success: true,
            message: "Амжилттай нэвтэрлээ",
            user: userObj,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
};

exports.getUsers = async (req, res, next) => {
    try {
        const query = {};
        if (req.query.role) query.role = req.query.role;

        const users = await User.find(query).select('-password');

        res.status(200).json({
            success: true,
            count: users.length,
            data: users,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: "Хэрэглэгчдийн мэдээллийг татахад алдаа гарлаа",
        });
    }
};

exports.deleteUser = async (req, res, next) => {
    try {
        const userId = req.params.id;
        
        await User.findByIdAndDelete(userId);

        res.status(200).json({
            success: true,
            data: {},
            message: "Хэрэглэгч амжилттай устгагдлаа"
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
};

exports.updateUser = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const updates = req.body;
        
        if (updates.password) {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(updates.password, salt);
        }

        await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true });
        
        res.status(200).json({
            success: true,
            message: "Хэрэглэгчийн мэдээлэл шинэчлэгдлээ"
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
};

exports.getAdminStats = async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalDoctors = await User.countDocuments({ role: 'doctor' });
        const totalPets = await Pet.countDocuments();
        const totalAppointments = await Appointment.countDocuments();
        const totalRecords = await MedicalRecord.countDocuments();

        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const petsLast24h = await Pet.countDocuments({ createdAt: { $gte: oneDayAgo } });

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalDoctors,
                totalPets,
                totalAppointments,
                totalRecords,
                petsLast24h
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: "Админ статистик татахад алдаа гарлаа",
        });
    }
};

exports.googleLogin = async (req, res, next) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({ success: false, error: "Token шаардлагатай" });
        }

        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { email, given_name, family_name, picture } = ticket.getPayload();

        let user = await User.findOne({ email });

        if (!user) {
            // Create user if not exists
            user = await User.create({
                firstname: given_name,
                lastname: family_name || "",
                email,
                role: "user",
                imageUrl: picture
            });
        }

        const userObj = user.toObject();
        if (userObj.password) delete userObj.password;

        res.status(200).json({
            success: true,
            message: "Google-ээр амжилттай нэвтэрлээ",
            user: userObj
        });
    } catch (error) {
        console.error("Google login error:", error);
        res.status(400).json({
            success: false,
            error: "Google нэвтрэлт амжилтгүй боллоо"
        });
    }
};

