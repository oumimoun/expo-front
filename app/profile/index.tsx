import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import AttendedEventCard from '../components/AttendedEventCard';
import FeedbackModal from '../components/FeedbackModal';
import NotificationItem from '../components/NotificationItem';
import { useTheme } from '../theme/ThemeContext';

// Example data - replace with actual data from your backend
const attendedEvents = [
    {
        id: '1',
        title: 'Advanced React Patterns Workshop',
        date: '2024-03-10T14:00:00',
        location: 'Room A1',
        category: 'Web',
        hasFeedback: false,
    },
    {
        id: '2',
        title: 'Machine Learning Fundamentals',
        date: '2024-03-08T15:30:00',
        location: 'Room B2',
        category: 'AI',
        hasFeedback: true,
        rating: 5,
    },
    {
        id: '3',
        title: 'Cybersecurity Best Practices',
        date: '2024-03-05T13:00:00',
        location: 'Room C3',
        category: 'Sec',
        hasFeedback: true,
        rating: 4,
    },
];

const notifications: Array<{
    id: string;
    title: string;
    message: string;
    type: 'event' | 'feedback' | 'system';
    timestamp: string;
    read: boolean;
    eventId?: string;
}> = [
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
            read: true,
        },
    ];

export default function Profile() {
    const router = useRouter();
    const { theme } = useTheme();
    const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
    const [isFeedbackModalVisible, setIsFeedbackModalVisible] = useState(false);
    const [readNotifications, setReadNotifications] = useState<string[]>([]);

    const handleGiveFeedback = (eventId: string) => {
        setSelectedEvent(eventId);
        setIsFeedbackModalVisible(true);
    };

    const handleSubmitFeedback = (rating: number, comment: string) => {
        console.log('Feedback submitted:', { eventId: selectedEvent, rating, comment });
        // Here you would typically send this to your backend
    };

    const handleMarkAsRead = (notificationId: string) => {
        setReadNotifications(prev => [...prev, notificationId]);
    };

    const styles = makeStyles(theme);

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.header}>
                    <View style={styles.profileInfo}>
                        <Image
                            source={{ uri: 'https://i.pravatar.cc/150' }}
                            style={styles.avatar}
                        />
                        <View style={styles.nameContainer}>
                            <Text style={styles.name}>John Doe</Text>
                            <Text style={styles.email}>john.doe@example.com</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => router.push('/settings')}
                    >
                        <Ionicons name="settings-outline" size={24} color={theme.text} />
                    </TouchableOpacity>
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>12</Text>
                        <Text style={styles.statLabel}>Events Attended</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>8</Text>
                        <Text style={styles.statLabel}>Upcoming Events</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>4.8</Text>
                        <Text style={styles.statLabel}>Avg. Rating</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Notifications</Text>
                    {notifications.map(notification => (
                        <NotificationItem
                            key={notification.id}
                            {...notification}
                            read={readNotifications.includes(notification.id) || notification.read}
                            onMarkAsRead={handleMarkAsRead}
                        />
                    ))}
                    {notifications.length > 0 && (
                        <TouchableOpacity
                            style={styles.viewAllButton}
                            onPress={() => router.push('/notifications')}
                        >
                            <Text style={styles.viewAllText}>View All Notifications</Text>
                            <Ionicons name="arrow-forward" size={16} color={theme.primary} />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Attended Events</Text>
                    {attendedEvents.map(event => (
                        <AttendedEventCard
                            key={event.id}
                            {...event}
                            onGiveFeedback={
                                !event.hasFeedback
                                    ? () => handleGiveFeedback(event.id)
                                    : undefined
                            }
                        />
                    ))}
                </View>
            </ScrollView>

            <FeedbackModal
                isVisible={isFeedbackModalVisible}
                onClose={() => setIsFeedbackModalVisible(false)}
                onSubmit={handleSubmitFeedback}
                eventTitle={
                    attendedEvents.find(event => event.id === selectedEvent)?.title || ''
                }
            />
        </View>
    );
}

const makeStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: theme.surface,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: theme.shadow,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        marginRight: 16,
    },
    nameContainer: {
        flex: 1,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.text,
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: theme.textSecondary,
    },
    editButton: {
        padding: 8,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: theme.surface,
        marginHorizontal: 16,
        marginTop: 16,
        padding: 16,
        borderRadius: 16,
        shadowColor: theme.shadow,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.primary,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: theme.textSecondary,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: theme.border,
    },
    section: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: theme.text,
        marginBottom: 16,
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 8,
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.primary,
    },
}); 