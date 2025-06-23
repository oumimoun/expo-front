import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useUser } from './UserContext';

interface NotificationContextType {
    expoPushToken: string | null;
    notification: Notifications.Notification | null;
    registerForPushNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
    const [notification, setNotification] = useState<Notifications.Notification | null>(null);
    const { user } = useUser();

    async function registerForPushNotifications() {
        try {
            if (!Device.isDevice) {
                console.log('Must use physical device for Push Notifications');
                return;
            }

            // Check if we have permission
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            // If we don't have permission, ask for it
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.log('Failed to get push token for push notification!');
                return;
            }

            // Get the token
            const token = await Notifications.getExpoPushTokenAsync({
                projectId: process.env.EXPO_PROJECT_ID, // Make sure to set this in your app.json
            });

            // Store the token
            setExpoPushToken(token.data);

            // Send token to backend
            if (user) {
                try {
                    const response = await fetch(`${process.env.API_URL}/notifications/register`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            userId: user?.login,
                            token: token.data,
                            deviceType: Platform.OS,
                        }),
                    });

                    if (!response.ok) {
                        throw new Error('Failed to register push token with backend');
                    }
                } catch (error) {
                    console.error('Error registering push token:', error);
                }
            }

            // Special handling for Android
            if (Platform.OS === 'android') {
                Notifications.setNotificationChannelAsync('default', {
                    name: 'default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#FF231F7C',
                });
            }
        } catch (error) {
            console.error('Error registering for push notifications:', error);
        }
    }

    useEffect(() => {
        // Register for notifications when the user is logged in
        if (user) {
            registerForPushNotifications();
        }

        // Set up notification listeners
        const notificationListener = Notifications.addNotificationReceivedListener(notification => {
            setNotification(notification);
        });

        const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
            // Handle notification interaction here
            console.log('Notification interaction:', response);
        });

        return () => {
            Notifications.removeNotificationSubscription(notificationListener);
            Notifications.removeNotificationSubscription(responseListener);
        };
    }, [user]);

    const value = {
        expoPushToken,
        notification,
        registerForPushNotifications,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
} 