import React, { createContext, useContext, useState } from 'react';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'event' | 'feedback' | 'system';
    timestamp: string;
    read: boolean;
    eventId?: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    addNotification: (notification: Notification) => void;
    removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Initial notifications data
const initialNotifications: Notification[] = [
    {
        id: '1',
        title: 'New Event Available',
        message: 'A new Web Development workshop has been added to the schedule.',
        type: 'event',
        timestamp: '2 hours ago',
        read: false,
        eventId: '123',
    },
    {
        id: '2',
        title: 'Feedback Reminder',
        message: 'Don\'t forget to give feedback for the AI Workshop you attended.',
        type: 'feedback',
        timestamp: '1 day ago',
        read: false,
    },
    {
        id: '3',
        title: 'System Update',
        message: 'We\'ve updated our privacy policy. Please review the changes.',
        type: 'system',
        timestamp: '2 days ago',
        read: true,
    },
];

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === id
                    ? { ...notification, read: true }
                    : notification
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(notification => ({ ...notification, read: true }))
        );
    };

    const addNotification = (notification: Notification) => {
        setNotifications(prev => [notification, ...prev]);
    };

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    };

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                markAsRead,
                markAllAsRead,
                addNotification,
                removeNotification,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}; 