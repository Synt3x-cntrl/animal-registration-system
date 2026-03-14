const { admin, db } = require("../db");
const bcrypt = require("bcryptjs");

exports.register = async (req, res, next) => {
    try {
        const { firstname, lastname, email, phone, password, role } = req.body;

        // Check if user exists in Realtime DB
        const usersRef = db.ref('users');
        const snapshot = await usersRef.orderByChild('email').equalTo(email).once('value');

        if (snapshot.exists()) {
            return res.status(400).json({
                success: false,
                error: "Энэ имэйл хаягаар бүртгэл үүссэн байна",
            });
        }

        // 1. Create user in Firebase Authentication
        let firebaseUser;
        try {
            firebaseUser = await admin.auth().createUser({
                email: email,
                password: password,
                displayName: `${lastname} ${firstname}`,
                phoneNumber: phone ? (phone.startsWith('+') ? phone : `+976${phone}`) : undefined
            });
        } catch (authErr) {
            firebaseUser = await admin.auth().createUser({
                email: email,
                password: password,
                displayName: `${lastname} ${firstname}`
            });
        }

        // 2. Hash password for Web Login
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
            firstname,
            lastname,
            email,
            phone,
            password: hashedPassword,
            role: role || "user",
            createdAt: admin.database.ServerValue.TIMESTAMP
        };

        // 3. Save extra user data to Realtime DB with the SAME ID as Firebase Auth
        await usersRef.child(firebaseUser.uid).set(newUser);

        const user = { _id: firebaseUser.uid, ...newUser };
        delete user.password;

        res.status(200).json({
            success: true,
            message: "Амжилттай бүртгэгдлээ",
            user,
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

        const usersRef = db.ref('users');
        const snapshot = await usersRef.orderByChild('email').equalTo(email).limitToFirst(1).once('value');

        if (!snapshot.exists()) {
            return res.status(401).json({
                success: false,
                error: "Имэйл эсвэл нууц үг буруу байна",
            });
        }

        let docId = null;
        let userData = null;
        snapshot.forEach(childSnapshot => {
            docId = childSnapshot.key;
            userData = childSnapshot.val();
        });

        if (!userData || !userData.password) {
            return res.status(401).json({
                success: false,
                error: "Энэ хаяг нууц үггүй (Gmail гэх мэтээр бүртгүүлсэн) байна. Нууц үгээр нэвтрэх боломжгүй.",
            });
        }

        const isMatch = await bcrypt.compare(password, userData.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: "Имэйл эсвэл нууц үг буруу байна",
            });
        }

        const user = { _id: docId, ...userData };
        delete user.password;

        res.status(200).json({
            success: true,
            message: "Амжилттай нэвтэрлээ",
            user,
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
        const usersRef = db.ref('users');
        const snapshot = await usersRef.once('value');
        const users = [];

        if (snapshot.exists()) {
            snapshot.forEach(childSnapshot => {
                const userData = childSnapshot.val();

                // Filter by role manually if provided (Realtime DB doesn't support multiple orderBys easily)
                if (req.query.role && userData.role !== req.query.role) {
                    return; // Skip this user
                }

                delete userData.password;
                users.push({
                    _id: childSnapshot.key,
                    ...userData,
                    createdAt: userData.createdAt ? new Date(userData.createdAt).toISOString() : undefined
                });
            });
        }

        res.status(200).json({
            success: true,
            count: users.length,
            data: users,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
};

// @desc    Хэрэглэгчийг устгах (Админ эрхтэй)
// @route   DELETE /api/v1/auth/users/:id
exports.deleteUser = async (req, res, next) => {
    try {
        const userId = req.params.id;
        
        // Remove from Realtime DB
        await db.ref('users').child(userId).remove();
        
        // Remove from Firebase Auth (Optional depending on requirements, but good practice for full cleanup)
        try {
            await admin.auth().deleteUser(userId);
        } catch (authError) {
            console.error("Firebase Auth delete error (might not exist):", authError);
        }

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

// @desc    Хэрэглэгчийн мэдээлэл засах (Админ эрхтэй)
// @route   PUT /api/v1/auth/users/:id
exports.updateUser = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const updates = req.body;
        
        if (updates.password) {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(updates.password, salt);
            
            // Also try to update in Firebase auth if possible
            try {
                await admin.auth().updateUser(userId, {
                    password: req.body.password
                });
            } catch (err) {
                 console.error("Auth update password optional fail", err);
            }
        }

        await db.ref('users').child(userId).update(updates);
        
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
