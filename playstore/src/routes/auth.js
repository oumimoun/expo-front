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

const EXPO_REDIRECT_URL = 'exp://klty-gs-anonymous-8081.exp.direct';

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
      return res.redirect(`${EXPO_REDIRECT_URL}?error=missing_code`);
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
    const userDoc = await userRef.get();

    let user;
    
    if (!userDoc.exists) {
      // Only create new user if they don't exist
      user = {
        login: userData.login,
        avatar: userData.image.link,
        email: userData.email,
        role: userResponse["staff?"] ? "staff" : "student",
        clubManager: "none",
        fname: userData.first_name,
        lname: userData.last_name,
        register: 0,
        attendance: 0,
        notifications: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      await userRef.set(user);
    } else {
      // Update existing user's information
      user = userDoc.data();
      const updates = {
        avatar: userData.image.link,
        email: userData.email,
        role: userResponse["staff?"] ? "staff" : "student",
        fname: userData.first_name,
        lname: userData.last_name
      };
      await userRef.update(updates);
      user = { ...user, ...updates };
    }

    // Generate JWT token and redirect to mobile app
    const token = generateToken(user);
    return res.redirect(`${EXPO_REDIRECT_URL}?token=${token}`);
    
  } catch (error) {
    console.error('Authentication error:', error);
    return res.redirect(`${EXPO_REDIRECT_URL}?error=auth_failed&message=${encodeURIComponent(error.message)}`);
  }
});

router.get('/logout', (req, res) => {
  return res.status(200).json({success: true, message: 'Logged out successfully'});
});

module.exports = {
  router,
  initializeAuthRoutes
}; 