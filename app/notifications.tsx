import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Navbar from './components/Navbar';
import NotificationCard, { NotificationType } from './components/NotificationCard';

// Mock data - replace with actual API call
const MOCK_NOTIFICATIONS = [
    {
        id: '1',
        type: 'event_reminder' as NotificationType,
        title: 'Upcoming Event: Tech Conference',
        message: 'Your event "Tech Conference 2024" starts in 2 hours. Don\'t forget to check in!',
        timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
        eventId: 'event1',
        isRead: false,
        actionData: {
            actionType: 'view' as const,
            actionText: 'View Event'
        }
    },
    {
        id: '2',
        type: 'event_update' as NotificationType,
        title: 'Event Location Updated',
        message: 'The location for "Workshop on AI" has been updated. Please check the new venue.',
        timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
        eventId: 'event2',
        isRead: true,
        actionData: {
            actionType: 'view' as const,
            actionText: 'See Changes'
        }
    },
    {
        id: '3',
        type: 'event_cancelled' as NotificationType,
        title: 'Event Cancelled',
        message: 'Unfortunately, "Evening Networking" has been cancelled. We apologize for any inconvenience.',
        timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
        eventId: 'event3',
        isRead: true,
    },
    {
        id: '4',
        type: 'new_admin' as NotificationType,
        title: 'New Admin Role',
        message: 'You have been made an admin for "Developer Meetup". You can now manage event details.',
        timestamp: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
        eventId: 'event4',
        isRead: false,
        actionData: {
            actionType: 'view' as const,
            actionText: 'View Permissions'
        }
    },
    {
        id: '5',
        type: 'friend_joined' as NotificationType,
        title: 'Friend Joined Event',
        message: 'Sarah Johnson just joined "Tech Conference 2024". You can now coordinate with them.',
        timestamp: new Date(Date.now() - 3 * 24 * 3600000).toISOString(),
        eventId: 'event1',
        isRead: true,
        actionData: {
            actionType: 'respond' as const,
            actionText: 'Send Message'
        }
    },
    {
        id: '6',
        type: 'event_feedback' as NotificationType,
        title: 'Event Feedback Required',
        message: 'Please provide feedback for "Web Development Workshop" that you attended.',
        timestamp: new Date(Date.now() - 4 * 24 * 3600000).toISOString(),
        eventId: 'event5',
        isRead: false,
        actionData: {
            actionType: 'feedback' as const,
            actionText: 'Give Feedback'
        }
    },
];

export default function NotificationsScreen() {
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsRefreshing(false);
    };

    const handleLoadMore = async () => {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoading(false);
    };

    const handleNotificationPress = (notification: typeof MOCK_NOTIFICATIONS[0]) => {
        // Mark as read
        setNotifications(prev =>
            prev.map(n =>
                n.id === notification.id
                    ? { ...n, isRead: true }
                    : n
            )
        );
        // Navigate to relevant screen based on notification type
        console.log('Navigate to:', notification.type, notification.eventId);
    };

    const handleAction = (notification: typeof MOCK_NOTIFICATIONS[0]) => {
        // Handle action based on actionType
        console.log('Handle action:', notification.actionData?.actionType);
    };

    const handleDismiss = (notificationId: string) => {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Notifications</Text>
            {notifications.some(n => !n.isRead) && (
                <TouchableOpacity
                    style={styles.markAllRead}
                    onPress={() => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))}
                >
                    <Ionicons name="checkmark-done" size={20} color="#1A866F" />
                    <Text style={styles.markAllReadText}>Mark all as read</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptyMessage}>
                You're all caught up! Check back later for new notifications.
            </Text>
        </View>
    );

    const renderFooter = () => {
        if (!isLoading) return null;
        return (
            <View style={styles.footer}>
                <ActivityIndicator color="#1A866F" />
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <FlatList
                    data={notifications}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <NotificationCard
                            notification={item}
                            onPress={() => handleNotificationPress(item)}
                            onAction={() => handleAction(item)}
                            onDismiss={() => handleDismiss(item.id)}
                        />
                    )}
                    ListHeaderComponent={renderHeader}
                    ListEmptyComponent={renderEmpty}
                    ListFooterComponent={renderFooter}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                            tintColor="#1A866F"
                            colors={['#1A866F']}
                        />
                    }
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    contentContainerStyle={styles.list}
                />
            </View>
            <Navbar />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(26, 29, 31, 0.08)',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1A1D1F',
    },
    markAllRead: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
    },
    markAllReadText: {
        marginLeft: 4,
        fontSize: 14,
        color: '#1A866F',
        fontWeight: '500',
    },
    list: {
        flexGrow: 1,
        paddingVertical: 8,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        marginTop: 100,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1A1D1F',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyMessage: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
    },
    footer: {
        padding: 16,
        alignItems: 'center',
    },
}); 