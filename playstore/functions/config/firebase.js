const admin = require('firebase-admin');
const path = require('path');

let firebaseApp = null;

const initializeFirebase = () => {
  if (!firebaseApp) {
    try {
      const serviceAccount = require(path.join(process.cwd(), 'playstore-e4a65-firebase-adminsdk-fbsvc-6306995795.json'));
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      console.error('Error initializing Firebase Admin SDK:', error);
      process.exit(1);
    }
  }
  return firebaseApp;
};

const getFirebaseAdmin = () => {
  if (!firebaseApp) {
    try {
      // Only initialize if not already initialized
      if (!admin.apps.length) {
        firebaseApp = admin.initializeApp();
      } else {
        firebaseApp = admin.apps[0];
      }
      console.log('Firebase Admin SDK initialized or retrieved successfully');
    } catch (error) {
      console.error('Error with Firebase Admin SDK:', error);
      throw error;
    }
  }
  return admin;
};

module.exports = {
  getFirebaseAdmin,
  initializeFirebase,
}; 