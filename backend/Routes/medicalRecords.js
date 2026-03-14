const express = require("express");
const { createRecord, getUserRecords, getDoctorRecords } = require("../controllers/medicalRecords");

const router = express.Router();

router.post("/", createRecord);
router.get("/user/:userId", getUserRecords);
router.get("/doctor/:doctorName", getDoctorRecords);

module.exports = router;
