const express = require("express");
const { createAppointment, getUserAppointments, getDoctorAppointments, deleteAppointment, updateAppointmentStatus, getAllAppointments } = require("../controllers/appointments");

const router = express.Router();

router.post("/", createAppointment);
router.get("/", getAllAppointments);
router.get("/user/:userId", getUserAppointments);
router.get("/doctor/:doctorId", getDoctorAppointments);
router.put("/:id/status", updateAppointmentStatus);
router.delete("/:id", deleteAppointment);

module.exports = router;
