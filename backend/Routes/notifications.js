const express = require('express');
const {
    getNotifications,
    markAsRead,
    markAllAsRead,
    createNotification
} = require('../controllers/notifications');

const router = express.Router();

router.route('/')
    .get(getNotifications)
    .post(createNotification);

router.route('/read-all')
    .put(markAllAsRead);

router.route('/:id/read')
    .put(markAsRead);

module.exports = router;
