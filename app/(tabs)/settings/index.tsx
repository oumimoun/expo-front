import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Modal,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

export default function Settings() {
    const router = useRouter();
    const { theme, isDark, toggleTheme } = useTheme();
    const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

    const handleLogout = () => {
        setIsLogoutModalVisible(false);
        // Here you would typically clear user session/token
        router.replace('/');
    };

    const styles = makeStyles(theme);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Settings</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Appearance</Text>
                <View style={styles.settingItem}>
                    <View style={styles.settingInfo}>
                        <Ionicons
                            name={isDark ? 'moon' : 'sunny'}
                            size={24}
                            color={theme.text}
                        />
                        <Text style={styles.settingText}>Dark Mode</Text>
                    </View>
                    <Switch
                        value={isDark}
                        onValueChange={toggleTheme}
                        trackColor={{
                            false: theme.border,
                            true: `${theme.primary}80`,
                        }}
                        thumbColor={isDark ? theme.primary : theme.surface}
                    />
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notifications</Text>
                <TouchableOpacity style={styles.settingItem}>
                    <View style={styles.settingInfo}>
                        <Ionicons name="notifications" size={24} color={theme.text} />
                        <Text style={styles.settingText}>Push Notifications</Text>
                    </View>
                    <Ionicons
                        name="chevron-forward"
                        size={24}
                        color={theme.textSecondary}
                    />
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingItem}>
                    <View style={styles.settingInfo}>
                        <Ionicons name="mail" size={24} color={theme.text} />
                        <Text style={styles.settingText}>Email Notifications</Text>
                    </View>
                    <Ionicons
                        name="chevron-forward"
                        size={24}
                        color={theme.textSecondary}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account</Text>
                <TouchableOpacity style={styles.settingItem}>
                    <View style={styles.settingInfo}>
                        <Ionicons name="person" size={24} color={theme.text} />
                        <Text style={styles.settingText}>Edit Profile</Text>
                    </View>
                    <Ionicons
                        name="chevron-forward"
                        size={24}
                        color={theme.textSecondary}
                    />
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingItem}>
                    <View style={styles.settingInfo}>
                        <Ionicons name="lock-closed" size={24} color={theme.text} />
                        <Text style={styles.settingText}>Change Password</Text>
                    </View>
                    <Ionicons
                        name="chevron-forward"
                        size={24}
                        color={theme.textSecondary}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.settingItem}
                    onPress={() => setIsLogoutModalVisible(true)}
                >
                    <View style={styles.settingInfo}>
                        <Ionicons name="log-out" size={24} color={theme.accent} />
                        <Text style={[styles.settingText, { color: theme.accent }]}>
                            Logout
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            <Modal
                visible={isLogoutModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIsLogoutModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Logout</Text>
                        <Text style={styles.modalText}>
                            Are you sure you want to logout?
                        </Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setIsLogoutModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.logoutButton]}
                                onPress={handleLogout}
                            >
                                <Text style={styles.logoutButtonText}>Logout</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const makeStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    header: {
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
    },
    section: {
        marginTop: 24,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.textSecondary,
        marginBottom: 8,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: theme.surface,
        marginBottom: 1,
        borderRadius: 12,
        marginVertical: 4,
    },
    settingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    settingText: {
        fontSize: 16,
        color: theme.text,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: theme.surface,
        borderRadius: 24,
        padding: 24,
        width: '80%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.text,
        marginBottom: 16,
    },
    modalText: {
        fontSize: 16,
        color: theme.textSecondary,
        marginBottom: 24,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: theme.background,
    },
    logoutButton: {
        backgroundColor: theme.accent,
    },
    cancelButtonText: {
        color: theme.text,
        fontSize: 16,
        fontWeight: '600',
    },
    logoutButtonText: {
        color: theme.surface,
        fontSize: 16,
        fontWeight: '600',
    },
}); 