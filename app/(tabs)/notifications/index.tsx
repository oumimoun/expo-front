import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import NotificationItem from '../../components/NotificationItem';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../theme/ThemeContext';

export default function Notifications() {
    const { theme } = useTheme();
    const { notifications, markAsRead, unreadCount } = useNotifications();

    const styles = makeStyles(theme);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Notifications</Text>
                {unreadCount > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                            {unreadCount}
                        </Text>
                    </View>
                )}
            </View>

            <ScrollView style={styles.content}>
                {notifications.map(notification => (
                    <NotificationItem
                        key={notification.id}
                        {...notification}
                        onMarkAsRead={markAsRead}
                    />
                ))}
                {notifications.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>
                            No notifications yet
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const makeStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    header: {
        flexDirection: 'row',
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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.text,
        flex: 1,
    },
    badge: {
        backgroundColor: theme.primary,
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        minWidth: 24,
        alignItems: 'center',
    },
    badgeText: {
        color: theme.surface,
        fontSize: 12,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
    },
    emptyStateText: {
        fontSize: 16,
        color: theme.textSecondary,
    },
}); 