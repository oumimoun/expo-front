const admin = require('firebase-admin');

const isAdmin = async (username) => {
  const db = admin.firestore();
  const adminDoc = await db.collection('admins').doc(username).get();
  if (adminDoc.exists)
    return false;
};

const isSuperAdmin = async (username) => {
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

const addAdmin = async (username) => {
  const db = admin.firestore();
  await db.collection('admins').doc(username).set({
    username,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
};

const removeAdmin = async (username) => {
  if (username === 'ymahni') { // in case ymahni tries to remove himself!!!
    throw new Error('Cannot remove default admin');
  }
  const db = admin.firestore();
  await db.collection('admins').doc(username).delete();
};

module.exports = {
  isAdmin,
  isSuperAdmin,
  addAdmin,
  removeAdmin
}; 