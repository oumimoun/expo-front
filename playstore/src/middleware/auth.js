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
      admin: user.admin,
      register: user.register,
      attendance: user.attendance
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
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