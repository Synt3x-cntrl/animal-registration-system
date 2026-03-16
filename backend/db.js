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
    
    // 1. Basic normalization
    let formattedKey = rawKey.trim();
    if (formattedKey.startsWith('"') && formattedKey.endsWith('"')) {
      formattedKey = formattedKey.slice(1, -1);
    }
    
    // 2. Handle literal \n strings (common in Vercel/CI)
    formattedKey = formattedKey.replace(/\\n/g, '\n');
    
    // 3. Robust PEM Formatting: Re-wrap if it's all on one line or mangled
    // PEM keys MUST have newlines every 64 chars to be parsed correctly by some ASN.1 decoders
    try {
      const header = "-----BEGIN PRIVATE KEY-----";
      const footer = "-----END PRIVATE KEY-----";
      
      // If it doesn't look like a standard multi-line PEM, re-format it
      if (!formattedKey.includes('\n') || formattedKey.split('\n').length < 5) {
        console.log("Re-formatting single-line/mangled private key...");
        
        let body = formattedKey;
        if (body.includes(header)) body = body.split(header)[1];
        if (body.includes(footer)) body = body.split(footer)[0];
        
        // Remove ALL whitespace and existing newlines from the body
        body = body.replace(/\s+/g, '');
        
        // Re-wrap at 64 characters
        let wrappedBody = "";
        for (let i = 0; i < body.length; i += 64) {
          wrappedBody += body.substring(i, i + 64) + "\n";
        }
        
        formattedKey = `${header}\n${wrappedBody}${footer}\n`;
      }
    } catch (pemError) {
      console.warn("PEM formatter encountered an issue, using original formatted key:", pemError.message);
    }
    
    serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: formattedKey,
    };
    
    console.log("Final private key length:", serviceAccount.privateKey.length);
    console.log("Final key starts with BEGIN:", serviceAccount.privateKey.startsWith('-----BEGIN PRIVATE KEY-----'));
    console.log("Final key ends with END:", serviceAccount.privateKey.trim().endsWith('-----END PRIVATE KEY-----'));
    console.log("First line of final key:", serviceAccount.privateKey.split('\n')[0]);

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
