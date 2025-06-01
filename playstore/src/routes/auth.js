const express = require('express');
const { generateToken } = require('../middleware/auth');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const Event = require('../models/Event');


let admin;
let db;

const initializeAuthRoutes = (adminInstance) => {
  admin = adminInstance;
  db = admin.firestore();
};

// 42 OAuth login route
router.get('/42', (req, res) => {
  const clientId = process.env.FORTYTWO_CLIENT_ID;
  const redirectUri = process.env.FORTYTWO_CALLBACK_URL;
  const authUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;
  res.redirect(authUrl);
});

// 42 OAuth callback route
router.get('/42/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is missing' });
    }

    // Exchange code for access token
    const tokenResponse = await axios.post('https://api.intra.42.fr/oauth/token', {
      grant_type: 'authorization_code',
      client_id: process.env.FORTYTWO_CLIENT_ID,
      client_secret: process.env.FORTYTWO_CLIENT_SECRET,
      code: code,
      redirect_uri: process.env.FORTYTWO_CALLBACK_URL
    });

    const accessToken = tokenResponse.data.access_token;

    // Get user info from 42 API
    const userResponse = await axios.get('https://api.intra.42.fr/v2/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const userData = userResponse.data;
    console.log('42 API User Data:', userData);

    const userRef = db.collection('users').doc(userData.login.toString());

    // Check if user is admin
    const adminDoc = await db.collection('admins').doc(userData.login.toString()).get();
    const isAdmin = adminDoc.exists;

    const user = {
        login : userData.login,
        avatar : userData.image.link,
        email : userData.email,
        role : userResponse["staff?"] ? "staff" : "student",
        admin: isAdmin,
        fname : userData.first_name,
        lname : userData.last_name,
        register: await Event.getRegister(userData.login),
        attendance: await Event.getAttendance(userData.login),
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };
      await userRef.set(user);

    // Generate JWT token
    const token = generateToken(user);

    // Redirect to frontend with token
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    return res.cookie('token', token, { httpOnly: true, secure: true }).redirect(`${clientUrl}/home`)

  } catch (error) {
    console.error('Authentication error:', error);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    return res.redirect(`${clientUrl}?error=auth_failed`);
  }
});


router.get('/logout', (req, res) => {
  return res.status(200).clearCookie('token').json({success: true, message: 'Logged out successfully'});
});

module.exports = {
  router,
  initializeAuthRoutes
}; 