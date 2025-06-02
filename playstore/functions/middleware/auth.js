const jwt = require('jsonwebtoken');
const { getFirebaseAdmin } = require('../config/firebase');

let admin;
let db;

const initializeAuth = () => {
  admin = getFirebaseAdmin();
  db = admin.firestore();
};

const generateToken = (user) => {
  return jwt.sign(
    { 
      email: user.email,
      login: user.login,
      avatar: user.avatar,
      fname: user.fname,
      lname: user.lname,
      role: user.role,
      clubManager: user.clubManager,
      register: user.register,
      attendance: user.attendance
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

const extractToken = (req) => {
  // Check cookies first
  if (req.cookies?.token) {
    return req.cookies.token;
  }
  
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Check query parameter (for mobile redirects)
  if (req.query?.token) {
    return req.query.token;
  }
  
  return null;
};


const verifyToken = (req, res, next) => {
  const token = extractToken(req);
  const isMobileApp = req.headers['user-agent']?.includes('Expo') || 
                     req.headers.origin?.startsWith('exp://');
  
  if (!token) {
    return res.status(401).json({ 
      error: 'Access denied. No token provided.',
      details: {
        cookies: req.cookies,
        headers: req.headers,
        origin: req.headers.origin,
        isMobileApp
      }
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    // Refresh token if it's close to expiring
    const tokenExp = decoded.exp * 1000;
    const now = Date.now();
    const sixHours = 6 * 60 * 60 * 1000;
    
    if (tokenExp - now < sixHours) {
      const newToken = generateToken(decoded);
      
      if (isMobileApp) {
        // For mobile, send the token in the response body
        res.locals.newToken = newToken;
      } else {
        // For web, set the cookie
        res.cookie('token', newToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'None',
          path: '/',
          maxAge: 24 * 60 * 60 * 1000
        });
      }
    }
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ 
      error: 'Invalid token.',
      details: error.message,
      origin: req.headers.origin,
      isMobileApp
    });
  }
};

const requireAdmin = async (req, res, next) => {
  try {
    const userRef = db.collection('users').doc(req.user.login);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return res.status(200).json({ error: 'User not found.' });
    }
    const userData = userDoc.data();
    if (userData.role !== 'staff' && userData.admin !== true) {
      return res.status(200).json({ error: 'Access denied. Staff only.' });
    }
    next();
  } catch (error) {
    console.error('Error checking staff role:', error);
    res.status(500).json({ error: 'Internal server error checking staff role.' });
  }
};

const createDefaultAdmin = async () => {
  if (!admin || !db) {
    console.error('Firebase admin not initialized');
    return;
  }

  try {
    const adminsRef = db.collection('admins');
    const snapshot = await adminsRef.get();
    
    // Log the data from the snapshot
    // console.log('Current admins:');
    // snapshot.forEach(doc => {
    //   console.log('Admin ID:', doc.id);
    //   console.log('Admin Data:', doc.data());
    // });

    const userRef = adminsRef.doc('ymahni');
    const doc = await userRef.get();

    if (!doc.exists) {
      await userRef.set({
        username: 'ymahni',
        role: 'super_admin',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('Default admin user created successfully');
    } else {
      console.log('Existing admin data:', doc.data());
    }
  } catch (error) {
    console.error('Error in createDefaultAdmin:', error);
  }
};

module.exports = {
  initializeAuth,
  generateToken,
  verifyToken,
  requireAdmin,
  createDefaultAdmin
};







