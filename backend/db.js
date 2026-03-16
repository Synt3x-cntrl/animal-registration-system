const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

// Initialize Firebase App
try {
  let serviceAccount;
  const serviceAccountPath = path.join(__dirname, 'firebaseServiceAccountKey.json');
  
  const dbURL = process.env.FIREBASE_DATABASE_URL || "https://d-yd-ca786-default-rtdb.firebaseio.com";
  console.log("--- Firebase Diagnostics v2 ---");
  console.log("FIREBASE_PROJECT_ID:", !!process.env.FIREBASE_PROJECT_ID);
  
  let rawKey = process.env.FIREBASE_PRIVATE_KEY || "";
  console.log("Raw Key Length:", rawKey.length);
  
  if (fs.existsSync(serviceAccountPath)) {
    console.log("Using local JSON file");
    serviceAccount = require(serviceAccountPath);
  } else if (rawKey) {
    console.log("Using Environment Variables");
    
    // 1. Strip all literal "\n" and real newlines/spaces to get the raw content
    let cleanKey = rawKey.replace(/\\n/g, '').replace(/\s+/g, '');
    
    // 2. Identify the Base64 body
    const header = "-----BEGINPRIVATEKEY-----";
    const footer = "-----ENDPRIVATEKEY-----";
    
    let body = cleanKey;
    if (body.includes(header)) body = body.split(header)[1];
    if (body.includes(footer)) body = body.split(footer)[0];
    
    // 3. Re-construct the PEM with EXACT formatting required by ASN.1 decoders
    let formattedKey = "-----BEGIN PRIVATE KEY-----\n";
    for (let i = 0; i < body.length; i += 64) {
      formattedKey += body.substring(i, i + 64) + "\n";
    }
    formattedKey += "-----END PRIVATE KEY-----\n";
    
    console.log("Formatted Key Length:", formattedKey.length);
    console.log("Key Check - BEGIN:", formattedKey.startsWith("-----BEGIN PRIVATE KEY-----"));
    console.log("Key Check - END:", formattedKey.trim().endsWith("-----END PRIVATE KEY-----"));
    
    serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: formattedKey,
    };
  }

  if (serviceAccount && !admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: dbURL
    });
    console.log("Firebase App initialized successfully.");
  }
} catch (error) {
  console.error("Firebase Initialization Error:", error.message);
}

// Helper to test if we can actually read from the DB
const testDatabaseConnection = async () => {
    try {
        if (!admin.apps.length) return { connected: false, error: "Firebase not initialized" };
        
        // Try to read a small piece of data (the '.info/connected' is a special internal ref)
        const snapshot = await admin.database().ref(".info/connected").once("value");
        return { 
            connected: true, 
            value: snapshot.val(),
            timestamp: new Date().toISOString()
        };
    } catch (err) {
        return { connected: false, error: err.message };
    }
};

const connectDB = async () => {
  try {
    const result = await testDatabaseConnection();
    if (result.connected) {
      console.log("Firebase Realtime Database холбогдлоо (холболт амжилттай).");
    } else {
      console.warn("Firebase холболт амжилтгүй эсвэл хүлээгдэж байна:", result.error);
    }
    return result;
  } catch (err) {
    console.error('Firebase connection test failed:', err.message);
    return { connected: false, error: err.message };
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

module.exports = { connectDB, testDatabaseConnection, admin, db };
