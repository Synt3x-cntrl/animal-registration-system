const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const authRouter = require("./Routes/auth");
const petsRouter = require("./Routes/pets");
const medicalRecordsRouter = require("./Routes/medicalRecords");
const appointmentsRouter = require("./Routes/appointments");
const doctorSchedulesRouter = require("./Routes/doctorSchedules");
const { connectDB } = require("./db");

if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: "./config/config.env" });
}
connectDB();
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/pets", petsRouter);
app.use("/api/v1/medical-records", medicalRecordsRouter);
app.use("/api/v1/appointments", appointmentsRouter);
app.use("/api/v1/doctor-schedules", doctorSchedulesRouter);

// Health check route
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend server is running correctly",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
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
const PORT = process.env.PORT || 5000;
// Only start the server locally or in non-serverless environments
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Express server ${PORT} порт дээр аслаа.`);
  });
}

module.exports = app;
