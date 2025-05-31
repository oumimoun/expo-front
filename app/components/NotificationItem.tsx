import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface NotificationItemProps {
    id: string;
    title: string;
    message: string;
    type: 'event' | 'feedback' | 'system';
    timestamp: string;
    read: boolean;
    eventId?: string;
    onMarkAsRead: (id: string) => void;
}

export default function NotificationItem({
    id,
    title,
    message,
    type,
    timestamp,
    read,
    eventId,
    onMarkAsRead,
}: NotificationItemProps) {
    const router = useRouter();
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    const getIcon = () => {
        switch (type) {
            case 'event':
                return 'calendar';
            case 'feedback':
                return 'star';
            case 'system':
                return 'information-circle';
            default:
                return 'notifications';
        }
    };

    const getIconColor = () => {
        switch (type) {
            case 'event':
                return theme.primary;
            case 'feedback':
                return theme.accent;
            case 'system':
                return theme.textSecondary;
            default:
                return theme.textSecondary;
        }
    };

    const handlePress = () => {
        if (!read) {
            onMarkAsRead(id);
        }
        if (type === 'event' && eventId) {
            router.push('/events/upcoming');
        }
    };

    return (
        <TouchableOpacity
            style={[styles.container, read && styles.readContainer]}
            onPress={handlePress}
        >
            <View style={[styles.iconContainer, { backgroundColor: `${getIconColor()}15` }]}>
                <Ionicons name={getIcon()} size={24} color={getIconColor()} />
            </View>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title} numberOfLines={1}>
                        {title}
                    </Text>
                    <Text style={styles.timestamp}>{timestamp}</Text>
                </View>
                <Text style={styles.message} numberOfLines={2}>
                    {message}
                </Text>
            </View>
            {!read && <View style={styles.unreadDot} />}
        </TouchableOpacity>
    );
}

const makeStyles = (theme: any) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: theme.surface,
        borderRadius: 12,
        marginBottom: 8,
        shadowColor: theme.shadow,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    readContainer: {
        opacity: 0.7,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.text,
        flex: 1,
        marginRight: 8,
    },
    timestamp: {
        fontSize: 12,
        color: theme.textSecondary,
    },
    message: {
        fontSize: 14,
        color: theme.textSecondary,
        lineHeight: 20,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.primary,
        position: 'absolute',
        top: 8,
        right: 8,
    },
}); 