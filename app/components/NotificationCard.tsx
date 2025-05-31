import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from 'react-native';

export type NotificationType =
    | 'event_reminder'
    | 'event_update'
    | 'event_cancelled'
    | 'new_admin'
    | 'friend_joined'
    | 'event_feedback';

interface NotificationData {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    timestamp: string;
    eventId?: string;
    isRead: boolean;
    actionData?: {
        actionType: 'view' | 'respond' | 'feedback';
        actionText: string;
    };
}

interface NotificationCardProps {
    notification: NotificationData;
    onPress?: () => void;
    onAction?: () => void;
    onDismiss?: () => void;
}

const getNotificationIcon = (type: NotificationType): { name: string; color: string } => {
    switch (type) {
        case 'event_reminder':
            return { name: 'alarm-outline', color: '#1A866F' };
        case 'event_update':
            return { name: 'refresh-outline', color: '#3B82F6' };
        case 'event_cancelled':
            return { name: 'close-circle-outline', color: '#EF4444' };
        case 'new_admin':
            return { name: 'shield-checkmark-outline', color: '#8B5CF6' };
        case 'friend_joined':
            return { name: 'person-add-outline', color: '#F59E0B' };
        case 'event_feedback':
            return { name: 'star-outline', color: '#10B981' };
        default:
            return { name: 'notifications-outline', color: '#6B7280' };
    }
};

export default function NotificationCard({
    notification,
    onPress,
    onAction,
    onDismiss
}: NotificationCardProps) {
    const router = useRouter();
    const { width } = useWindowDimensions();
    const translateX = React.useRef(new Animated.Value(0)).current;
    const icon = getNotificationIcon(notification.type);

    const handleSwipe = (direction: 'left' | 'right') => {
        Animated.spring(translateX, {
            toValue: direction === 'left' ? -width : width,
            useNativeDriver: true,
        }).start(() => {
            if (onDismiss) {
                onDismiss();
            }
        });
    };

    const getTimeAgo = (timestamp: string) => {
        const now = new Date();
        const notificationTime = new Date(timestamp);
        const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    };

    return (
        <Animated.View
            style={[
                styles.container,
                { transform: [{ translateX }] },
                !notification.isRead && styles.unread
            ]}
        >
            <TouchableOpacity
                style={styles.content}
                onPress={onPress}
                activeOpacity={0.7}
            >
                <View style={[styles.iconContainer, { backgroundColor: `${icon.color}15` }]}>
                    <Ionicons name={icon.name as any} size={24} color={icon.color} />
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.title} numberOfLines={1}>
                        {notification.title}
                    </Text>
                    <Text style={styles.message} numberOfLines={2}>
                        {notification.message}
                    </Text>
                    <View style={styles.footer}>
                        <Text style={styles.timestamp}>
                            {getTimeAgo(notification.timestamp)}
                        </Text>
                        {notification.actionData && (
                            <TouchableOpacity
                                style={[
                                    styles.actionButton,
                                    { backgroundColor: `${icon.color}15` }
                                ]}
                                onPress={onAction}
                            >
                                <Text style={[styles.actionText, { color: icon.color }]}>
                                    {notification.actionData.actionText}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginHorizontal: 16,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    unread: {
        borderLeftWidth: 3,
        borderLeftColor: '#1A866F',
    },
    content: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1D1F',
        marginBottom: 4,
    },
    message: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
        marginBottom: 8,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    timestamp: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    actionButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    actionText: {
        fontSize: 12,
        fontWeight: '500',
    },
}); 