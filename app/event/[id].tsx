import Nav from '@/components/Nav';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useTheme } from '../../contexts/ThemeContext';
import { useUser } from '../../contexts/UserContext';

interface Event {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    category: string;
    description: string;
    organizer: string;
    maxAttendees: number;
    club: string;
    isPrivate: boolean;
    participants: Array<{
        login: string;
        rating?: number;
    }>;
    link?: string;
}

const COLORS = {
    primary: '#3a7bd5',
    secondary: '#c471f5',
    background: '#f8f9fa',
    card: '#ffffff',
    greyText: '#666666',
    red: '#dc3545',
    text: '#2d3436',
    border: '#e1e1e1',
    success: '#28a745'
};

const EventDetailsScreen = () => {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { colors } = useTheme();
    const { user } = useUser();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [isParticipant, setIsParticipant] = useState(false);

    useEffect(() => {
        fetchEventDetails();
    }, [id]);

    const fetchEventDetails = async () => {
        try {
            // TODO: Replace with actual API call
            // Mock data for now
            const mockEvent: Event = {
                id: id as string,
                title: "Sample Event",
                date: "2024-03-25",
                time: "14:00",
                location: "Main Hall",
                category: "Workshop",
                description: "This is a detailed description of the event...",
                organizer: "John Doe",
                maxAttendees: 50,
                club: "Tech Club",
                isPrivate: false,
                participants: [
                    { login: "user1" },
                    { login: "user2" }
                ],
                link: "https://example.com/event"
            };
            
            setEvent(mockEvent);
            setIsParticipant(mockEvent.participants.some(p => p.login === user?.login));
        } catch (error) {
            console.error('Error fetching event details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleParticipate = async () => {
        if (!event || !user) return;

        try {
            // TODO: Implement participation logic
            const updatedParticipants = [...event.participants, { login: user.login }];
            setEvent({ ...event, participants: updatedParticipants });
            setIsParticipant(true);
        } catch (error) {
            console.error('Error updating participation:', error);
        }
    };

    const handleCancelParticipation = async () => {
        if (!event || !user) return;

        try {
            // TODO: Implement cancellation logic
            const updatedParticipants = event.participants.filter(p => p.login !== user.login);
            setEvent({ ...event, participants: updatedParticipants });
            setIsParticipant(false);
        } catch (error) {
            console.error('Error canceling participation:', error);
        }
    };

    if (loading) {
        return (
            <View style={[styles.mainWrapper, styles.centerContent]}>
                <ActivityIndicator size="large" color={colors.green} />
            </View>
        );
    }

    if (!event) {
        return (
            <View style={[styles.mainWrapper, styles.centerContent]}>
                <Text>Event not found</Text>
            </View>
        );
    }

    const isEventFull = event.participants.length >= event.maxAttendees;

    return (
        <View style={styles.mainWrapper}>
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.title}>{event.title}</Text>
                </View>

                <View style={styles.content}>
                    <View style={styles.infoSection}>
                        <View style={styles.infoRow}>
                            <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
                            <Text style={styles.infoText}>{event.date}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="time-outline" size={20} color={COLORS.primary} />
                            <Text style={styles.infoText}>{event.time}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="location-outline" size={20} color={COLORS.primary} />
                            <Text style={styles.infoText}>{event.location}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="people-outline" size={20} color={COLORS.primary} />
                            <Text style={styles.infoText}>
                                {event.participants.length} / {event.maxAttendees} participants
                            </Text>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.description}>{event.description}</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Details</Text>
                        <View style={styles.detailsGrid}>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Category</Text>
                                <Text style={styles.detailValue}>{event.category}</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Organizer</Text>
                                <Text style={styles.detailValue}>{event.organizer}</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Club</Text>
                                <Text style={styles.detailValue}>{event.club}</Text>
                            </View>
                            {event.link && (
                                <TouchableOpacity
                                    style={[styles.detailItem, styles.linkContainer]}
                                    onPress={() => {/* TODO: Implement link handling */}}
                                >
                                    <Text style={styles.detailLabel}>Event Link</Text>
                                    <Text style={[styles.detailValue, styles.link]}>{event.link}</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {user && (
                        <View style={styles.actionContainer}>
                            {isParticipant ? (
                                <TouchableOpacity
                                    style={[styles.button, styles.cancelButton]}
                                    onPress={handleCancelParticipation}
                                >
                                    <Text style={styles.buttonText}>Cancel Participation</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    style={[
                                        styles.button,
                                        styles.participateButton,
                                        isEventFull && styles.disabledButton
                                    ]}
                                    onPress={handleParticipate}
                                    disabled={isEventFull}
                                >
                                    <Text style={styles.buttonText}>
                                        {isEventFull ? 'Event Full' : 'Participate'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>
            <View style={[styles.navContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                <Nav />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    mainWrapper: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingBottom: 60, // Add padding to account for nav bar
    },
    navContainer: {
        width: '100%',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopWidth: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: COLORS.card,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        marginRight: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        flex: 1,
    },
    content: {
        padding: 16,
    },
    infoSection: {
        backgroundColor: COLORS.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoText: {
        marginLeft: 8,
        fontSize: 16,
    },
    section: {
        backgroundColor: COLORS.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
    },
    detailsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -8,
    },
    detailItem: {
        width: '50%',
        padding: 8,
    },
    detailLabel: {
        fontSize: 14,
        color: COLORS.greyText,
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 16,
    },
    linkContainer: {
        width: '100%',
    },
    link: {
        color: COLORS.primary,
        textDecorationLine: 'underline',
    },
    actionContainer: {
        marginTop: 16,
    },
    button: {
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    participateButton: {
        backgroundColor: COLORS.success,
    },
    cancelButton: {
        backgroundColor: COLORS.red,
    },
    disabledButton: {
        opacity: 0.5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default EventDetailsScreen;