import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import EventCard from '../components/EventCard';
import Navbar from '../components/Navbar';
import PreferencesHeader from '../components/PreferencesHeader';

// Example events data
const exampleEvents = [
    {
        id: '1',
        title: 'Introduction to Web Development Workshop',
        date: 'March 25, 2024 • 14:00',
        location: 'Room 42 - Ground Floor',
        category: 'Web'
    },
    {
        id: '2',
        title: 'AI Ethics and Future Technologies Discussion Panel',
        date: 'March 27, 2024 • 16:30',
        location: 'Amphitheater - 2nd Floor',
        category: 'AI'
    },
    {
        id: '3',
        title: 'Cybersecurity Best Practices Seminar',
        date: 'March 29, 2024 • 10:00',
        location: 'Conference Room - 3rd Floor',
        category: 'Sec'
    },
];

export default function Home() {
    const handleEventPress = (eventId: string) => {
        console.log('Event pressed:', eventId);
        // Handle navigation to event details
    };

    return (
        <View style={styles.container}>
            <PreferencesHeader />
            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {exampleEvents.map((event) => (
                    <EventCard
                        key={event.id}
                        title={event.title}
                        date={event.date}
                        location={event.location}
                        category={event.category}
                        onPress={() => handleEventPress(event.id)}
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