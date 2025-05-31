import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import EventCard from '../components/EventCard';

const initialEvents = [
    {
        id: '1',
        title: 'Advanced React Patterns',
        date: '2024-04-15T14:00:00',
        location: 'Room A1',
        category: 'Web',
        isSubscribed: false,
        buttonType: 'subscribe' as const,
    },
    {
        id: '2',
        title: 'Machine Learning Workshop',
        date: '2024-04-16T15:30:00',
        location: 'Room B2',
        category: 'AI',
        isSubscribed: false,
        buttonType: 'subscribe' as const,
    },
    {
        id: '3',
        title: 'Ethical Hacking',
        date: '2024-04-17T13:00:00',
        location: 'Room C3',
        category: 'Sec',
        isSubscribed: false,
        buttonType: 'subscribe' as const,
    },
];

export default function UpcomingEvents() {
    const router = useRouter();
    const pathname = usePathname();
    const isFromProfile = pathname.includes('/events/upcoming');
    const [events, setEvents] = useState(initialEvents.map(event => ({
        ...event,
        isSubscribed: isFromProfile // Set isSubscribed to true if accessed from profile
    })));

    const handleSubscribe = (eventId: string) => {
        setEvents(prev =>
            prev.map(event =>
                event.id === eventId
                    ? { ...event, isSubscribed: !event.isSubscribed }
                    : event
            )
        );
    };

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
                    {events.map((event) => (
                        <EventCard
                            key={event.id}
                            {...event}
                            onAction={() => handleSubscribe(event.id)}
                        />
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