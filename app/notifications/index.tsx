import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Pressable,
    RefreshControl,
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

interface FilterOption {
    type: NotificationType | 'all';
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
}

const FILTER_OPTIONS: FilterOption[] = [
    { type: 'all', label: 'All', icon: 'notifications-outline' },
    { type: 'event', label: 'Events', icon: 'calendar-outline' },
    { type: 'reminder', label: 'Reminders', icon: 'alarm-outline' },
    { type: 'update', label: 'Updates', icon: 'information-circle-outline' },
    { type: 'registration', label: 'Registrations', icon: 'checkmark-circle-outline' },
];

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
    const [refreshing, setRefreshing] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState<NotificationType | 'all'>('all');
    const [isLoading, setIsLoading] = useState(false);

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

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        // Simulate fetching new notifications
        setTimeout(() => {
            setRefreshing(false);
        }, 1500);
    }, []);

    const deleteNotification = (id: string) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    };

    const getFilteredNotifications = useCallback(() => {
        if (selectedFilter === 'all') {
            return notifications;
        }
        return notifications.filter(notification => notification.type === selectedFilter);
    }, [notifications, selectedFilter]);

    const FilterButton = ({ option }: { option: FilterOption }) => (
        <TouchableOpacity
            style={[
                styles.filterButton,
                selectedFilter === option.type && styles.filterButtonActive
            ]}
            onPress={() => setSelectedFilter(option.type)}
        >
            <Ionicons
                name={option.icon}
                size={16}
                color={selectedFilter === option.type ? COLORS.Green : COLORS.greyText}
                style={styles.filterIcon}
            />
            <Text style={[
                styles.filterButtonText,
                selectedFilter === option.type && styles.filterButtonTextActive
            ]}>
                {option.label}
            </Text>
        </TouchableOpacity>
    );

    const renderFilters = () => (
        <View style={styles.filtersWrapper}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filtersContainer}
            >
                {FILTER_OPTIONS.map((option) => (
                    <FilterButton key={option.type} option={option} />
                ))}
            </ScrollView>
        </View>
    );

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

                {renderFilters()}

                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={COLORS.Green} />
                    </View>
                ) : notifications.length > 0 ? (
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                        bounces={true}
                        overScrollMode="never"
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={[COLORS.Green]}
                                tintColor={COLORS.Green}
                            />
                        }
                    >
                        <View style={styles.notificationsContainer}>
                            {getFilteredNotifications().map(notification => (
                                <Pressable
                                    key={notification.id}
                                    style={[
                                        styles.notificationCard,
                                        !notification.isRead && styles.unreadCard
                                    ]}
                                    onPress={() => markAsRead(notification.id)}
                                    onLongPress={() => deleteNotification(notification.id)}
                                >
                                    <View style={[
                                        styles.iconContainer,
                                        { backgroundColor: `${getNotificationIcon(notification.type).color}15` }
                                    ]}>
                                        <Ionicons
                                            name={getNotificationIcon(notification.type).name}
                                            size={24}
                                            color={getNotificationIcon(notification.type).color}
                                        />
                                    </View>

                                    <View style={styles.notificationContent}>
                                        <View style={styles.notificationHeader}>
                                            <Text style={styles.notificationTitle}>{notification.title}</Text>
                                            <Text style={styles.timeText}>{notification.time}</Text>
                                        </View>

                                        <Text style={styles.messageText}>{notification.message}</Text>

                                        {notification.eventTitle && (
                                            <TouchableOpacity style={styles.eventLink}>
                                                <Ionicons name="link-outline" size={16} color={COLORS.Green} />
                                                <Text style={styles.eventLinkText}>{notification.eventTitle}</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>

                                    {!notification.isRead && (
                                        <View style={styles.unreadDot} />
                                    )}
                                </Pressable>
                            ))}
                        </View>
                    </ScrollView>
                ) : (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="notifications-off-outline" size={64} color={COLORS.greyText} />
                        <Text style={styles.emptyText}>No notifications</Text>
                        <Text style={styles.emptySubtext}>
                            {selectedFilter === 'all'
                                ? "We'll notify you when there are new events or updates"
                                : `No ${selectedFilter} notifications yet`}
                        </Text>
                    </View>
                )}
            </SafeAreaView>
            <View style={styles.navContainer}>
                <Nav />
            </View>
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
        paddingBottom: 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 15,
        backgroundColor: COLORS.background,
        zIndex: 1,
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
        flexGrow: 1,
    },
    notificationsContainer: {
        padding: 20,
        gap: 12,
        paddingBottom: 20,
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
        padding: 8,
        backgroundColor: COLORS.lightGrey,
        borderRadius: 8,
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
    navContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.background,
    },
    filtersWrapper: {
        backgroundColor: COLORS.background,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    filtersContainer: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        flexDirection: 'row',
        gap: 10,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.lightGrey,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    filterButtonActive: {
        backgroundColor: COLORS.lightGreen,
        borderColor: COLORS.Green,
    },
    filterIcon: {
        marginRight: 6,
    },
    filterButtonText: {
        color: COLORS.greyText,
        fontSize: 14,
        fontWeight: '500',
    },
    filterButtonTextActive: {
        color: COLORS.Green,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
