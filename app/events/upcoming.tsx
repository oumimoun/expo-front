import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import EventCard from '../components/EventCard';
import { useTheme } from '../theme/ThemeContext';

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
    const { theme } = useTheme();
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

    const styles = makeStyles(theme);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
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
        flex: 1,
        backgroundColor: theme.background,
    },
    eventsList: {
        padding: 16,
        gap: 16,
    },
}); 