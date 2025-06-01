import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Modal,
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
    type: 'toggle' | 'link' | 'danger' | 'language';
    value?: boolean;
    onPress?: () => void;
    subtitle?: string;
}

export default function Settings() {
    const router = useRouter();
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('English');

    const languages = [
        { id: 'en', name: 'English' },
        { id: 'fr', name: 'Français' },
        { id: 'es', name: 'Español' },
        { id: 'ar', name: 'العربية' },
    ];

    const handleLogout = () => {
        // Here you can add any logout logic like clearing tokens, user data, etc.
        router.replace('/');
    };

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
            id: 'language',
            title: 'Language',
            subtitle: selectedLanguage,
            icon: 'language-outline',
            type: 'language',
            onPress: () => setShowLanguageModal(true),
        },
        {
            id: 'logout',
            title: 'Logout',
            icon: 'log-out-outline',
            type: 'danger',
            onPress: handleLogout,
        }
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

    const handleLanguageSelect = (language: string) => {
        setSelectedLanguage(language);
        setShowLanguageModal(false);
        setSettings(prevSettings =>
            prevSettings.map(setting =>
                setting.id === 'language'
                    ? { ...setting, subtitle: language }
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
                    <View>
                        <Text style={[
                            styles.settingTitle,
                            item.type === 'danger' && styles.dangerText
                        ]}>
                            {item.title}
                        </Text>
                        {item.subtitle && (
                            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                        )}
                    </View>
                </View>

                {item.type === 'toggle' ? (
                    <Switch
                        value={item.value}
                        onValueChange={() => handleToggle(item.id)}
                        trackColor={{ false: '#767577', true: COLORS.lightGreen }}
                        thumbColor={item.value ? COLORS.Green : '#f4f3f4'}
                    />
                ) : item.type === 'language' ? (
                    <View style={styles.languageSelector}>
                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color={COLORS.greyText}
                        />
                    </View>
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
                    bounces={true}
                    overScrollMode="never"
                >
                    <View style={styles.settingsGroup}>
                        {settings.map(renderSettingItem)}
                    </View>

                    <Text style={styles.version}>Version 1.0.0</Text>
                </ScrollView>

                <Modal
                    visible={showLanguageModal}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setShowLanguageModal(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Select Language</Text>
                                <TouchableOpacity
                                    onPress={() => setShowLanguageModal(false)}
                                    style={styles.closeButton}
                                >
                                    <Ionicons name="close" size={24} color={COLORS.greyText} />
                                </TouchableOpacity>
                            </View>
                            {languages.map((language) => (
                                <TouchableOpacity
                                    key={language.id}
                                    style={[
                                        styles.languageOption,
                                        selectedLanguage === language.name && styles.selectedLanguage
                                    ]}
                                    onPress={() => handleLanguageSelect(language.name)}
                                >
                                    <Text style={[
                                        styles.languageText,
                                        selectedLanguage === language.name && styles.selectedLanguageText
                                    ]}>
                                        {language.name}
                                    </Text>
                                    {selectedLanguage === language.name && (
                                        <Ionicons name="checkmark" size={20} color={COLORS.Green} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </Modal>
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
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingBottom: 20,
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
    settingSubtitle: {
        fontSize: 14,
        color: COLORS.greyText,
        marginTop: 2,
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
    navContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.background,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    closeButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: COLORS.lightGrey,
    },
    languageOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    selectedLanguage: {
        backgroundColor: COLORS.lightGreen,
    },
    languageText: {
        fontSize: 16,
        color: COLORS.black,
    },
    selectedLanguageText: {
        color: COLORS.Green,
        fontWeight: '600',
    },
    languageSelector: {
        flexDirection: 'row',
        alignItems: 'center',
    },
}); 