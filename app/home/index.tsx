import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import EventCard from '../components/EventCard';
import Navbar from '../components/Navbar';
import PreferencesHeader from '../components/PreferencesHeader';

// Example events data
const initialEvents = [
    {
        id: '1',
        title: 'Introduction to Web Development Workshop',
        date: '2024-03-25T14:00:00',
        location: 'Room 42 - Ground Floor',
        category: 'Web',
        isSubscribed: false,
        buttonType: 'subscribe' as const
    },
    {
        id: '2',
        title: 'AI Ethics and Future Technologies Discussion Panel',
        date: '2024-03-27T16:30:00',
        location: 'Amphitheater - 2nd Floor',
        category: 'AI',
        isSubscribed: false,
        buttonType: 'subscribe' as const
    },
    {
        id: '3',
        title: 'Cybersecurity Best Practices Seminar',
        date: '2024-03-29T10:00:00',
        location: 'Conference Room - 3rd Floor',
        category: 'Sec',
        isSubscribed: false,
        buttonType: 'subscribe' as const
    },
];

export default function Home() {
    const [events, setEvents] = useState(initialEvents);

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
            <PreferencesHeader />
            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {events.map((event) => (
                    <EventCard
                        key={event.id}
                        {...event}
                        onAction={() => handleSubscribe(event.id)}
                    />
                ))}
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
        backgroundColor: '#F5F7FA',
    },
    scrollContent: {
        paddingVertical: 16,
    },
});