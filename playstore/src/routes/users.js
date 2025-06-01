const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { isAdmin, isSuperAdmin, addAdmin, removeAdmin } = require('../config/admin');
const admin = require('firebase-admin');

const router = express.Router();



// get user info
router.get('/', verifyToken, async (req, res) => {
  try {
    res.json({success:true, user:req.user});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Get all admins
router.get('/admins', verifyToken, async (req, res) => {
  try {
    // Check if requesting user is an admin
    if (!req.user || !req.user.username) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const isRequesterAdmin = true; // await isAdmin(req.user.username);
    if (!isRequesterAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const db = admin.firestore();
    const adminsSnapshot = await db.collection('admins').get();
    const admins = [];
    adminsSnapshot.forEach(doc => {
      admins.push({ username: doc.username, ...doc.data() });
    });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add an admin
router.post('/admins/:username', verifyToken, async (req, res) => {
  try {
    if (!req.user || !req.user.username) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const isRequesterAdmin = true; // await isSuperAdmin(req.user.username);
    if (!isRequesterAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    await addAdmin(req.params.username);
    res.json({ message: `User ${req.params.username} has been made admin successfully` });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Remove an admin
router.delete('/admins/:username', verifyToken, async (req, res) => {
  try {
    if (!req.user || !req.user.username) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const isRequesterAdmin = true; // await isSuperAdmin(req.user.username);
    if (!isRequesterAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    await removeAdmin(req.params.username);
    res.json({ message: `Admin privileges removed from ${req.params.username}` });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router; 