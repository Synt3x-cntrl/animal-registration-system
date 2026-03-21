const express = require('express');
const { createDailySummary, getDoctorSummaries } = require('../controllers/dailySummaries');

const router = express.Router();

router.post('/', createDailySummary);
router.get('/doctor/:doctorId', getDoctorSummaries);

module.exports = router;
