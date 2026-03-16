const express = require("express");
const cors = require("cors");
const path = require("path");

// Load environment variables IMMEDIATELY (before other local imports)
if (process.env.NODE_ENV !== "production") {
  const envPath = path.join(__dirname, "config/config.env");
  console.log("Loading env from:", envPath);
  require("dotenv").config({ path: envPath });
}

const authRouter = require("./Routes/auth");
const petsRouter = require("./Routes/pets");
const medicalRecordsRouter = require("./Routes/medicalRecords");
const appointmentsRouter = require("./Routes/appointments");
const doctorSchedulesRouter = require("./Routes/doctorSchedules");
const { connectDB, testDatabaseConnection } = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// Initialize DB connection test on startup (non-blocking)
connectDB().catch(err => console.error("Initial DB connection test failed:", err.message));

// API Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/pets", petsRouter);
app.use("/api/v1/medical-records", medicalRecordsRouter);
app.use("/api/v1/appointments", appointmentsRouter);
app.use("/api/v1/doctor-schedules", doctorSchedulesRouter);

// Health check route - Real DB probe
app.get("/api/v1/health", async (req, res) => {
  const dbStatus = await testDatabaseConnection();
  
  res.status(dbStatus.connected ? 200 : 503).json({
    success: dbStatus.connected,
    message: dbStatus.connected ? "Backend server is healthy" : "Backend server has DB issues",
    firebase: dbStatus,
    env: process.env.NODE_ENV,
    vercel: !!process.env.VERCEL,
    timestamp: new Date().toISOString()
  });
});

// 404 Handler for API
app.use("/api/v1", (req, res) => {
  res.status(404).json({
    success: false,
    error: `API path ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Дотоод серверт алдаа гарлаа (Server Error)",
  });
});

const PORT = process.env.PORT || 4000;
// Only start the server locally or in non-serverless environments
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Express server ${PORT} порт дээр аслаа.`);
  });
}

module.exports = app;
