import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Navbar from '../components/Navbar';

// Mock user data
const userData = {
    name: "oussama Lamrabti",
    login: "olamrabt",
    role: "student M9wed",
    stats: [
        {
            label: "Events Attended",
            value: "3",
            icon: "checkmark-circle-outline",
            route: "/events/attended" as const
        },
        {
            label: "Upcoming Events",
            value: "36",
            icon: "calendar-outline",
            route: "/events/upcoming" as const
        }
    ],
    preferences: ["Web", "AI", "Sec"]
};

export default function Profile() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <ScrollView style={styles.content}>
                {/* Header Section */}
                <View style={styles.header}>
                    <View style={styles.profileImagePlaceholder}>
                        <Text style={styles.profileInitials}>
                            {userData.name.split(' ').map(n => n[0]).join('')}
                        </Text>
                    </View>
                    <Text style={styles.name}>{userData.name}</Text>
                    <Text style={styles.login}>@{userData.login}</Text>
                    <Text style={styles.role}>{userData.role}</Text>
                </View>

                {/* Stats Section */}
                <View style={styles.statsContainer}>
                    {userData.stats.map((stat, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.statItem}
                            onPress={() => router.push(stat.route)}
                        >
                            <View style={styles.statIconContainer}>
                                <Ionicons name={stat.icon as any} size={24} color="#1A866F" />
                            </View>
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                            <View style={styles.statArrow}>
                                <Ionicons name="chevron-forward" size={16} color="#1A1D1F" />
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Preferences Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Interests</Text>
                    <View style={styles.preferencesContainer}>
                        {userData.preferences.map((pref, index) => (
                            <View key={index} style={styles.preferenceTag}>
                                <Text style={styles.preferenceText}>{pref}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Settings Options */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Settings</Text>
                    <View style={styles.settingsContainer}>
                        <TouchableOpacity style={styles.settingItem}>
                            <Ionicons name="person-outline" size={24} color="#1A1D1F" />
                            <Text style={styles.settingText}>Edit Profile</Text>
                            <Ionicons name="chevron-forward" size={24} color="#1A1D1F" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.settingItem}>
                            <Ionicons name="notifications-outline" size={24} color="#1A1D1F" />
                            <Text style={styles.settingText}>Notifications</Text>
                            <Ionicons name="chevron-forward" size={24} color="#1A1D1F" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.settingItem}>
                            <Ionicons name="shield-outline" size={24} color="#1A1D1F" />
                            <Text style={styles.settingText}>Privacy</Text>
                            <Ionicons name="chevron-forward" size={24} color="#1A1D1F" />
                        </TouchableOpacity>
                    </View>
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
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 16,
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
    profileImagePlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#1A866F',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    profileInitials: {
        fontSize: 36,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1D1F',
        marginBottom: 4,
    },
    login: {
        fontSize: 16,
        color: '#1A1D1F',
        opacity: 0.6,
        marginBottom: 4,
    },
    role: {
        fontSize: 14,
        color: '#1A866F',
        fontWeight: '600',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 24,
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
        marginTop: 16,
        borderRadius: 16,
        marginHorizontal: 16,
        gap: 16,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
        backgroundColor: '#F5F7FA',
        padding: 16,
        borderRadius: 12,
        position: 'relative',
    },
    statIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E8F5F1',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1D1F',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
        color: '#1A1D1F',
        opacity: 0.6,
        textAlign: 'center',
    },
    statArrow: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
    section: {
        marginTop: 24,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1A1D1F',
        marginBottom: 16,
    },
    preferencesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    preferenceTag: {
        backgroundColor: '#E8ECF4',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    preferenceText: {
        color: '#1A1D1F',
        fontSize: 14,
        fontWeight: '500',
    },
    settingsContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E8ECF4',
    },
    settingText: {
        flex: 1,
        marginLeft: 16,
        fontSize: 16,
        color: '#1A1D1F',
    },
}); 