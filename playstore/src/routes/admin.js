const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { addClubManager, isAdmin, removeClubManager, getClubInfo } = require('../config/admin');

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  if (!req.user || !req.user.username) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const isUserAdmin = await isAdmin(req.user.username);
  if (!isUserAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
};

// Add a new admin (only existing admins can add new admins)
router.post('/addClubManager', [verifyToken, requireAdmin], async (req, res) => {
  try {
    const { username, club } = req.body;
    await addClubManager(username, club);
    await User.brodcastNotification("Updates", "New Club Manager Added", `${username} has been added as a club manager for ${club}`);
    res.json({ success: true, message: 'Club manager added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/removeClubManager', [verifyToken, requireAdmin], async (req, res) => {
  try {
    const { username } = req.body;
    await removeClubManager(username);
    await User.brodcastNotification("Updates", "Club Manager Removed", `${username} is no longer a club manager`);
    res.json({ success: true, message: 'Club manager removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/getClubInfo', [verifyToken, requireAdmin], async (req, res) => {
  try {
    const clubName = req.body.clubName;
    const clubInfo = await getClubInfo(clubName);
    res.json({ success: true, clubInfo: clubInfo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;