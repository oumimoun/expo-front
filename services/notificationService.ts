import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://europe-west1-playstore-e4a65.cloudfunctions.net/api';

export interface NotificationPayload {
    title: string;
    body: string;
    data?: Record<string, any>;
}

export interface Notification {
    id: string;
    type: 'event' | 'reminder' | 'update';
    title: string;
    message: string;
    time: string;
    read: boolean;
    eventId?: string;
    eventTitle?: string;
}

export const notificationService = {
    getNotifications: async (): Promise<Notification[]> => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) throw new Error('No token found');

            const response = await axios.get(`${API_URL}/api/users/notifications`, {
                withCredentials: true,
            });

            if (response.data.success) {
                return response.data.notifications;
            } else {
                throw new Error('Failed to fetch notifications');
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    },

    markAsRead: async (notificationId: string): Promise<Notification> => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) throw new Error('No token found');

            const response = await axios.post(
                `${API_URL}/api/users/notification/read`,
                { notificationId },
                {
                    withCredentials: true,
                }
            );

            if (response.data.success) {
                return response.data.notification;
            } else {
                throw new Error('Failed to mark notification as read');
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    },

    markAllAsRead: async (): Promise<void> => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) throw new Error('No token found');

            const response = await axios.post(
                `${API_URL}/api/users/notifications/readAll`,
                {},
                {
                    withCredentials: true,
                }
            );

            if (!response.data.success) {
                throw new Error('Failed to mark all notifications as read');
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    }
};