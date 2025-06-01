const { getFirebaseAdmin } = require('../config/firebase');

const admin = getFirebaseAdmin();
const db = admin.firestore();
const usersCollection = db.collection('users');

class User {
  static async findById(id) {
    try {
      const doc = await usersCollection.doc(id.toString()).get();
      if (!doc.exists) {
        return null;
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error('Error finding user: ' + error.message);
    }
  }

  static async incrementRegister(id) {
    try {
      const user = await this.findById(id);
      await usersCollection.doc(id).update({register: user.register + 1});
    } catch (error) {
      throw new Error('Error incrementing register: ' + error.message);
    }
  }

  static async decrementAttendance(id) {
    try {
      const user = await this.findById(id);
      await usersCollection.doc(id).update({attendance: user.attendance - 1});
    } catch (error) {
      throw new Error('Error decrementing attendance: ' + error.message);
    }
  }
}

module.exports = User; 