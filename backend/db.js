const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

// Initialize Firebase App
try {
  let serviceAccount;
  const serviceAccountPath = path.join(__dirname, 'firebaseServiceAccountKey.json');
  
  console.log("Checking Firebase env vars...");
  console.log("FIREBASE_PROJECT_ID found:", !!process.env.FIREBASE_PROJECT_ID);
  console.log("FIREBASE_CLIENT_EMAIL found:", !!process.env.FIREBASE_CLIENT_EMAIL);
  console.log("FIREBASE_PRIVATE_KEY found:", !!process.env.FIREBASE_PRIVATE_KEY);

  let rawKey = process.env.FIREBASE_PRIVATE_KEY || "";
  console.log("FIREBASE_PRIVATE_KEY raw length:", rawKey.length);
  
  if (fs.existsSync(serviceAccountPath)) {
    console.log("Using local JSON file for Firebase credentials");
    serviceAccount = require(serviceAccountPath);
  } else if (rawKey) {
    console.log("Using Environment Variables for Firebase credentials");
    
    // Sometimes keys get wrapped in extra quotes in env vars
    let formattedKey = rawKey.trim();
    if (formattedKey.startsWith('"') && formattedKey.endsWith('"')) {
      formattedKey = formattedKey.slice(1, -1);
    }
    
    // Essential for RSA keys: replace literal \n with real newlines
    formattedKey = formattedKey.replace(/\\n/g, '\n');
    
    serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: formattedKey,
    };
    
    console.log("Formatted private key length:", serviceAccount.privateKey.length);
    console.log("Starts with BEGIN:", serviceAccount.privateKey.startsWith('-----BEGIN PRIVATE KEY-----'));
    console.log("Ends with END:", serviceAccount.privateKey.trim().endsWith('-----END PRIVATE KEY-----'));
  } else {
    throw new Error('Firebase credentials not found (no JSON file and no env vars)');
  }

  if (serviceAccount && !admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://d-yd-ca786-default-rtdb.firebaseio.com"
    });
  }
} catch (error) {
  console.error("Firebase initialization error:", error.message);
}

const connectDB = async () => {
  if (admin.apps.length) {
    console.log(`Firebase гэрээ амжилттай холбогдлоо.`);
  } else {
    console.log('Firebase холбогдож чадсангүй. Та firebaseServiceAccountKey.json файлаа backend фолдерт хийсэн эсэхээ шалгана уу эсвэл Vercel дээр Environment Variable тохируулна уу.');
  }
};

const db = admin.database();
module.exports = { connectDB, admin };
