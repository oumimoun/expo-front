import Nav from '@/components/Nav';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
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

const { width, height } = Dimensions.get('window');

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
    white: '#ffffff',
    black: '#000000',
    darkBackground: '#1a1a1a',
    darkSurface: '#2d2d2d',
    darkBorder: '#404040',
};

const getCategoryColor = (category: string): string => {
    const colors = {
        'Tech': '#3a7bd5',
        'Design': '#e91e63',
        'Networking': '#f5a623',
        'Social': '#8bc34a',
        'Workshop': '#9c27b0',
        'Conference': '#2196f3',
        'Hackathon': '#ff5722',
        'Meetup': '#4caf50',
        'Other': '#607d8b'
    };
    return colors[category as keyof typeof colors] || COLORS.green;
};

const getCategoryIcon = (category: string): keyof typeof Ionicons.glyphMap => {
    const icons = {
        'Tech': 'code-slash-outline',
        'Design': 'brush-outline',
        'Networking': 'people-outline',
        'Social': 'chatbubbles-outline',
        'Workshop': 'hammer-outline',
        'Conference': 'mic-outline',
        'Hackathon': 'trophy-outline',
        'Meetup': 'people-circle-outline',
        'Other': 'apps-outline'
    };
    return (icons[category as keyof typeof icons] || 'apps-outline') as keyof typeof Ionicons.glyphMap;
};

const EventDetailsScreen = () => {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { isDarkMode, colors } = useTheme();
    const { user } = useUser();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [isParticipant, setIsParticipant] = useState(false);
    const [isUpcoming, setIsUpcoming] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const checkIsUpcoming = (eventData: Event) => {
        try {
            const [year, month, day] = eventData.date.split('-').map(Number);
            const [timeStr, period] = eventData.time.split(' ');
            let [hours, minutes] = timeStr.split(':').map(Number);

            if (period === 'PM' && hours !== 12) {
                hours += 12;
            } else if (period === 'AM' && hours === 12) {
                hours = 0;
            }

            const eventDateTime = new Date(year, month - 1, day, hours, minutes);
            const now = new Date();

            return eventDateTime > now;
        } catch (error) {
            console.error('Error parsing date:', error);
            return false;
        }
    };

    const handleRegistration = async () => {
        if (!event) return;

        try {
            const response = await axios.post(
                `https://europe-west1-playstore-e4a65.cloudfunctions.net/api/api/events/${event.id}/register`,
                {},
                { withCredentials: true }
            );

            if (response.data.success) {
                const newParticipantStatus = !isParticipant;
                setIsParticipant(newParticipantStatus);

                const updatedEvent = {
                    ...event,
                    is_participant: newParticipantStatus,
                    participants_count: newParticipantStatus
                        ? event.participants_count + 1
                        : event.participants_count - 1
                };
                setEvent(updatedEvent);
            }
        } catch (error: any) {
            console.error('Error updating registration:', error);
            setError(error.response?.data?.error || (isParticipant
                ? "Unable to unsubscribe from the event. Please try again."
                : "Unable to subscribe to the event. Please try again."));
        }
    };

    useEffect(() => {
        fetchEventDetails();
    }, [id]);

    useEffect(() => {
        if (event) {
            setIsParticipant(event.is_participant);
            setIsUpcoming(checkIsUpcoming(event));
        }
    }, [event]);

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
            }
        } catch (error) {
            console.error('Error fetching event details:', error);
        } finally {
            setLoading(false);
        }
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
            <View style={[styles.mainWrapper, styles.centerContent, { backgroundColor: isDarkMode ? COLORS.darkBackground : COLORS.background }]}>
                <ActivityIndicator size="large" color={COLORS.green} />
            </View>
        );
    }

    if (!event) {
        return (
            <View style={[styles.mainWrapper, styles.centerContent, { backgroundColor: isDarkMode ? COLORS.darkBackground : COLORS.background }]}>
                <Text style={{ color: isDarkMode ? COLORS.white : COLORS.text }}>Event not found</Text>
            </View>
        );
    }

    return (
        <View style={[styles.mainWrapper, { backgroundColor: isDarkMode ? COLORS.darkBackground : COLORS.background }]}>
            <StatusBar
                barStyle={isDarkMode ? "light-content" : "dark-content"}
                backgroundColor="transparent"
                translucent={true}
            />

            <View style={styles.header}>
                <ImageBackground
                    source={require('../../assets/images/lamrabti.jpg')}
                    style={styles.headerImage}
                >
                    <View style={[styles.overlay, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)' }]} />

                    <View style={styles.headerContent}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}
                        >
                            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                        </TouchableOpacity>

                        <Text style={styles.headerTitle} numberOfLines={1}>
                            {event.title}
                        </Text>
                    </View>

                    <View style={styles.headerMeta}>
                        <Text style={styles.eventTitle}>{event.title}</Text>
                        <View style={styles.metaRow}>
                            <View style={styles.metaItem}>
                                <Ionicons name="calendar-outline" size={16} color={COLORS.white} />
                                <Text style={styles.metaText}>{event.date}</Text>
                            </View>
                            <View style={styles.metaItem}>
                                <Ionicons name="time-outline" size={16} color={COLORS.white} />
                                <Text style={styles.metaText}>{event.time}</Text>
                            </View>
                        </View>
                    </View>
                </ImageBackground>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.scrollContent,
                    { backgroundColor: isDarkMode ? COLORS.darkBackground : COLORS.background }
                ]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.contentWrapper}>
                    {/* Quick Info Cards */}
                    <View style={styles.quickInfoContainer}>
                        <View style={[styles.quickInfoCard, {
                            backgroundColor: isDarkMode ? COLORS.darkSurface : COLORS.white,
                            borderColor: isDarkMode ? COLORS.darkBorder : COLORS.border
                        }]}>
                            <Ionicons name="people-outline" size={28} color={COLORS.green} />
                            <Text style={[styles.quickInfoValue, { color: isDarkMode ? COLORS.white : COLORS.text }]}>
                                {event.participants_count}
                            </Text>
                            <Text style={[styles.quickInfoLabel, { color: isDarkMode ? COLORS.greyText : COLORS.text }]}>
                                Participants
                            </Text>
                        </View>

                        <View style={[styles.quickInfoCard, {
                            backgroundColor: isDarkMode ? COLORS.darkSurface : COLORS.white,
                            borderColor: isDarkMode ? COLORS.darkBorder : COLORS.border
                        }]}>
                            <Ionicons name="location-outline" size={28} color={COLORS.green} />
                            <Text style={[styles.quickInfoValue, { color: isDarkMode ? COLORS.white : COLORS.text }]} numberOfLines={1}>
                                {event.location}
                            </Text>
                            <Text style={[styles.quickInfoLabel, { color: isDarkMode ? COLORS.greyText : COLORS.text }]}>
                                Location
                            </Text>
                        </View>

                        <View style={[styles.quickInfoCard, {
                            backgroundColor: isDarkMode ? COLORS.darkSurface : COLORS.white,
                            borderColor: isDarkMode ? COLORS.darkBorder : COLORS.border
                        }]}>
                            <Ionicons name="business-outline" size={28} color={COLORS.green} />
                            <Text style={[styles.quickInfoValue, { color: isDarkMode ? COLORS.white : COLORS.text }]} numberOfLines={1}>
                                {event.club}
                            </Text>
                            <Text style={[styles.quickInfoLabel, { color: isDarkMode ? COLORS.greyText : COLORS.text }]}>
                                Organizer
                            </Text>
                        </View>
                    </View>

                    {/* Categories */}
                    <View style={[styles.section, {
                        backgroundColor: isDarkMode ? COLORS.darkSurface : COLORS.white,
                        borderColor: isDarkMode ? COLORS.darkBorder : COLORS.border
                    }]}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="pricetags-outline" size={24} color={COLORS.green} />
                            <Text style={[styles.sectionTitle, { color: isDarkMode ? COLORS.white : COLORS.text }]}>
                                Categories
                            </Text>
                        </View>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.categoriesScroll}
                            contentContainerStyle={styles.categoriesContent}
                        >
                            {event.categories.map((category, index) => (
                                <View
                                    key={index}
                                    style={[styles.categoryChip, { backgroundColor: `${getCategoryColor(category)}15` }]}
                                >
                                    <Ionicons
                                        name={getCategoryIcon(category)}
                                        size={18}
                                        color={getCategoryColor(category)}
                                    />
                                    <Text style={[styles.categoryText, { color: getCategoryColor(category) }]}>
                                        {category}
                                    </Text>
                                </View>
                            ))}
                            {event.private && (
                                <View style={[styles.categoryChip, { backgroundColor: 'rgba(220,53,69,0.15)' }]}>
                                    <Ionicons name="lock-closed" size={18} color={COLORS.red} />
                                    <Text style={[styles.categoryText, { color: COLORS.red }]}>Private</Text>
                                </View>
                            )}
                        </ScrollView>
                    </View>

                    {/* Description */}
                    <View style={[styles.section, {
                        backgroundColor: isDarkMode ? COLORS.darkSurface : COLORS.white,
                        borderColor: isDarkMode ? COLORS.darkBorder : COLORS.border
                    }]}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="information-circle-outline" size={24} color={COLORS.green} />
                            <Text style={[styles.sectionTitle, { color: isDarkMode ? COLORS.white : COLORS.text }]}>
                                About Event
                            </Text>
                        </View>
                        <Text style={[styles.description, { color: isDarkMode ? COLORS.greyText : COLORS.text }]}>
                            {event.description}
                        </Text>
                    </View>

                    {/* Event Status */}
                    <View style={[styles.section, {
                        backgroundColor: isDarkMode ? COLORS.darkSurface : COLORS.white,
                        borderColor: isDarkMode ? COLORS.darkBorder : COLORS.border
                    }]}>
                        <View style={styles.eventStatusContainer}>
                            <Ionicons
                                name={isUpcoming ? "time" : "checkmark-circle"}
                                size={24}
                                color={isUpcoming ? COLORS.primary : COLORS.success}
                            />
                            <Text style={[styles.eventStatusText, {
                                color: isUpcoming ? COLORS.primary : COLORS.success
                            }]}>
                                {isUpcoming ? 'Upcoming Event' : 'Past Event'}
                            </Text>
                        </View>
                    </View>

                    {/* Registration or Rating */}
                    {isUpcoming ? (
                        user && (
                            <TouchableOpacity
                                style={[styles.registrationButton, {
                                    backgroundColor: isParticipant ? COLORS.red : COLORS.green,
                                }]}
                                onPress={handleRegistration}
                            >
                                <Ionicons
                                    name={isParticipant ? "close-circle-outline" : "add-circle-outline"}
                                    size={24}
                                    color={COLORS.white}
                                />
                                <Text style={styles.registrationButtonText}>
                                    {isParticipant ? 'Unsubscribe' : 'Subscribe'}
                                </Text>
                            </TouchableOpacity>
                        )
                    ) : (
                        <View style={[styles.section, {
                            backgroundColor: isDarkMode ? COLORS.darkSurface : COLORS.white,
                            borderColor: isDarkMode ? COLORS.darkBorder : COLORS.border
                        }]}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="star" size={24} color={COLORS.yellow} />
                                <Text style={[styles.sectionTitle, { color: isDarkMode ? COLORS.white : COLORS.text }]}>
                                    Event Rating
                                </Text>
                            </View>
                            <View style={styles.ratingContainer}>
                                <View style={styles.starsContainer}>
                                    {renderRatingStars(event.rating)}
                                </View>
                                <Text style={[styles.ratingValue, { color: isDarkMode ? COLORS.white : COLORS.text }]}>
                                    {event.rating.toFixed(1)}
                                </Text>
                                <Text style={[styles.ratingLabel, { color: isDarkMode ? COLORS.greyText : COLORS.text }]}>
                                    Average Rating
                                </Text>
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>

            <View style={[styles.navContainer, {
                backgroundColor: isDarkMode ? COLORS.darkSurface : COLORS.white,
                borderTopColor: isDarkMode ? COLORS.darkBorder : COLORS.border
            }]}>
                <Nav />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    mainWrapper: {
        flex: 1,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        height: 320,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1,
    },
    headerImage: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight! + 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.white,
        marginLeft: 16,
        flex: 1,
    },
    headerMeta: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
    },
    eventTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 16,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    metaRow: {
        flexDirection: 'row',
        gap: 12,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    metaText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: '500',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 320,
    },
    contentWrapper: {
        flex: 1,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 20,
        paddingBottom: 100,
        minHeight: height - 320,
    },
    quickInfoContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 20,
    },
    quickInfoCard: {
        flex: 1,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
    },
    quickInfoValue: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 8,
    },
    quickInfoLabel: {
        fontSize: 14,
        marginTop: 4,
    },
    section: {
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 16,
        padding: 20,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    categoriesScroll: {
        marginTop: 8,
    },
    categoriesContent: {
        gap: 12,
        paddingRight: 8,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 25,
        gap: 8,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '600',
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
    },
    eventStatusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    eventStatusText: {
        fontSize: 16,
        fontWeight: '600',
    },
    registrationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 16,
        borderRadius: 30,
        gap: 8,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    registrationButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
    },
    ratingContainer: {
        alignItems: 'center',
        padding: 16,
    },
    starsContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    ratingValue: {
        fontSize: 36,
        fontWeight: 'bold',
        marginVertical: 8,
    },
    ratingLabel: {
        fontSize: 14,
    },
    navContainer: {
        width: '100%',
        borderTopWidth: 1,
    },
});

export default EventDetailsScreen; 