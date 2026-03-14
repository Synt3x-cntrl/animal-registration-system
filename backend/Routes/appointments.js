const express = require("express");
const { createAppointment, getUserAppointments, getDoctorAppointments, deleteAppointment } = require("../controllers/appointments");

const router = express.Router();

router.post("/", createAppointment);
router.get("/user/:userId", getUserAppointments);
router.get("/doctor/:doctorId", getDoctorAppointments);
router.delete("/:id", deleteAppointment);

module.exports = router;
