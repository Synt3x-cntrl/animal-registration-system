const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/v1/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
    try {
        const userId = req.query.userId;
        if (!userId) {
            return res.status(400).json({ success: false, error: 'User ID is required' });
        }

        const notifications = await Notification.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(20);

        res.status(200).json({
            success: true,
            count: notifications.length,
            data: notifications
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/v1/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
    try {
        let notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ success: false, error: 'Notification not found' });
        }

        notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true, runValidators: true }
        );

        res.status(200).json({ success: true, data: notification });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/v1/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res, next) => {
    try {
        const userId = req.body.userId;
        if (!userId) {
            return res.status(400).json({ success: false, error: 'User ID is required' });
        }

        await Notification.updateMany(
            { user: userId, read: false },
            { read: true }
        );

        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// @desc    Create notification (Internal utility or API)
// @route   POST /api/v1/notifications
exports.createNotification = async (req, res, next) => {
    try {
        const notification = await Notification.create(req.body);
        res.status(201).json({ success: true, data: notification });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
