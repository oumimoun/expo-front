import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import EventCard from '../components/EventCard';

const upcomingEvents = [
    {
        id: '1',
        title: 'Advanced React Patterns',
        date: '2024-04-15T14:00:00',
        location: 'Room A1',
        category: 'Web',
        isSubscribed: true,
    },
    {
        id: '2',
        title: 'Machine Learning Workshop',
        date: '2024-04-16T15:30:00',
        location: 'Room B2',
        category: 'AI',
        isSubscribed: true,
    },
    {
        id: '3',
        title: 'Ethical Hacking',
        date: '2024-04-17T13:00:00',
        location: 'Room C3',
        category: 'Sec',
        isSubscribed: true,
    },
];

export default function UpcomingEvents() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="#1A1D1F" />
                </TouchableOpacity>
                <Text style={styles.title}>Upcoming Events</Text>
            </View>
            <ScrollView style={styles.content}>
                <View style={styles.eventsList}>
                    {upcomingEvents.map((event) => (
                        <EventCard key={event.id} {...event} />
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
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
    backButton: {
        marginRight: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1D1F',
    },
    content: {
        flex: 1,
    },
    eventsList: {
        padding: 16,
        gap: 16,
    },
}); 