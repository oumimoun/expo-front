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
  if (!clubDoc.exists) {
    await db.collection('clubs').doc(clubName).set({
      name: clubName,
      managers: [username]
    });
    return {
      clubName: clubName,
      clubManagers: [username],
      clubEvents: []
    }
  }
  const events = await db.collection('events').where('club', '==', clubName).get();
  const clubInfo = {
    clubName: clubDoc.data().name,
    clubManagers: clubDoc.data().managers,
    clubEvents: events.docs.map(doc => doc.data())
  }
  return clubInfo
};

module.exports = {
  isAdmin,
  addClubManager,
  removeClubManager,
  getClubInfo
}; 