import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function Settings() {
    const router = useRouter();
    const { theme, isDark, toggleTheme } = useTheme();
    const styles = makeStyles(theme);

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: () => {
                        // Add your logout logic here
                        router.replace('/');
                    },
                },
            ],
            { cancelable: true }
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Settings</Text>
            </View>

            <View style={styles.content}>
                <TouchableOpacity
                    style={styles.settingItem}
                    onPress={toggleTheme}
                >
                    <View style={styles.settingInfo}>
                        <Ionicons
                            name={isDark ? "moon" : "sunny"}
                            size={24}
                            color={theme.text}
                        />
                        <Text style={styles.settingText}>
                            {isDark ? 'Dark Mode' : 'Light Mode'}
                        </Text>
                    </View>
                    <Ionicons
                        name="chevron-forward"
                        size={24}
                        color={theme.textSecondary}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.settingItem, styles.logoutButton]}
                    onPress={handleLogout}
                >
                    <View style={styles.settingInfo}>
                        <Ionicons
                            name="log-out-outline"
                            size={24}
                            color={theme.accent}
                        />
                        <Text style={[styles.settingText, styles.logoutText]}>
                            Logout
                        </Text>
                    </View>
                    <Ionicons
                        name="chevron-forward"
                        size={24}
                        color={theme.accent}
                    />
                </TouchableOpacity>
            </View>
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
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
    },
    backButton: {
        marginRight: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.text,
    },
    content: {
        padding: 16,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.surface,
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    settingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    settingText: {
        fontSize: 16,
        color: theme.text,
        fontWeight: '500',
    },
    logoutButton: {
        marginTop: 24,
    },
    logoutText: {
        color: theme.accent,
    },
}); 