import Nav from '@/components/Nav';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { isFuture, parseISO } from 'date-fns';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ImageBackground,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { Text } from 'react-native-paper';
import { useTheme } from '../../contexts/ThemeContext';
import { useUser } from '../../contexts/UserContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;

interface Event {
    id: string;
    title: string;
    description: string;
    categories: string[];
    club: string;
    date: string;
    time: string;
    location: string;
    maxAttend: number;
    attendNumber: number;
    private: boolean;
    invited: string[];
    finished: boolean;
    rating: number;
    participants_count: number;
    is_participant: boolean;
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
    success: '#28a745',
    green: '#1b8456',
    lightGreen: '#e0f0e9',
    yellow: '#ffd700',
    white: '#ffffff'
};

const EventDetailsScreen = () => {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { isDarkMode, colors } = useTheme();
    const { user } = useUser();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [isParticipant, setIsParticipant] = useState(false);

    useEffect(() => {
        fetchEventDetails();
    }, [id]);

    const isUpcomingEvent = (event: Event) => {
        const eventDate = parseISO(`${event.date}T${event.time}`);
        return isFuture(eventDate);
    };

    const fetchEventDetails = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `https://europe-west1-playstore-e4a65.cloudfunctions.net/api/api/events/${id}`,
                { withCredentials: true }
            );

            if (response.data.success) {
                const eventData = response.data.event;
                setEvent({
                    ...eventData,
                    // Ensure all required fields are present with proper types
                    id: eventData.id || id,
                    title: eventData.title || '',
                    description: eventData.description || '',
                    categories: eventData.categories || [],
                    club: eventData.club || '',
                    date: eventData.date || '',
                    time: eventData.time || '',
                    location: eventData.location || '',
                    maxAttend: eventData.maxAttend || 0,
                    attendNumber: eventData.attendNumber || 0,
                    private: eventData.private || false,
                    invited: eventData.invited || [],
                    finished: eventData.finished || false,
                    rating: eventData.rating || 0,
                    participants_count: eventData.participants_count || 0,
                    is_participant: eventData.is_participant || false
                });
                setIsParticipant(eventData.is_participant || false);
            } else {
                console.error('Failed to fetch event details:', response.data.message);
            }
        } catch (error) {
            console.error('Error fetching event details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegistration = async (eventId: string) => {
        if (!event) return;

        try {
            const endpoint = isParticipant ? 'unregister' : 'register';
            const response = await axios.post(
                `https://europe-west1-playstore-e4a65.cloudfunctions.net/api/api/events/${eventId}/${endpoint}`,
                {},
                { withCredentials: true }
            );

            if (response.data.success) {
                Alert.alert(
                    "Success!",
                    isParticipant
                        ? "You have been unregistered from this event."
                        : "You have successfully registered for this event.",
                    [{ text: "OK", style: "default" }]
                );
                await fetchEventDetails();
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.error('Error updating registration:', error);
            Alert.alert(
                "Action Failed",
                isParticipant
                    ? "Unable to unregister from the event. Please try again."
                    : "Unable to register for the event. Please try again.",
                [{ text: "OK", style: "default" }]
            );
        }
    };

    const handleUnregister = (eventId: string) => {
        Alert.alert(
            "Confirm Unsubscribe",
            "Are you sure you want to unsubscribe from this event?",
            [
                { text: "No, Keep me registered", style: "cancel" },
                {
                    text: "Yes, Unsubscribe",
                    style: "destructive",
                    onPress: () => handleRegistration(eventId)
                }
            ]
        );
    };

    const renderRatingStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars.push(
                    <Ionicons key={i} name="star" size={24} color={COLORS.yellow} />
                );
            } else if (i === fullStars + 1 && hasHalfStar) {
                stars.push(
                    <Ionicons key={i} name="star-half" size={24} color={COLORS.yellow} />
                );
            } else {
                stars.push(
                    <Ionicons key={i} name="star-outline" size={24} color={COLORS.yellow} />
                );
            }
        }
        return stars;
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

    const isEventFull = event.participants_count >= event.maxAttend;

    return (
        <View style={[styles.mainWrapper, { backgroundColor: colors.background }]}>
            <StatusBar
                barStyle={isDarkMode ? "light-content" : "dark-content"}
                backgroundColor="transparent"
                translucent={true}
            />
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Hero Section */}
                <ImageBackground
                    source={require('../../assets/images/lamrabti.jpg')}
                    style={styles.heroImage}
                >
                    <View style={[styles.overlay, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)' }]} />
                    <View style={styles.heroContent}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}
                        >
                            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                        </TouchableOpacity>

                        <View style={styles.eventHeaderContainer}>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.categoriesScroll}
                                contentContainerStyle={styles.categoriesContainer}
                            >
                                {event?.categories.map((category, index) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.categoryBadge,
                                            index > 0 && { marginLeft: 8 }
                                        ]}
                                    >
                                        <Text style={styles.categoryText}>{category}</Text>
                                    </View>
                                ))}
                                {event?.private && (
                                    <View style={[styles.categoryBadge, styles.privateBadge, { marginLeft: 8 }]}>
                                        <Ionicons name="lock-closed" size={16} color={COLORS.white} />
                                        <Text style={styles.categoryText}>Private</Text>
                                    </View>
                                )}
                            </ScrollView>
                        </View>

                        <Text style={styles.heroTitle}>{event?.title}</Text>
                    </View>
                </ImageBackground>

                <View style={styles.content}>
                    {/* Quick Info Cards */}
                    <View style={styles.quickInfoContainer}>
                        <View style={[styles.quickInfoCard, { backgroundColor: colors.surface }]}>
                            <Ionicons name="calendar-outline" size={24} color={COLORS.green} />
                            <Text style={[styles.quickInfoTitle, { color: colors.text }]}>{event.date}</Text>
                            <Text style={[styles.quickInfoSubtitle, { color: colors.greyText }]}>Date</Text>
                        </View>

                        <View style={[styles.quickInfoCard, { backgroundColor: colors.surface }]}>
                            <Ionicons name="time-outline" size={24} color={COLORS.green} />
                            <Text style={[styles.quickInfoTitle, { color: colors.text }]}>{event.time}</Text>
                            <Text style={[styles.quickInfoSubtitle, { color: colors.greyText }]}>Time</Text>
                        </View>

                        <View style={[styles.quickInfoCard, { backgroundColor: colors.surface }]}>
                            <Ionicons name="people-outline" size={24} color={COLORS.green} />
                            <Text style={[styles.quickInfoTitle, { color: colors.text }]}>
                                {event.participants_count}/{event.maxAttend}
                            </Text>
                            <Text style={[styles.quickInfoSubtitle, { color: colors.greyText }]}>Attendees</Text>
                        </View>
                    </View>

                    {/* Location Section */}
                    <View style={[styles.section, { backgroundColor: colors.surface }]}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="location-outline" size={24} color={COLORS.green} />
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Location</Text>
                        </View>
                        <Text style={[styles.locationText, { color: colors.text }]}>{event.location}</Text>
                    </View>

                    {/* Description Section */}
                    <View style={[styles.section, { backgroundColor: colors.surface }]}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="information-circle-outline" size={24} color={COLORS.green} />
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>About Event</Text>
                        </View>
                        <Text style={[styles.description, { color: colors.greyText }]}>{event.description}</Text>
                    </View>

                    {/* Organizer Section */}
                    <View style={[styles.section, { backgroundColor: colors.surface }]}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="people-circle-outline" size={24} color={COLORS.green} />
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Organized By</Text>
                        </View>
                        <View style={styles.organizerInfo}>
                            <View>
                                <Text style={[styles.clubName, { color: colors.greyText }]}>{event.club}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Event Status Badge */}
                    <View style={[styles.section, { backgroundColor: colors.surface }]}>
                        <View style={styles.eventStatusContainer}>
                            <Ionicons
                                name={isUpcomingEvent(event!) ? "time" : "checkmark-circle"}
                                size={24}
                                color={isUpcomingEvent(event!) ? COLORS.primary : COLORS.success}
                            />
                            <Text style={[styles.eventStatusText, {
                                color: isUpcomingEvent(event!) ? COLORS.primary : COLORS.success
                            }]}>
                                {isUpcomingEvent(event!) ? 'Upcoming Event' : 'Past Event'}
                            </Text>
                        </View>
                    </View>

                    {event && (
                        <>
                            {/* Show Registration Button for Upcoming Events */}
                            {isUpcomingEvent(event) && user && (
                                <TouchableOpacity
                                    style={[
                                        styles.registrationButton,
                                        isParticipant ? styles.unsubscribeButton : styles.subscribeButton,
                                        isEventFull && !isParticipant && styles.disabledButton
                                    ]}
                                    onPress={() => isParticipant
                                        ? handleUnregister(event.id)
                                        : handleRegistration(event.id)
                                    }
                                    disabled={isEventFull && !isParticipant}
                                >
                                    <Text style={styles.registrationButtonText}>
                                        {isParticipant
                                            ? 'Unsubscribe from Event'
                                            : (isEventFull ? 'Event is Full' : 'Subscribe to Event')
                                        }
                                    </Text>
                                    <Ionicons
                                        name={isParticipant ? "close-circle" : "checkmark-circle"}
                                        size={24}
                                        color={COLORS.white}
                                    />
                                </TouchableOpacity>
                            )}

                            {/* Show Rating for Past Events */}
                            {!isUpcomingEvent(event) && (
                                <View style={[styles.section, { backgroundColor: colors.surface }]}>
                                    <View style={styles.sectionHeader}>
                                        <Ionicons name="star" size={24} color={COLORS.yellow} />
                                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Event Rating</Text>
                                    </View>
                                    <View style={styles.ratingContainer}>
                                        <View style={styles.starsContainer}>
                                            {renderRatingStars(event.rating)}
                                        </View>
                                        <Text style={[styles.ratingText, { color: colors.text }]}>
                                            {event.rating.toFixed(1)}
                                        </Text>
                                        <Text style={[styles.ratingSubtext, { color: colors.greyText }]}>
                                            Average Rating
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </>
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
    },
    heroImage: {
        width: '100%',
        height: 300,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
    },
    heroContent: {
        flex: 1,
        padding: 20,
        paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight! + 20,
        justifyContent: 'space-between',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    eventHeaderContainer: {
        marginTop: 16,
    },
    categoriesScroll: {
        flexGrow: 0,
    },
    categoriesContainer: {
        paddingRight: 16,
    },
    categoryBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    privateBadge: {
        backgroundColor: 'rgba(220,53,69,0.3)',
    },
    categoryText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: '600',
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.white,
        marginTop: 'auto',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    content: {
        flex: 1,
        padding: 20,
        paddingBottom: 100,
    },
    quickInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: -40,
        marginBottom: 20,
        gap: 12,
    },
    quickInfoCard: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    quickInfoTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 8,
        marginBottom: 4,
    },
    quickInfoSubtitle: {
        fontSize: 12,
        color: COLORS.greyText,
    },
    section: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    locationInfo: {
        gap: 4,
    },
    locationText: {
        fontSize: 16,
        fontWeight: '500',
        marginTop: 4,
    },
    cityText: {
        fontSize: 14,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
    },
    organizerInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    organizerName: {
        fontSize: 16,
        fontWeight: '600',
    },
    clubName: {
        fontSize: 14,
        marginTop: 4,
    },
    linkButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    linkText: {
        fontSize: 14,
        fontWeight: '600',
    },
    registrationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        marginTop: 20,
        marginBottom: 20,
        gap: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    subscribeButton: {
        backgroundColor: COLORS.success,
    },
    unsubscribeButton: {
        backgroundColor: COLORS.red,
    },
    disabledButton: {
        opacity: 0.5,
    },
    registrationButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    navContainer: {
        width: '100%',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopWidth: 1,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    ratingContainer: {
        alignItems: 'center',
        padding: 16,
    },
    starsContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    ratingText: {
        fontSize: 36,
        fontWeight: 'bold',
        marginVertical: 8,
    },
    ratingSubtext: {
        fontSize: 14,
        marginTop: 4,
        color: COLORS.greyText,
    },
    eventStatusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 8,
    },
    eventStatusText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export default EventDetailsScreen;