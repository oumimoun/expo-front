const express = require('express');
const router = express.Router();
const { addAdmin, removeAdmin, isAdmin } = require('../config/admin');

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
router.post('/add', requireAdmin, async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    await addAdmin(username);
    res.json({ message: `User ${username} has been made admin successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove an admin (only existing admins can remove other admins)
router.post('/remove', requireAdmin, async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    await removeAdmin(username);
    res.json({ message: `Admin privileges removed from ${username}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check if a user is admin
router.get('/check/:username', requireAdmin, async (req, res) => {
  try {
    const { username } = req.params;
    const adminStatus = await isAdmin(username);
    res.json({ username, isAdmin: adminStatus });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 