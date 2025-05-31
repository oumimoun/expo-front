import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Navbar from './components/Navbar';

const settingsOptions = [
    {
        icon: 'person-outline',
        title: 'Account',
        description: 'Manage your account settings',
    },
    {
        icon: 'notifications-outline',
        title: 'Notifications',
        description: 'Configure notification preferences',
    },
    {
        icon: 'shield-outline',
        title: 'Privacy',
        description: 'Control your privacy settings',
    },
    {
        icon: 'color-palette-outline',
        title: 'Appearance',
        description: 'Customize app appearance',
    },
    {
        icon: 'help-circle-outline',
        title: 'Help & Support',
        description: 'Get help and contact support',
    },
];

export default function Settings() {
    return (
        <View style={styles.container}>
            <ScrollView style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Settings</Text>
                </View>
                <View style={styles.settingsList}>
                    {settingsOptions.map((option, index) => (
                        <TouchableOpacity key={index} style={styles.settingItem}>
                            <Ionicons name={option.icon as any} size={24} color="#1A1D1F" />
                            <View style={styles.settingText}>
                                <Text style={styles.settingTitle}>{option.title}</Text>
                                <Text style={styles.settingDescription}>{option.description}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color="#1A1D1F" />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
            <Navbar />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    content: {
        flex: 1,
    },
    header: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1D1F',
    },
    settingsList: {
        padding: 16,
        gap: 8,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    settingText: {
        flex: 1,
        marginLeft: 16,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1D1F',
        marginBottom: 2,
    },
    settingDescription: {
        fontSize: 14,
        color: '#1A1D1F',
        opacity: 0.6,
    },
}); 