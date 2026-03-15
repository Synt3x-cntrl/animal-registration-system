const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

// Initialize Firebase App
try {
  let serviceAccount;
  const serviceAccountPath = path.join(__dirname, 'firebaseServiceAccountKey.json');
  
  const dbURL = process.env.FIREBASE_DATABASE_URL || "https://d-yd-ca786-default-rtdb.firebaseio.com";
  console.log("--- Firebase Diagnostics ---");
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("VERCEL:", !!process.env.VERCEL);
  console.log("FIREBASE_PROJECT_ID found:", !!process.env.FIREBASE_PROJECT_ID);
  console.log("FIREBASE_CLIENT_EMAIL found:", !!process.env.FIREBASE_CLIENT_EMAIL);
  console.log("FIREBASE_PRIVATE_KEY found:", !!process.env.FIREBASE_PRIVATE_KEY);
  console.log("FIREBASE_DATABASE_URL found:", !!process.env.FIREBASE_DATABASE_URL);

  let rawKey = process.env.FIREBASE_PRIVATE_KEY || "";
  console.log("FIREBASE_PRIVATE_KEY raw length:", rawKey.length);
  if (rawKey.length > 0) {
    console.log("FIREBASE_PRIVATE_KEY starts with:", rawKey.substring(0, 20));
    console.log("FIREBASE_PRIVATE_KEY ends with:", rawKey.substring(rawKey.length - 20));
  }
  
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

    if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
      console.error("Missing critical Firebase env vars:", {
        projectId: !!serviceAccount.projectId,
        clientEmail: !!serviceAccount.clientEmail,
        privateKey: !!serviceAccount.privateKey
      });
    }
  } else {
    console.warn('Firebase credentials not found (no JSON file and no env vars)');
    if (process.env.VERCEL) {
      console.error('CRITICAL: Environment variables are likely not set in Vercel Dashboard');
    }
  }

  if (serviceAccount && !admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: dbURL
    });
    console.log("Firebase App initialized successfully.");
  }
} catch (error) {
  console.error("Firebase critical error during require/init:", error.stack || error.message);
}

const connectDB = async () => {
  try {
    if (admin.apps.length) {
      console.log(`Firebase Realtime Database холбогдлоо.`);
    } else {
      console.warn('Firebase App is not initialized.');
    }
  } catch (err) {
    console.error('Error in connectDB:', err.message);
  }
};

let db;
try {
  if (admin.apps.length) {
    db = admin.database();
  } else {
    // Provide a helpful object that throws clear errors if used
    db = {
      ref: () => { 
        throw new Error("Өгөгдлийн сантай холбогдож чадсангүй. Vercel дээр Environment Variables (FIREBASE_PRIVATE_KEY г.м) тохируулсан эсэхээ шалгана уу."); 
      }
    };
  }
} catch (e) {
  console.error("Error accessing Firebase database:", e.message);
  db = {
    ref: () => { throw new Error("Firebase-д хандахад алдаа гарлаа: " + e.message); }
  };
}

module.exports = { connectDB, admin, db };
