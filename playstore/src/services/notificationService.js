const { Expo } = require('expo-server-sdk');
const { getFirebaseAdmin } = require('../config/firebase');

const admin = getFirebaseAdmin();
const db = admin.firestore();
const expo = new Expo();

class NotificationService {
    static async saveUserToken(userId, token, deviceType) {
        try {
            if (!Expo.isExpoPushToken(token)) {
                throw new Error('Invalid Expo push token');
            }

            await db.collection('userTokens').doc(userId).set({
                tokens: admin.firestore.FieldValue.arrayUnion({
                    token,
                    deviceType,
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                })
            }, { merge: true });

            return { success: true };
        } catch (error) {
            console.error('Error saving push token:', error);
            throw error;
        }
    }

    static async removeUserToken(token) {
        try {
            const snapshot = await db.collection('userTokens').get();
            const batch = db.batch();
            
            snapshot.docs.forEach(doc => {
                const userData = doc.data();
                const tokens = userData.tokens || [];
                const updatedTokens = tokens.filter(t => t.token !== token);
                
                if (tokens.length !== updatedTokens.length) {
                    batch.update(doc.ref, { tokens: updatedTokens });
                }
            });

            await batch.commit();
            return { success: true };
        } catch (error) {
            console.error('Error removing push token:', error);
            throw error;
        }
    }

    static async sendNotification(userIds, notification) {
        try {
            // Get all user tokens
            const tokens = [];
            for (const userId of userIds) {
                const doc = await db.collection('userTokens').doc(userId).get();
                if (doc.exists) {
                    const userData = doc.data();
                    tokens.push(...(userData.tokens || []).map(t => t.token));
                }
            }

            // Create messages for each token
            const messages = tokens.map(token => ({
                to: token,
                sound: 'default',
                title: notification.title,
                body: notification.body,
                data: notification.data || {},
                badge: 1,
            }));

            // Chunk messages and send them
            const chunks = expo.chunkPushNotifications(messages);
            const tickets = [];

            for (const chunk of chunks) {
                try {
                    const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                    tickets.push(...ticketChunk);
                } catch (error) {
                    console.error('Error sending chunk:', error);
                }
            }

            // Store notification in users' notification list
            const batch = db.batch();
            const notificationData = {
                id: Date.now().toString(),
                title: notification.title,
                body: notification.body,
                data: notification.data,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                read: false
            };

            for (const userId of userIds) {
                const userRef = db.collection('users').doc(userId);
                batch.update(userRef, {
                    notifications: admin.firestore.FieldValue.arrayUnion(notificationData)
                });
            }

            await batch.commit();

            return { success: true, tickets };
        } catch (error) {
            console.error('Error sending notification:', error);
            throw error;
        }
    }

    static async sendNotificationToAll(notification) {
        try {
            const usersSnapshot = await db.collection('users').get();
            const userIds = usersSnapshot.docs.map(doc => doc.id);
            return await this.sendNotification(userIds, notification);
        } catch (error) {
            console.error('Error sending notification to all:', error);
            throw error;
        }
    }
}

module.exports = NotificationService; 