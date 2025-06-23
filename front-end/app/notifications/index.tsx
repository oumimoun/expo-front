import Nav from '@/components/Nav';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
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
import { useTheme } from '../../contexts/ThemeContext';
import { Notification, notificationService } from '../../services/notificationService';

const { width } = Dimensions.get('window');

const COLORS = {
    background: '#FFFFFF',
    Green: '#1b8456',
    black: '#000000',
    greyText: '#555555',
    lightGreen: '#e0f0e9',
    lightGrey: '#f9f9f9',
    white: '#FFFFFF',
    red: '#ff4444',
    blue: '#3a7bd5',
    orange: '#ff9f43',
    purple: '#8854d0'
};


export default function Notifications() {
    const getNotificationConfig = (type: Notification['type']) => {
        switch (type) {
            case 'event':
                return {
                    icon: 'calendar-outline',
                    color: COLORS.Green,
                    bgColor: `${COLORS.Green}15`
                };
            case 'reminder':
                return {
                    icon: 'alarm-outline',
                    color: COLORS.orange,
                    bgColor: `${COLORS.orange}15`
                };
            case 'update':
                return {
                    icon: 'information-circle-outline',
                    color: COLORS.blue,
                    bgColor: `${COLORS.blue}15`
                };
            default:
                return {
                    icon: 'notifications-outline',
                    color: COLORS.greyText,
                    bgColor: `${COLORS.greyText}15`
                };
        }
    };
    const { isDarkMode, colors } = useTheme();
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchNotifications = async () => {
        try {
            setError(null);
            const fetchedNotifications = await notificationService.getNotifications();
            
            // Sort notifications by date (newest first)
            const sortedNotifications = [...fetchedNotifications].sort((a, b) => {
                const dateA = new Date(a.time);
                const dateB = new Date(b.time);
                return dateB.getTime() - dateA.getTime();
            });
            setNotifications(sortedNotifications);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setError('Failed to load notifications. Pull down to try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchNotifications();
    }, []);

    // Fetch when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchNotifications();
        }, [])
    );

    const markAsRead = async (notificationId: string) => {
        try {
            await notificationService.markAsRead(notificationId);
            fetchNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();

        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await fetchNotifications();
        } finally {
            setRefreshing(false);
        }
    }, []);

    const handleNotificationPress = async (notification: Notification) => {
        if (!notification.read) {
            await markAsRead(notification.id);
        }
        if (notification.type === 'event' && notification.eventId) {
            router.push(`/event/${notification.eventId}`);
        }
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.green} />
                </View>
            );
        }

        if (error) {
            return (
                <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
                    <Ionicons name="alert-circle-outline" size={64} color={colors.red} />
                    <Text style={[styles.emptyText, { color: colors.text }]}>Oops!</Text>
                    <Text style={[styles.emptySubtext, { color: colors.greyText }]}>
                        {error}
                    </Text>
                </View>
            );
        }

        if (notifications.length === 0) {
            return (
                <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
                    <Ionicons name="notifications-off-outline" size={64} color={colors.greyText} />
                    <Text style={[styles.emptyText, { color: colors.text }]}>No notifications</Text>
                    <Text style={[styles.emptySubtext, { color: colors.greyText }]}>
                        We'll notify you when there are new events or updates
                    </Text>
                </View>
            );
        }

        return (
            <View style={styles.notificationsContainer}>
                {notifications.map(notification => {
                    const config = getNotificationConfig(notification.type);
                    return (
                        <Pressable
                            key={notification.id}
                            style={[
                                styles.notificationCard,
                                !notification.read && [
                                    styles.unreadCard,
                                    { borderColor: config.color }
                                ],
                                {
                                    backgroundColor: colors.surface,
                                    borderColor: colors.border
                                }
                            ]}
                            onPress={() => handleNotificationPress(notification)}
                        >
                            <View style={[
                                styles.iconContainer,
                                { backgroundColor: config.bgColor }
                            ]}>
                                <Ionicons
                                    name={config.icon as any}
                                    size={24}
                                    color={config.color}
                                />
                            </View>

                            <View style={styles.notificationContent}>
                                <View style={styles.notificationHeader}>
                                    <Text style={[
                                        styles.notificationTitle,
                                        { color: colors.text }
                                    ]}>
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
                                    <TouchableOpacity 
                                        style={[
                                            styles.eventLink,
                                            {
                                                backgroundColor: config.bgColor,
                                            }
                                        ]}
                                        onPress={() => router.push(`/event/${notification.eventId}`)}
                                    >
                                        <Ionicons
                                            name="link-outline"
                                            size={16}
                                            color={config.color}
                                        />
                                        <Text style={[
                                            styles.eventLinkText,
                                            { color: config.color }
                                        ]}>
                                            {notification.eventTitle}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {!notification.read && (
                                <View style={[
                                    styles.unreadDot,
                                    { backgroundColor: config.color }
                                ]} />
                            )}
                        </Pressable>
                    );
                })}
            </View>
        );
    };

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
                    {renderContent()}
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
        borderWidth: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e0f0e9',
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
        fontWeight: '600',
        flex: 1,
        marginRight: 8,
    },
    timeText: {
        fontSize: 12,
    },
    messageText: {
        fontSize: 14,
        lineHeight: 20,
    },
    eventLink: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
        padding: 8,
        borderRadius: 8,
    },
    eventLinkText: {
        fontSize: 14,
        fontWeight: '500',
    },
    unreadDot: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 8,
        height: 8,
        borderRadius: 4,
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
