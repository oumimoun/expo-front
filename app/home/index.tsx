import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import EventCard from '../components/EventCard';
// import Navbar from '../components/Navbar';
import PreferencesHeader from '../components/PreferencesHeader';
import { useTheme } from '../theme/ThemeContext';

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
    const { theme } = useTheme();

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
            {/* <Navbar /> */}
        </View>
    );
}

const makeStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    content: {
        flex: 1,
        backgroundColor: theme.background,
    },
    scrollContent: {
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
});