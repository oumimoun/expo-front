const express = require('express');
const { verifyToken } = require('../middleware/auth');
const NotificationService = require('../services/notificationService');

const router = express.Router();

// Register device token
router.post('/register', verifyToken, async (req, res) => {
    try {
        const { token, deviceType } = req.body;
        const userId = req.user.login;

        if (!token || !deviceType) {
            return res.status(400).json({ error: 'Token and device type are required' });
        }

        const result = await NotificationService.saveUserToken(userId, token, deviceType);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Unregister device token
router.post('/unregister', verifyToken, async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }

        const result = await NotificationService.removeUserToken(token);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Send notification to specific users
router.post('/send', verifyToken, async (req, res) => {
    try {
        const { userIds, notification } = req.body;

        if (!userIds || !notification || !notification.title || !notification.body) {
            return res.status(400).json({ error: 'User IDs and notification details are required' });
        }

        const result = await NotificationService.sendNotification(userIds, notification);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Send notification to all users
router.post('/broadcast', verifyToken, async (req, res) => {
    try {
        const { notification } = req.body;

        if (!notification || !notification.title || !notification.body) {
            return res.status(400).json({ error: 'Notification details are required' });
        }

        const result = await NotificationService.sendNotificationToAll(notification);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 