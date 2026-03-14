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
const PORT = process.env.PORT || 5000;
// Only start the server locally or in non-serverless environments
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Express server ${PORT} порт дээр аслаа.`);
  });
}

module.exports = app;
