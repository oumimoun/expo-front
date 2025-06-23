const express = require('express');
const { verifyToken } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// get user info
router.get('/', verifyToken, async (req, res) => {
  try {
    res.json({success:true, user:req.user});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// get intrests
router.get('/interests', verifyToken, async (req, res) => {
  try {
    const interests = await User.getInterests(req.user.login);
    res.json({success:true, interests:interests});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// add or remove one interest
router.post('/interest', verifyToken, async (req, res) => {
  try {
    const interest = await User.addInterest(req.user.login, req.body.interest);
    res.json({success:true, interest:interest});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// get notifications
router.get('/notifications', verifyToken, async (req, res) => {
  try {
    const notifications = await User.getNotifications(req.user.login);
    res.json({success:true, notifications:notifications});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// mark notification as read
router.post('/notification/read', verifyToken, async (req, res) => {
  try {
    const notification = await User.markNotificationAsRead(req.user.login, req.body.notificationId);
    res.json({success:true, notification:notification});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// mark all notifications as read
router.post('/notification/readAll', verifyToken, async (req, res) => {
  try {
    const notification = await User.markAllNotificationsAsRead(req.user.login);
    res.json({success:true, notification:notification});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;