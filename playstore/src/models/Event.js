const { getFirebaseAdmin } = require('../config/firebase');

const admin = getFirebaseAdmin();
const db = admin.firestore();
const eventsCollection = db.collection('events');

class Event {
  static async create(eventData) {
    try {
      const docRef = await eventsCollection.add({
        ...eventData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return { success: true, message: 'Event created successfully' };
    } catch (error) {
      throw new Error('Error creating event: ' + error.message);
    }
  }

  static async getAll() {
    try {
      const snapshot = await eventsCollection.get();
      return snapshot.docs.map(doc => {
        const data = doc.data();
        if (!data.participants) {
          data.participants = [];
        }
        return {
          id: doc.id,
          ...data
        };
      });
    } catch (error) {
      console.error('Error in getAll:', error);
      throw new Error('Error fetching events: ' + error.message);
    }
  }

  static async getById(id) {
    try {
      const doc = await eventsCollection.doc(id).get();
      if (!doc.exists) {
        throw new Error('Event not found');
      }
      const data = doc.data();
      if (!data.participants) {
        data.participants = [];
      }
      return { id: doc.id, ...data };
    } catch (error) {
      throw new Error('Error fetching event: ' + error.message);
    }
  }

  static async update(id, updateData) {
    try {
      console.log('Updating event with data:', updateData);
      if (!updateData.participants) {
        updateData.participants = [];
      }
      await eventsCollection.doc(id).update({
        ...updateData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return { id, ...updateData };
    } catch (error) {
      console.error('Update error:', error);
      throw new Error('Error updating event: ' + error.message);
    }
  }

  static async delete(id) {
    try {
      await eventsCollection.doc(id).delete();
      return true;
    } catch (error) {
      throw new Error('Error deleting event: ' + error.message);
    }
  }

  static async getAttendance(userLogin) {
    try {
      const attendance = await db.collection('events').get();
      const finishedEvents = attendance.docs
        .filter(doc => {
          const event = doc.data();
          return event.participants && 
                 event.participants.some(p => p.login === userLogin) &&
                 event.date < new Date().toISOString().split('T')[0];
        });
      return finishedEvents.length;
    } catch (error) {
      throw new Error('Error fetching attendance: ' + error.message);
    }
  }

  static async getRegister(userLogin) {
    try {
      const register = await db.collection('events').get();
      const futureEvents = register.docs
        .filter(doc => {
          const event = doc.data();
          return event.participants && 
                 event.participants.some(p => p.login === userLogin) &&
                 event.date > new Date().toISOString().split('T')[0];
        });
      return futureEvents.length;
    } catch (error) {
      throw new Error('Error fetching register: ' + error.message);
    }
  }

  static async getPast(userLogin) {
    try {
      const pastEvents = await db.collection('events')
      .where('date', '<', new Date().toISOString().split('T')[0])
      .orderBy('date', 'desc')
      .get();
    
      
      const filteredEvents = pastEvents.docs
        .filter(doc => {
          const event = doc.data();
          return event.participants && event.participants.some(p => p.login === userLogin);
        })
        .map(doc => {
          const event = doc.data();
          event.id = doc.id;
          event.rating = event.participants.find(p => p.login === userLogin).rating;
          return event;
        });
      
      return filteredEvents;
    } catch (error) {
      throw new Error('Error fetching past events: ' + error.message);
    }
  }
}

module.exports = Event; 