const express = require('express');
const { getUserStats, getDoctorStats } = require('../controllers/stats');

const router = express.Router();

router.get('/user/:userId', getUserStats);
router.get('/doctor/:doctorId', getDoctorStats);

module.exports = router;
