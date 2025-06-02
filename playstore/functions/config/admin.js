const admin = require('firebase-admin');

const isAdmin = async (username) => {
  const db = admin.firestore();
  const userDoc = await db.collection('users').doc(username).get();
  if (userDoc.exists) {
    const role = userDoc.data().role;
    if (role == 'staff' || userDoc.data().clubManager != 'none') {
      return true;
    }
    return false;
  }
  return false;
};

const isStaff = async (username) => {
  const db = admin.firestore();
  const adminDoc = await db.collection('admins').doc(username).get();
  if (adminDoc.exists) {
    const role = adminDoc.data().role;
    if (role == 'super_admin') {
      return true;
    }
    return false;
  }
  return false;
};

const addClubManager = async (username, clubManager) => {
  const db = admin.firestore();
  await db.collection('users').doc(username).update({clubManager: clubManager});
};


const removeClubManager = async (username) => {
  const db = admin.firestore();
  await db.collection('users').doc(username).update({clubManager: 'none'});
};

const getClubInfo = async (clubName) => {
  const db = admin.firestore();
  const clubDoc = await db.collection('clubs').doc(clubName).get();
  const events = await db.collection('events').where('club', '==', clubName).get();
  const clubInfo = {
    clubName: clubDoc.data().clubName,
    clubManagers: clubDoc.data().clubManagers,
    clubEvents: events.docs.map(doc => doc.data())
  }
  return clubInfo
};

module.exports = {
  isAdmin,
  isStaff,
  addClubManager,
  removeClubManager,
  getClubInfo
}; 