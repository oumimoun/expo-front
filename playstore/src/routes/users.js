const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { isAdmin, isStaff, addAdmin, removeAdmin } = require('../config/admin');
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


router.get('/notifications', verifyToken, async (req, res) => {
  try {
    const notifications = await User.getNotifications(req.user.login);
    res.json({success:true, notifications:notifications});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;