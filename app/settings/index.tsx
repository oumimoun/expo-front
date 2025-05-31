import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Nav from '../../components/Nav';

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

interface SettingItem {
    id: string;
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    type: 'toggle' | 'link' | 'danger';
    value?: boolean;
    onPress?: () => void;
}

export default function Settings() {
    const router = useRouter();

    const [settings, setSettings] = React.useState<SettingItem[]>([
        {
            id: 'notifications',
            title: 'Push Notifications',
            icon: 'notifications-outline',
            type: 'toggle',
            value: true,
        },
        {
            id: 'darkMode',
            title: 'Dark Mode',
            icon: 'moon-outline',
            type: 'toggle',
            value: false,
        },
        {
            id: 'emailNotifications',
            title: 'Email Notifications',
            icon: 'mail-outline',
            type: 'toggle',
            value: true,
        },
        {
            id: 'profile',
            title: 'Edit Profile',
            icon: 'person-outline',
            type: 'link',
            onPress: () => router.push('/Profile'),
        },
        {
            id: 'privacy',
            title: 'Privacy Policy',
            icon: 'lock-closed-outline',
            type: 'link',
        },
        {
            id: 'terms',
            title: 'Terms of Service',
            icon: 'document-text-outline',
            type: 'link',
        },
        {
            id: 'help',
            title: 'Help & Support',
            icon: 'help-circle-outline',
            type: 'link',
        },
        {
            id: 'about',
            title: 'About',
            icon: 'information-circle-outline',
            type: 'link',
        },
        {
            id: 'logout',
            title: 'Logout',
            icon: 'log-out-outline',
            type: 'danger',
        },
    ]);

    const handleToggle = (id: string) => {
        setSettings(prevSettings =>
            prevSettings.map(setting =>
                setting.id === id
                    ? { ...setting, value: !setting.value }
                    : setting
            )
        );
    };

    const renderSettingItem = (item: SettingItem) => {
        return (
            <TouchableOpacity
                key={item.id}
                style={[
                    styles.settingItem,
                    item.type === 'danger' && styles.dangerItem
                ]}
                onPress={() => {
                    if (item.type === 'toggle') {
                        handleToggle(item.id);
                    } else if (item.onPress) {
                        item.onPress();
                    }
                }}
            >
                <View style={styles.settingItemLeft}>
                    <View style={[
                        styles.iconContainer,
                        item.type === 'danger' && styles.dangerIcon
                    ]}>
                        <Ionicons
                            name={item.icon}
                            size={22}
                            color={item.type === 'danger' ? COLORS.red : COLORS.Green}
                        />
                    </View>
                    <Text style={[
                        styles.settingTitle,
                        item.type === 'danger' && styles.dangerText
                    ]}>
                        {item.title}
                    </Text>
                </View>

                {item.type === 'toggle' ? (
                    <Switch
                        value={item.value}
                        onValueChange={() => handleToggle(item.id)}
                        trackColor={{ false: '#767577', true: COLORS.lightGreen }}
                        thumbColor={item.value ? COLORS.Green : '#f4f3f4'}
                    />
                ) : (
                    <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={item.type === 'danger' ? COLORS.red : COLORS.greyText}
                    />
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Settings</Text>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.settingsGroup}>
                        {settings.map(renderSettingItem)}
                    </View>

                    <Text style={styles.version}>Version 1.0.0</Text>
                </ScrollView>
            </SafeAreaView>
            <Nav />
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
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 15,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    settingsGroup: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        marginTop: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    settingItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.lightGreen,
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingTitle: {
        fontSize: 16,
        color: COLORS.black,
        fontWeight: '500',
    },
    dangerItem: {
        borderBottomWidth: 0,
    },
    dangerIcon: {
        backgroundColor: '#ffebeb',
    },
    dangerText: {
        color: COLORS.red,
    },
    version: {
        textAlign: 'center',
        color: COLORS.greyText,
        marginTop: 20,
        fontSize: 14,
    },
}); 