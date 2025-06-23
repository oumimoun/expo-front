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

  static async decrementRegister(id) {
    try {
      const user = await this.findById(id);
      await usersCollection.doc(id).update({register: user.register - 1});
    } catch (error) {
      throw new Error('Error decrementing register: ' + error.message);
    }
  }

  static async brodcastNotification(type, title, message){
    try {
      const users = await usersCollection.get();
      users.forEach(user => {
        const notification = {
          id: Date.now().toString(),
          type: type,
          title: title,
          message: message,
          createdAt: new Date().toISOString(),
          read: false
        }
        user.ref.update({notifications: admin.firestore.FieldValue.arrayUnion(notification)});
      });
    } catch (error) {
      throw new Error('Error brodcasting notification: ' + error.message);
    }
  }

  static async getNotifications(userLogin) {
    try {
      const userDoc = await usersCollection.doc(userLogin).get();
      if (!userDoc.exists) {
        throw new Error('User not found');
      }
      const userData = userDoc.data();
      return userData.notifications || [];
    } catch (error) {
      throw new Error('Error fetching notifications: ' + error.message);
    }
  }

  static async markNotificationAsRead(userLogin, notificationId) {
    try {
      const userDoc = await usersCollection.doc(userLogin).get();
      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const notifications = userData.notifications || [];
      const updatedNotifications = notifications.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      );

      await usersCollection.doc(userLogin).update({
        notifications: updatedNotifications
      });

      return { success: true, message: 'Notification marked as read' };
    } catch (error) {
      throw new Error('Error updating notification: ' + error.message);
    }
  }

  static async markAllNotificationsAsRead(userLogin) {
    try {
      const userDoc = await usersCollection.doc(userLogin).get();
      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const notifications = userData.notifications || [];
      const updatedNotifications = notifications.map(notif => ({ ...notif, read: true }));

      await usersCollection.doc(userLogin).update({
        notifications: updatedNotifications
      });

      return { success: true, message: 'All notifications marked as read' };
    } catch (error) {
      throw new Error('Error updating notifications: ' + error.message);
    }
  }

  static async getInterests(userLogin) {
    try {
      const userDoc = await usersCollection.doc(userLogin).get();
      if (!userDoc.exists) {
        throw new Error('User not found');
      }
      const userData = userDoc.data();
      return userData.interests || [];
    } catch (error) {
      throw new Error('Error fetching interests: ' + error.message);
    }
  }

  static async addInterest(userLogin, interest) {
    try {
      const userDoc = await usersCollection.doc(userLogin).get();
      if (!userDoc.exists) {
        throw new Error('User not found');
      }
      const userData = userDoc.data();
      const interests = userData.interests || [];
      if (!interests.includes(interest)) {
        interests.push(interest);
      }
      else {
        interests.splice(interests.indexOf(interest), 1);
      }
      await usersCollection.doc(userLogin).update({interests: interests});
      return interests;
    } catch (error) {
      throw new Error('Error adding interest: ' + error.message);
    }
  }
}

module.exports = User; 