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
  const mobileRedirectUri = req.query.mobileRedirect;

  // Store the mobile redirect URI in the session or state
  const state = Buffer.from(JSON.stringify({
    mobileRedirect: mobileRedirectUri
  })).toString('base64');

  const authUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}`;

  console.log('42 Auth URL:', authUrl);
  console.log('Mobile Redirect URI:', mobileRedirectUri);

  res.redirect(authUrl);
});


// 42 OAuth callback route
router.get('/42/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is missing' });
    }

    // Decode the state to get the mobile redirect URI
    let mobileRedirectUri;
    try {
      const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
      mobileRedirectUri = stateData.mobileRedirect;
    } catch (error) {
      console.error('Error parsing state:', error);
      mobileRedirectUri = null;
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

    // Generate JWT token
    const token = generateToken(user);

    // If we have a mobile redirect URI, use it, otherwise use the default redirect
    if (mobileRedirectUri) {
      const finalRedirectUrl = `${mobileRedirectUri}?token=${encodeURIComponent(token)}`;
      console.log('Redirecting to mobile:', finalRedirectUrl);
      return res.redirect(finalRedirectUrl);
    } else {
      // Handle web redirect or error case
      return res.json({ success: true, token });
    }

  } catch (error) {
    console.error('Authentication error:', error);
    const errorMessage = encodeURIComponent(error.message || 'Authentication failed');
    
    if (req.query.state) {
      try {
        const stateData = JSON.parse(Buffer.from(req.query.state, 'base64').toString());
        if (stateData.mobileRedirect) {
          return res.redirect(`${stateData.mobileRedirect}?error=auth_failed&message=${errorMessage}`);
        }
      } catch (e) {
        console.error('Error parsing state during error handling:', e);
      }
    }
    
    return res.status(500).json({ error: 'auth_failed', message: error.message });
  }
});


router.get('/logout', (req, res) => {
  return res.status(200).clearCookie('token').json({success: true, message: 'Logged out successfully'});
});

module.exports = {
  router,
  initializeAuthRoutes
}; 