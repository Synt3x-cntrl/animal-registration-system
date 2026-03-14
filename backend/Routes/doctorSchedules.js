const express = require("express");
const { createSchedule, getDoctorSchedules, deleteSchedule } = require("../controllers/doctorSchedules");

const router = express.Router();

router.post("/", createSchedule);
router.get("/:doctorId", getDoctorSchedules);
router.delete("/:id", deleteSchedule);

module.exports = router;
