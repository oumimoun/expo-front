import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import EventCard from '../components/EventCard';
import FeedbackModal from '../components/FeedbackModal';

const attendedEvents = [
    {
        id: '1',
        title: 'Introduction to Web3',
        date: '2024-03-15T14:00:00',
        location: 'Room A1',
        category: 'Web',
        isSubscribed: true,
        buttonType: 'feedback' as const,
    },
    {
        id: '2',
        title: 'AI in Healthcare',
        date: '2024-03-20T15:30:00',
        location: 'Room B2',
        category: 'AI',
        isSubscribed: true,
        buttonType: 'feedback' as const,
    },
    {
        id: '3',
        title: 'Cybersecurity Basics',
        date: '2024-03-25T13:00:00',
        location: 'Room C3',
        category: 'Sec',
        isSubscribed: true,
        buttonType: 'feedback' as const,
    },
];

export default function AttendedEvents() {
    const router = useRouter();
    const [selectedEvent, setSelectedEvent] = useState<typeof attendedEvents[0] | null>(null);
    const [isFeedbackModalVisible, setIsFeedbackModalVisible] = useState(false);

    const handleBack = () => {
        router.back();
    };

    const handleFeedback = (event: typeof attendedEvents[0]) => {
        setSelectedEvent(event);
        setIsFeedbackModalVisible(true);
    };

    const handleFeedbackClose = () => {
        setIsFeedbackModalVisible(false);
        setSelectedEvent(null);
    };

    const handleFeedbackSubmit = async (rating: number, comment: string) => {
        if (!selectedEvent) return;

        // Here you would typically make an API call to submit the feedback
        console.log('Submitting feedback:', {
            eventId: selectedEvent.id,
            rating,
            comment,
        });

        handleFeedbackClose();
        // Show success message or handle the response accordingly
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
                <Text style={styles.title}>Events Attended</Text>
            </View>
            <ScrollView style={styles.content}>
                <View style={styles.eventsList}>
                    {attendedEvents.map((event) => (
                        <EventCard
                            key={event.id}
                            {...event}
                            onAction={() => handleFeedback(event)}
                        />
                    ))}
                </View>
            </ScrollView>

            <FeedbackModal
                isVisible={isFeedbackModalVisible}
                onClose={handleFeedbackClose}
                onSubmit={handleFeedbackSubmit}
                eventTitle={selectedEvent?.title || ''}
            />
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