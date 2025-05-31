import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Dimensions,
    Pressable,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Nav from '../../components/Nav';

const { width } = Dimensions.get('window');

const COLORS = {
    background: '#FFFFFF',
    Green: '#1b8456',
    lightOrange: '#f5cbab',
    black: '#000000',
    greyText: '#555555',
    lightGreen: '#e0f0e9',
    lightGrey: '#f9f9f9',
    white: '#FFFFFF',
    red: '#ff4444',
};

type NotificationType = 'event' | 'reminder' | 'update' | 'registration';

interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    time: string;
    isRead: boolean;
    eventId?: string;
    eventTitle?: string;
}

export default function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: '1',
            type: 'event',
            title: 'New Event Added',
            message: 'Tech Innovation Summit 2024 has been added to your interests.',
            time: '2 hours ago',
            isRead: false,
            eventId: '1',
            eventTitle: 'Tech Innovation Summit 2024',
        },
        {
            id: '2',
            type: 'reminder',
            title: 'Event Tomorrow',
            message: 'Don\'t forget: Expo Routing Deep Dive starts tomorrow at 2:00 PM.',
            time: '5 hours ago',
            isRead: false,
            eventId: '2',
            eventTitle: 'Expo Routing Deep Dive',
        },
        {
            id: '3',
            type: 'registration',
            title: 'Registration Confirmed',
            message: 'You\'re registered for UI Design Inspiration. We\'ll send you a reminder before the event.',
            time: '1 day ago',
            isRead: true,
            eventId: '3',
            eventTitle: 'UI Design Inspiration',
        },
        {
            id: '4',
            type: 'update',
            title: 'Event Update',
            message: 'The location for Team Building Day has been updated.',
            time: '2 days ago',
            isRead: true,
            eventId: '4',
            eventTitle: 'Team Building Day',
        },
    ]);

    const getNotificationIcon = (type: NotificationType) => {
        switch (type) {
            case 'event':
                return { name: 'calendar-outline' as const, color: COLORS.Green };
            case 'reminder':
                return { name: 'alarm-outline' as const, color: COLORS.lightOrange };
            case 'update':
                return { name: 'information-circle-outline' as const, color: '#3a7bd5' };
            case 'registration':
                return { name: 'checkmark-circle-outline' as const, color: COLORS.Green };
            default:
                return { name: 'notifications-outline' as const, color: COLORS.greyText };
        }
    };

    const markAsRead = (notificationId: string) => {
        setNotifications(prevNotifications =>
            prevNotifications.map(notification =>
                notification.id === notificationId
                    ? { ...notification, isRead: true }
                    : notification
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications(prevNotifications =>
            prevNotifications.map(notification => ({ ...notification, isRead: true }))
        );
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const renderNotification = (notification: Notification) => {
        const icon = getNotificationIcon(notification.type);

        return (
            <Pressable
                key={notification.id}
                style={[
                    styles.notificationCard,
                    !notification.isRead && styles.unreadCard
                ]}
                onPress={() => markAsRead(notification.id)}
            >
                <View style={[styles.iconContainer, { backgroundColor: `${icon.color}15` }]}>
                    <Ionicons name={icon.name} size={24} color={icon.color} />
                </View>

                <View style={styles.notificationContent}>
                    <View style={styles.notificationHeader}>
                        <Text style={styles.notificationTitle}>{notification.title}</Text>
                        <Text style={styles.timeText}>{notification.time}</Text>
                    </View>

                    <Text style={styles.messageText}>{notification.message}</Text>

                    {notification.eventTitle && (
                        <View style={styles.eventLink}>
                            <Ionicons name="link-outline" size={16} color={COLORS.Green} />
                            <Text style={styles.eventLinkText}>{notification.eventTitle}</Text>
                        </View>
                    )}
                </View>

                {!notification.isRead && (
                    <View style={styles.unreadDot} />
                )}
            </Pressable>
        );
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Notifications</Text>
                    {unreadCount > 0 && (
                        <TouchableOpacity
                            style={styles.markAllButton}
                            onPress={markAllAsRead}
                        >
                            <Text style={styles.markAllText}>Mark all as read</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {notifications.length > 0 ? (
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                    >
                        {notifications.map(renderNotification)}
                    </ScrollView>
                ) : (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="notifications-off-outline" size={64} color={COLORS.greyText} />
                        <Text style={styles.emptyText}>No notifications yet</Text>
                        <Text style={styles.emptySubtext}>
                            We'll notify you when there are new events or updates
                        </Text>
                    </View>
                )}
            </SafeAreaView>
            <Nav />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 15,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    markAllButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: COLORS.lightGrey,
    },
    markAllText: {
        color: COLORS.Green,
        fontSize: 14,
        fontWeight: '600',
    },
    scrollContent: {
        padding: 20,
        gap: 12,
    },
    notificationCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 16,
        gap: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    unreadCard: {
        backgroundColor: COLORS.white,
        borderColor: COLORS.Green,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationContent: {
        flex: 1,
        gap: 8,
    },
    notificationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.black,
        flex: 1,
        marginRight: 8,
    },
    timeText: {
        fontSize: 12,
        color: COLORS.greyText,
    },
    messageText: {
        fontSize: 14,
        color: COLORS.greyText,
        lineHeight: 20,
    },
    eventLink: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
    },
    eventLinkText: {
        fontSize: 14,
        color: COLORS.Green,
        fontWeight: '500',
    },
    unreadDot: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.Green,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.black,
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: COLORS.greyText,
        textAlign: 'center',
        marginTop: 8,
    },
});
