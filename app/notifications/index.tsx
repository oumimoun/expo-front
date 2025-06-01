import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Nav from '../../components/Nav';
import { useTheme } from '../../contexts/ThemeContext';

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
    const { isDarkMode, colors } = useTheme();
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
                {
                    backgroundColor: selectedFilter === option.type ? colors.lightGreen : colors.surface,
                    borderColor: selectedFilter === option.type ? colors.green : colors.border
                }
            ]}
            onPress={() => setSelectedFilter(option.type)}
        >
            <Ionicons
                name={option.icon}
                size={16}
                color={selectedFilter === option.type ? colors.green : colors.greyText}
                style={styles.filterIcon}
            />
            <Text style={[
                styles.filterButtonText,
                { color: selectedFilter === option.type ? colors.green : colors.greyText }
            ]}>
                {option.label}
            </Text>
        </TouchableOpacity>
    );

    const renderFilters = () => (
        <View style={[styles.filtersWrapper, { 
            backgroundColor: colors.background,
            borderBottomColor: colors.border
        }]}>
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
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar
                barStyle={isDarkMode ? "light-content" : "dark-content"}
                backgroundColor={colors.background}
                translucent={true}
            />
            <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
                <View style={[styles.header, { backgroundColor: colors.background }]}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
                    {unreadCount > 0 && (
                        <TouchableOpacity
                            style={[styles.markAllButton, { backgroundColor: colors.lightGrey }]}
                            onPress={markAllAsRead}
                        >
                            <Text style={[styles.markAllText, { color: colors.green }]}>Mark all as read</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {renderFilters()}

                <ScrollView
                    style={{ flex: 1 }}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.background }]}
                    bounces={true}
                    overScrollMode="never"
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[colors.green]}
                            tintColor={colors.green}
                        />
                    }
                >
                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={colors.green} />
                        </View>
                    ) : notifications.length > 0 ? (
                        <View style={styles.notificationsContainer}>
                            {getFilteredNotifications().map(notification => (
                                <Pressable
                                    key={notification.id}
                                    style={[
                                        styles.notificationCard,
                                        !notification.isRead && styles.unreadCard,
                                        {
                                            backgroundColor: colors.surface,
                                            borderColor: colors.border
                                        }
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
                                            <Text style={[styles.notificationTitle, { color: colors.text }]}>
                                                {notification.title}
                                            </Text>
                                            <Text style={[styles.timeText, { color: colors.greyText }]}>
                                                {notification.time}
                                            </Text>
                                        </View>

                                        <Text style={[styles.messageText, { color: colors.greyText }]}>
                                            {notification.message}
                                        </Text>

                                        {notification.eventTitle && (
                                            <TouchableOpacity style={[styles.eventLink, { backgroundColor: colors.lightGrey }]}>
                                                <Ionicons name="link-outline" size={16} color={colors.green} />
                                                <Text style={[styles.eventLinkText, { color: colors.green }]}>
                                                    {notification.eventTitle}
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>

                                    {!notification.isRead && (
                                        <View style={[styles.unreadDot, { backgroundColor: colors.green }]} />
                                    )}
                                </Pressable>
                            ))}
                        </View>
                    ) : (
                        <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
                            <Ionicons name="notifications-off-outline" size={64} color={colors.greyText} />
                            <Text style={[styles.emptyText, { color: colors.text }]}>No notifications</Text>
                            <Text style={[styles.emptySubtext, { color: colors.greyText }]}>
                                {selectedFilter === 'all'
                                    ? "We'll notify you when there are new events or updates"
                                    : `No ${selectedFilter} notifications yet`}
                            </Text>
                        </View>
                    )}
                </ScrollView>
            </View>
            <View style={[styles.navContainer, {
                backgroundColor: colors.surface,
                borderTopColor: colors.border
            }]}>
                <Nav />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    safeArea: {
        flex: 1,
        width: '100%',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingBottom: 15,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
        paddingBottom: 100,
    },
    notificationsContainer: {
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
        width: '100%',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
    },
    filtersWrapper: {
        borderBottomWidth: 1,
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
        borderWidth: 1,
    },
    filterIcon: {
        marginRight: 6,
    },
    filterButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
