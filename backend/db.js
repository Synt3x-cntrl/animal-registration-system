const mongoose = require("mongoose");
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb+srv://shijir09:shijir1234@bookstore.phfc9bg.mongodb.net/amitani_delguur";
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return { connected: true };
  } catch (err) {
    console.error("MongoDB Connection Error:", err.message);
    return { connected: false, error: err.message };
  }
};

const testDatabaseConnection = async () => {
    try {
        if (mongoose.connection.readyState === 1) {
            return { connected: true, timestamp: new Date().toISOString() };
        }
        return { connected: false, error: "MongoDB not connected" };
    } catch (err) {
        return { connected: false, error: err.message };
    }
};

module.exports = { connectDB, testDatabaseConnection };
