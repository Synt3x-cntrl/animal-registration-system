const admin = require("firebase-admin");
const path = require("path");

// Initialize Firebase App immediately
try {
  const serviceAccountPath = path.join(__dirname, 'firebaseServiceAccountKey.json');
  const serviceAccount = require(serviceAccountPath);

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://d-yd-ca786-default-rtdb.firebaseio.com"
    });
  }
} catch (error) {
  console.error("Firebase Service Account key not found or invalid.", error.message);
}

const connectDB = async () => {
  if (admin.apps.length) {
    console.log(`Firebase гэрээ амжилттай холбогдлоо.`);
  } else {
    console.log('Firebase холбогдож чадсангүй. Та firebaseServiceAccountKey.json файлаа my-backend фолдерт хийсэн эсэхээ шалгана уу.');
  }
};

const db = admin.database();
module.exports = { connectDB, admin };
