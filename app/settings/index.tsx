import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Nav from '../../components/Nav';
import { useTheme } from '../../contexts/ThemeContext';

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
    onToggle?: () => void;
    subtitle?: string;
}

const Settings = () => {
    const router = useRouter();
    const { isDarkMode, toggleDarkMode, colors } = useTheme();
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('English');

    const languages = [
        { id: 'en', name: 'English' },
        { id: 'fr', name: 'Français' },
        { id: 'es', name: 'Español' },
        { id: 'ar', name: 'العربية' },
    ];

    const handleLogout = () => {
        router.replace('/');
    };

    const [settings, setSettings] = React.useState<SettingItem[]>([]);

    React.useEffect(() => {
        setSettings([
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
                icon: isDarkMode ? 'moon' : 'moon-outline',
                type: 'toggle',
                value: isDarkMode,
                onToggle: toggleDarkMode,
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
    }, [isDarkMode, selectedLanguage]);

    const handleToggle = (id: string) => {
        const setting = settings.find(s => s.id === id);
        if (setting?.onToggle) {
            setting.onToggle();
        } else {
            setSettings(prevSettings =>
                prevSettings.map(setting =>
                    setting.id === id
                        ? { ...setting, value: !setting.value }
                        : setting
                )
            );
        }
    };

    const handleLanguageSelect = (language: string) => {
        setSelectedLanguage(language);
        setShowLanguageModal(false);
    };

    const renderSettingItem = (item: SettingItem) => {
        const isDanger = item.type === 'danger';
        return (
            <TouchableOpacity
                key={item.id}
                style={[
                    styles.settingItem,
                    isDanger && styles.dangerItem,
                    { borderBottomColor: colors.border }
                ]}
                onPress={() => {
                    if (item.type === 'toggle') {
                        handleToggle(item.id);
                    } else if (item.onPress) {
                        item.onPress();
                    }
                }}
                activeOpacity={0.7}
            >
                <View style={styles.settingItemLeft}>
                    <View style={[
                        styles.iconContainer,
                        {
                            backgroundColor: isDanger
                                ? isDarkMode ? 'rgba(255, 59, 48, 0.2)' : '#ffebeb'
                                : isDarkMode
                                    ? `${colors.green}30`
                                    : colors.lightGreen
                        }
                    ]}>
                        <Ionicons
                            name={item.icon}
                            size={22}
                            color={isDanger ? colors.red : colors.green}
                        />
                    </View>
                    <View>
                        <Text style={[
                            styles.settingTitle,
                            {
                                color: isDanger ? colors.red : colors.text
                            }
                        ]}>
                            {item.title}
                        </Text>
                        {item.subtitle && (
                            <Text style={[styles.settingSubtitle, { color: colors.greyText }]}>
                                {item.subtitle}
                            </Text>
                        )}
                    </View>
                </View>

                {item.type === 'toggle' ? (
                    <Switch
                        value={item.value}
                        onValueChange={() => handleToggle(item.id)}
                        trackColor={{ false: colors.border, true: colors.lightGreen }}
                        thumbColor={item.value ? colors.green : colors.greyText}
                        ios_backgroundColor={colors.border}
                    />
                ) : item.type === 'language' ? (
                    <View style={styles.languageSelector}>
                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color={colors.greyText}
                        />
                    </View>
                ) : (
                    <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={isDanger ? colors.red : colors.greyText}
                    />
                )}
            </TouchableOpacity>
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
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
                </View>

                <ScrollView
                    style={{ flex: 1 }}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.background }]}
                    bounces={true}
                    overScrollMode="never"
                >
                    <View style={[styles.settingsGroup, {
                        backgroundColor: colors.surface,
                        borderColor: colors.border
                    }]}>
                        {settings.map(renderSettingItem)}
                    </View>
                </ScrollView>

                <Modal
                    visible={showLanguageModal}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setShowLanguageModal(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={[styles.modalContent, {
                            backgroundColor: colors.surface
                        }]}>
                            <View style={[styles.modalHeader, {
                                borderBottomColor: colors.border
                            }]}>
                                <Text style={[styles.modalTitle, { color: colors.text }]}>
                                    Select Language
                                </Text>
                                <TouchableOpacity
                                    onPress={() => setShowLanguageModal(false)}
                                    style={[styles.closeButton, { backgroundColor: colors.lightGrey }]}
                                >
                                    <Ionicons name="close" size={24} color={colors.greyText} />
                                </TouchableOpacity>
                            </View>
                            {languages.map((language) => (
                                <TouchableOpacity
                                    key={language.id}
                                    style={[
                                        styles.languageOption,
                                        { borderBottomColor: colors.border },
                                        selectedLanguage === language.name && [
                                            styles.selectedLanguage,
                                            { backgroundColor: isDarkMode ? `${colors.green}20` : colors.lightGreen }
                                        ]
                                    ]}
                                    onPress={() => handleLanguageSelect(language.name)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[
                                        styles.languageText,
                                        { color: colors.text },
                                        selectedLanguage === language.name && [
                                            styles.selectedLanguageText,
                                            { color: colors.green }
                                        ]
                                    ]}>
                                        {language.name}
                                    </Text>
                                    {selectedLanguage === language.name && (
                                        <Ionicons name="checkmark" size={20} color={colors.green} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </Modal>
            </View>
            <View style={[styles.navContainer, {
                backgroundColor: colors.surface,
                borderTopColor: colors.border,
                borderTopWidth: isDarkMode ? 0 : 1
            }]}>
                <Nav />
            </View>
        </View>
    );
};

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
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 100,
    },
    settingsGroup: {
        borderRadius: 16,
        marginTop: 20,
        marginBottom: 20,
        overflow: 'hidden',
        borderWidth: 1,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    settingSubtitle: {
        fontSize: 14,
        marginTop: 2,
    },
    dangerItem: {
        borderBottomWidth: 0,
    },
    version: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 14,
    },
    navContainer: {
        width: '100%',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
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
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 8,
        borderRadius: 20,
    },
    languageOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
    },
    selectedLanguage: {
        backgroundColor: '#e0f0e9',
    },
    languageText: {
        fontSize: 16,
    },
    selectedLanguageText: {
        fontWeight: '600',
    },
    languageSelector: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default Settings; 