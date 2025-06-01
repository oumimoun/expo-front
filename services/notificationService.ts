import { Platform } from 'react-native';

const API_URL = process.env.API_URL;

export interface NotificationPayload {
    title: string;
    body: string;
    data?: Record<string, any>;
}

export async function registerDeviceToken(userId: string, token: string) {
    try {
        const response = await fetch(`${API_URL}/notifications/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                token,
                deviceType: Platform.OS,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to register device token');
        }

        return await response.json();
    } catch (error) {
        console.error('Error registering device token:', error);
        throw error;
    }
}

export async function unregisterDeviceToken(token: string) {
    try {
        const response = await fetch(`${API_URL}/notifications/unregister`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to unregister device token');
        }

        return await response.json();
    } catch (error) {
        console.error('Error unregistering device token:', error);
        throw error;
    }
}

export async function updateNotificationSettings(userId: string, settings: {
    pushEnabled: boolean;
    emailEnabled: boolean;
    categories: string[];
}) {
    try {
        const response = await fetch(`${API_URL}/notifications/settings`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                ...settings,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to update notification settings');
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating notification settings:', error);
        throw error;
    }
} 