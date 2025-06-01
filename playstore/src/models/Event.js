const { getFirebaseAdmin } = require('../config/firebase');

const admin = getFirebaseAdmin();
const db = admin.firestore();
const eventsCollection = db.collection('events');
const usersCollection = db.collection('users');

class Event {
  static async create(eventData) {
    try {
      // Create the event
      const eventRef = await eventsCollection.add({
        ...eventData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Get all users to notify them about the new event
      const usersSnapshot = await usersCollection.get();
      const batch = db.batch();

      // Add notification to each user's notifications array
      usersSnapshot.docs.forEach(userDoc => {
        if (userDoc.id !== eventData.createdBy) { // Don't notify the event creator
          batch.update(userDoc.ref, {
            notifications: admin.firestore.FieldValue.arrayUnion({
              id: Date.now().toString(), // Unique ID for the notification
              type: 'new_event',
              eventId: eventRef.id,
              eventTitle: eventData.title,
              message: `New event: ${eventData.title}`,
              createdAt: new Date().toISOString(),
              read: false
            })
          });
        }
      });

      // Execute all notifications updates
      await batch.commit();

      // Get the created event data
      const createdEvent = await eventRef.get();
     
      return {
        id: eventRef.id,
        ...createdEvent.data(),
        success: true,
        message: 'Event created successfully'
      };
    } catch (error) {
      console.error('Error in create:', error);
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