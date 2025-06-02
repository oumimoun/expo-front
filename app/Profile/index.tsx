import Nav from '@/components/Nav';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ImageStyle,
    Modal,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    TextInput,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import { Surface, Text } from 'react-native-paper';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { useUser } from '../../contexts/UserContext';

// Base colors will be overridden by theme colors
const COLORS = {
    background: '#FFFFFF',
    green: '#1b8456',
    lightOrange: '#f5cbab',
    black: '#000000',
    greyText: '#555555',
    lightGreen: '#e0f0e9',
    lightGrey: '#f9f9f9',
    white: '#FFFFFF',
    red: '#ff4444',
};

interface User {
    email: string;
    login: string;
    avatar: string;
    fname: string;
    lname: string;
    role: string;
    admin: boolean;
    register: number;
    attendance: number;
}

interface Event {
    id: string;
    title: string;
    description: string;
    categories: string[];
    category: string;
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
    stars: number;
    comment: string;
}

interface Interest {
    id: string;
    name: string;
    color: string;
    icon: keyof typeof Ionicons.glyphMap;
}

const INTEREST_CATEGORIES = [
    { id: '1', name: 'Web Dev', color: '#3a7bd5', icon: 'code-slash-outline' },
    { id: '2', name: 'Mobile Dev', color: '#4CAF50', icon: 'phone-portrait-outline' },
    { id: '3', name: 'Social', color: '#f5a623', icon: 'people-outline' },
    { id: '4', name: 'DevOps', color: '#6b52ae', icon: 'git-branch-outline' },
    { id: '5', name: 'AI', color: '#00bcd4', icon: 'analytics-outline' },
    { id: '6', name: 'Robotics', color: '#ff5722', icon: 'hardware-chip-outline' },
    { id: '7', name: 'Sport', color: '#8bc34a', icon: 'football-outline' },
    { id: '8', name: 'Cyber Sec', color: '#607d8b', icon: 'shield-checkmark-outline' },
    { id: '9', name: 'Design', color: '#e91e63', icon: 'brush-outline' },
] satisfies Interest[];

const ProfileScreen = () => {
    const router = useRouter();
    const { isDarkMode, colors } = useTheme();
    const { user, loading: userLoading } = useUser();
    const [refreshing, setRefreshing] = useState(false);
    const [showAllPast, setShowAllPast] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [userRating, setUserRating] = useState<number>(0);
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [interests, setInterests] = useState<string[]>([]);
    const [isUpdatingInterests, setIsUpdatingInterests] = useState(false);
    const [pastEvents, setPastEvents] = useState<Event[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Fetch user interests from backend
    const fetchUserInterests = async () => {
        try {
            const response = await axios.get(
                'https://europe-west1-playstore-e4a65.cloudfunctions.net/api/api/users/interests',
                { withCredentials: true }
            );
            if (response.data.success) {
                setInterests(response.data.interests);
            }
        } catch (error) {
            console.error('Error fetching interests:', error);
        }
    };

    // Handle toggling an interest
    const toggleInterest = async (categoryName: string) => {
        try {
            setIsUpdatingInterests(true);
            const response = await axios.post(
                'https://europe-west1-playstore-e4a65.cloudfunctions.net/api/api/users/interest',
                { interest: categoryName },
                { withCredentials: true }
            );

            if (response.data.success) {
                // Update local state based on backend response
                setInterests(prevInterests => {
                    if (prevInterests.includes(categoryName)) {
                        return prevInterests.filter(i => i !== categoryName);
                    } else {
                        return [...prevInterests, categoryName];
                    }
                });
            }
        } catch (error) {
            console.error('Error updating interest:', error);
            setError("Failed to update interest. Please try again.");
        } finally {
            setIsUpdatingInterests(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await Promise.all([
                getPastEvents(),
                fetchUserInterests()
            ]);
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            setIsRefreshing(false);
        }
    }, []);

    const handleModalClose = () => {
        setUserRating(0);
        setFeedback('');
        setSelectedEvent(null);
        setError(null);
    };

    const handleSubmitFeedback = async () => {
        if (!selectedEvent) return;

        // Prevent submission if feedback already exists
        if (selectedEvent.stars > 0 || selectedEvent.comment) {
            setError("Cannot modify feedback that has already been submitted.");
            return;
        }

        if (userRating === 0) {
            setError("Please provide a star rating before submitting.");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await axios.post(
                `https://europe-west1-playstore-e4a65.cloudfunctions.net/api/api/events/${selectedEvent.id}/feedback`,
                {
                    stars: userRating,
                    comment: feedback
                },
                {
                    withCredentials: true
                }
            );

            if (response.data.success) {
                await getPastEvents(); // Refresh the events list
                handleModalClose();
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
            setError("Failed to submit feedback. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEventPress = (event: Event) => {
        setSelectedEvent(event);
        // If the event already has user feedback (stars or comment), show in read-only mode
        if (event.stars > 0 || event.comment) {
            setUserRating(event.stars);
            setFeedback(event.comment || '');
            setError("You have already provided feedback for this event. It cannot be modified.");
        }
    };

    const isPastEvent = (event: Event): event is Event => {
        return 'rating' in event;
    };

    const renderEventDetails = () => {
        if (!selectedEvent) return null;

        const handleRatingPress = (rating: number) => {
            // Only allow rating if no previous feedback
            if (!selectedEvent.stars && !selectedEvent.comment) {
                setUserRating(rating);
            }
        };

        const hasExistingFeedback = selectedEvent.stars > 0 || selectedEvent.comment;

        return (
            <Modal
                animationType="fade"
                transparent={true}
                visible={true}
                onRequestClose={handleModalClose}
            >
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>{selectedEvent.title}</Text>
                            <TouchableOpacity
                                onPress={handleModalClose}
                                style={[styles.closeButton, { backgroundColor: colors.lightGrey }]}
                            >
                                <Ionicons name="close" size={24} color={colors.greyText} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalScrollView}>
                            <View style={styles.eventDetailContent}>
                                <View style={[styles.detailRow, { backgroundColor: colors.lightGrey }]}>
                                    <Ionicons name="calendar-outline" size={20} color={colors.greyText} />
                                    <Text style={[styles.detailText, { color: colors.text }]}>{selectedEvent.date}</Text>
                                </View>

                                <View style={styles.ratingSection}>
                                    <Text style={[styles.ratingTitle, { color: colors.text }]}>
                                        {hasExistingFeedback ? 'Your Rating' : 'Rate this Event'}
                                    </Text>
                                    <View style={styles.starsContainer}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <TouchableOpacity
                                                key={star}
                                                onPress={() => handleRatingPress(star)}
                                                disabled={hasExistingFeedback}
                                                style={styles.starButton}
                                            >
                                                <Ionicons
                                                    name={star <= (hasExistingFeedback ? selectedEvent.stars : userRating) ? 'star' : 'star-outline'}
                                                    size={32}
                                                    color={hasExistingFeedback ? colors.green : (star <= userRating ? colors.green : colors.greyText)}
                                                />
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                <View style={styles.feedbackSection}>
                                    <Text style={[styles.feedbackTitle, { color: colors.text }]}>
                                        {hasExistingFeedback ? 'Your Feedback' : 'Add Your Feedback'}
                                    </Text>
                                    {hasExistingFeedback ? (
                                        <Text style={[styles.feedbackText, {
                                            color: colors.greyText,
                                            backgroundColor: colors.lightGrey,
                                            padding: 16,
                                            borderRadius: 12,
                                            fontStyle: 'italic'
                                        }]}>
                                            {selectedEvent.comment || "No written feedback provided"}
                                        </Text>
                                    ) : (
                                        <TextInput
                                            style={[styles.feedbackInput, {
                                                backgroundColor: colors.lightGrey,
                                                color: colors.text,
                                                borderColor: colors.border
                                            }]}
                                            placeholder="Share your thoughts about this event..."
                                            placeholderTextColor={colors.greyText}
                                            value={feedback}
                                            onChangeText={setFeedback}
                                            multiline
                                            numberOfLines={3}
                                        />
                                    )}
                                </View>
                            </View>
                        </ScrollView>
                        <View style={styles.buttonContainer}>
                            {!hasExistingFeedback ? (
                                <TouchableOpacity
                                    onPress={handleSubmitFeedback}
                                    disabled={isSubmitting}
                                    style={[
                                        styles.submitButton,
                                        {
                                            backgroundColor: colors.green,
                                            opacity: isSubmitting ? 0.5 : 1
                                        }
                                    ]}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator color={colors.white} />
                                    ) : (
                                        <Text style={[styles.buttonLabel, { color: colors.white }]}>
                                            Submit Feedback
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            ) : (
                                <View style={[styles.submittedBadge, { backgroundColor: colors.lightGrey }]}>
                                    <Ionicons name="checkmark-circle" size={20} color={colors.green} />
                                    <Text style={[styles.submittedText, { color: colors.greyText }]}>
                                        Feedback Submitted
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </Modal>
        );
    };

    const renderEventList = (events: Event[], onClose: () => void, title: string) => (
        <Modal
            animationType="none"
            transparent={true}
            visible={true}
            onRequestClose={onClose}
        >
            <TouchableOpacity
                activeOpacity={1}
                style={[styles.modalContainer, {
                    opacity: 1,
                }]}
                onPress={onClose}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    style={[styles.modalContent, {
                        backgroundColor: colors.surface,
                        transform: [{ translateY: 0 }],
                    }]}
                    onPress={(e) => e.stopPropagation()}
                >
                    <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
                        <TouchableOpacity
                            onPress={onClose}
                            style={[styles.closeButton, { backgroundColor: colors.lightGrey }]}
                        >
                            <Ionicons name="close" size={24} color={colors.greyText} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.modalScrollView}>
                        {events.map((event) => (
                            <TouchableOpacity
                                key={event.id}
                                style={[styles.eventCard, {
                                    backgroundColor: colors.surface,
                                    borderColor: colors.border
                                }]}
                                onPress={() => handleEventPress(event)}
                            >
                                <View style={styles.eventCardInner}>
                                    <View style={[
                                        styles.eventCircle,
                                        {
                                            backgroundColor: isDarkMode
                                                ? `${getCategoryColor(event.category)}30`
                                                : getCategoryColor(event.category),
                                            padding: 12,
                                            borderRadius: 12
                                        }
                                    ]}>
                                        <Ionicons
                                            name="calendar"
                                            size={24}
                                            color={isDarkMode ? getCategoryColor(event.category) : colors.white}
                                        />
                                    </View>

                                    <View style={styles.eventContent}>
                                        <View style={styles.eventHeader}>
                                            <View style={[styles.categoryPill, { backgroundColor: `${getCategoryColor(event.category)}20` }]}>
                                                <Text style={[styles.categoryPillText, { color: getCategoryColor(event.category) }]}>
                                                    {event.category}
                                                </Text>
                                            </View>
                                            <Text style={[styles.eventTitle, { color: colors.text }]}>{event.title}</Text>
                                        </View>

                                        <View style={styles.eventDetails}>
                                            <View style={styles.eventDetailRow}>
                                                <View style={styles.eventDetail}>
                                                    <Ionicons name="calendar-outline" size={16} color={colors.greyText} />
                                                    <Text style={[styles.eventDetailText, { color: colors.greyText }]}>{event.date}</Text>
                                                </View>
                                                <View style={styles.eventDetail}>
                                                    <Ionicons name="time-outline" size={16} color={colors.greyText} />
                                                    <Text style={[styles.eventDetailText, { color: colors.greyText }]}>{event.time}</Text>
                                                </View>
                                            </View>

                                            {isPastEvent(event) && (
                                                <View style={styles.eventDetailRow}>
                                                    <View style={styles.eventDetail}>
                                                        <Ionicons name="star" size={16} color={colors.green} />
                                                        <Text style={[styles.eventDetailText, { color: colors.greyText }]}>
                                                            Your Rating: {event.stars}/5
                                                        </Text>
                                                    </View>
                                                    <View style={styles.eventDetail}>
                                                        <Ionicons name="people-outline" size={16} color={colors.greyText} />
                                                        <Text style={[styles.eventDetailText, { color: colors.greyText }]}>
                                                            {event.participants_count} attended
                                                        </Text>
                                                    </View>
                                                </View>
                                            )}
                                        </View>
                                    </View>

                                    <View style={styles.cardArrow}>
                                        <Ionicons name="chevron-forward" size={20} color={colors.greyText} />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );

    const stats: {
        label: string;
        value: string;
        icon: keyof typeof Ionicons.glyphMap;
    }[] = [
            {
                label: 'Events Attended',
                value: user?.attendance?.toString() || '0',
                icon: 'checkmark-circle-outline'
            },
            {
                label: 'Upcoming Events',
                value: user?.register?.toString() || '0',
                icon: 'calendar-outline'
            },
        ];

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'Tech': return '#3a7bd5';
            case 'Design': return '#c471f5';
            case 'Networking': return '#f5a623';
            default: return COLORS.green;
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'Tech':
                return 'laptop-outline';
            case 'Design':
                return 'brush-outline';
            case 'Networking':
                return 'people-outline';
            case 'Social':
                return 'chatbubbles-outline';
            default:
                return 'calendar-outline';
        }
    };

    const getPastEvents = async () => {
        try {
            const response = await axios.get('https://europe-west1-playstore-e4a65.cloudfunctions.net/api/api/events/past', {
                withCredentials: true
            });
            if (response.data.success) {
                setPastEvents(response.data.events);
            }
        } catch (error) {
            console.error('Error fetching past events:', error);
        }
    }

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                await Promise.all([
                    getPastEvents(),
                    fetchUserInterests()
                ]);
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    return (
        <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
            <StatusBar
                barStyle={isDarkMode ? "light-content" : "dark-content"}
                backgroundColor={colors.background}
                translucent={true}
            />
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={[styles.header, { backgroundColor: colors.background }]}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>

                </View>

                {(isLoading || userLoading) ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.green} />
                        <Text style={[styles.loadingText, { color: colors.text }]}>Loading profile...</Text>
                    </View>
                ) : (
                    <ScrollView
                        style={styles.scrollView}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.background }]}
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefreshing}
                                onRefresh={onRefresh}
                                colors={[colors.green]}
                                tintColor={colors.green}
                                progressViewOffset={Platform.OS === 'android' ? 50 : 0}
                            />
                        }
                    >
                        <View style={[styles.profileSection, { borderBottomColor: colors.border }]}>
                            <View style={styles.profileImageContainer}>
                                {user?.avatar ? (
                                    <Image
                                        source={{ uri: user.avatar }}
                                        style={styles.profileImage}
                                    />
                                ) : (
                                    <Ionicons
                                        name="person-circle-outline"
                                        size={75}
                                        color={isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}
                                    />
                                )}
                            </View>
                            <View style={styles.userInfoSection}>
                                <Text style={[styles.userName, { color: colors.text }]}>
                                    {user?.fname} {user?.lname}
                                </Text>
                                <Text style={[styles.userRole, { color: colors.greyText }]}>
                                    {user?.clubManager ? (
                                        <>
                                            <Text style={[styles.clubManagerBadge, { backgroundColor: colors.red, color: colors.white }]}>
                                                {user?.clubManager}
                                            </Text>
                                        </>
                                    ) : user?.role}
                                </Text>
                                <View style={styles.userDetails}>
                                    <Text style={[styles.detailValue, { color: colors.text }]}>{user?.login}</Text>
                                    <Text style={[styles.detailValue, { color: colors.text }]}>{user?.email}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.sectionTitleContainer}>
                                    <Ionicons name="bookmark" size={24} color={colors.green} />
                                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Interests</Text>
                                </View>
                            </View>
                            <View style={styles.interestsGrid}>
                                {INTEREST_CATEGORIES.map((interest: Interest) => {
                                    const isSelected = interests.includes(interest.name);
                                    return (
                                        <Pressable
                                            key={interest.id}
                                            onPress={() => !isUpdatingInterests && toggleInterest(interest.name)}
                                            style={[
                                                styles.interestItem,
                                                {
                                                    backgroundColor: isSelected
                                                        ? interest.color
                                                        : isDarkMode
                                                            ? `${interest.color}20`
                                                            : `${interest.color}10`,
                                                    borderWidth: 1,
                                                    borderColor: isSelected ? 'transparent' : interest.color,
                                                    opacity: isUpdatingInterests ? 0.7 : 1
                                                }
                                            ]}
                                        >
                                            <View style={[
                                                styles.interestIcon,
                                                {
                                                    backgroundColor: isSelected
                                                        ? 'rgba(255,255,255,0.2)'
                                                        : isDarkMode
                                                            ? `${interest.color}30`
                                                            : `${interest.color}15`
                                                }
                                            ]}>
                                                <Ionicons
                                                    name={interest.icon as keyof typeof Ionicons.glyphMap}
                                                    size={16}
                                                    color={isSelected ? colors.white : interest.color}
                                                />
                                            </View>
                                            <Text style={[
                                                styles.interestText,
                                                {
                                                    color: isSelected ? colors.white : interest.color,
                                                    fontWeight: isSelected ? '600' : '500'
                                                }
                                            ]}>
                                                {interest.name}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </View>

                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.sectionTitleContainer}>
                                    <Ionicons name="time" size={24} color={colors.green} />
                                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Past Events</Text>
                                </View>
                                {pastEvents.length > 0 && (
                                    <TouchableOpacity
                                        style={styles.seeAllButton}
                                        onPress={() => setShowAllPast(true)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[styles.seeAllText, { color: colors.green }]}>View History</Text>
                                        <Ionicons name="chevron-forward" size={16} color={colors.green} />
                                    </TouchableOpacity>
                                )}
                            </View>
                            <View style={styles.pastEventsContainer}>
                                {pastEvents.length > 0 ? (
                                    pastEvents.slice(0, 4).map((event, index) => (
                                        <Animated.View
                                            key={event.id}
                                            entering={FadeInDown.delay(index * 100)}
                                        >
                                            <Pressable
                                                key={event.id}
                                                onPress={() => handleEventPress(event)}
                                                style={({ pressed }) => [
                                                    styles.pastEventTouchable,
                                                    pressed && { opacity: 0.7 }
                                                ]}
                                            >
                                                <Surface style={[styles.pastEventCard, {
                                                    backgroundColor: colors.surface,
                                                }]} elevation={1}>
                                                    <View style={styles.pastEventInfo}>
                                                        <View style={[styles.eventIconContainer, {
                                                            backgroundColor: `${getCategoryColor(event.category)}15`
                                                        }]}>
                                                            <Ionicons
                                                                name={getCategoryIcon(event.category)}
                                                                size={24}
                                                                color={getCategoryColor(event.category)}
                                                            />
                                                        </View>
                                                        <View style={styles.pastEventContent}>
                                                            <Text style={[styles.pastEventTitle, { color: colors.text }]}>{event.title}</Text>
                                                            <View style={styles.pastEventDetails}>
                                                                <View style={styles.eventDetail}>
                                                                    <Ionicons name="calendar-outline" size={14} color={colors.greyText} />
                                                                    <Text style={[styles.pastEventDate, { color: colors.greyText }]}>{event.date}</Text>
                                                                </View>
                                                                <View style={[styles.categoryPill, {
                                                                    backgroundColor: `${getCategoryColor(event.category)}15`,
                                                                    borderWidth: 1,
                                                                    borderColor: `${getCategoryColor(event.category)}30`
                                                                }]}>
                                                                    <Text style={[styles.categoryPillText, { color: getCategoryColor(event.category) }]}>
                                                                        {event.category}
                                                                    </Text>
                                                                </View>
                                                            </View>
                                                            <View style={styles.ratingsContainer}>
                                                                <View style={styles.ratingRow}>
                                                                    <View style={styles.ratingLabelContainer}>
                                                                        <Ionicons name="star" size={14} color={colors.green} />
                                                                        <Text style={[styles.ratingLabel, { color: colors.greyText }]}>Your Rating:</Text>
                                                                    </View>
                                                                    <View style={styles.starsRow}>
                                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                                            <Ionicons
                                                                                key={`user-${star}`}
                                                                                name={star <= event.stars ? 'star' : 'star-outline'}
                                                                                size={14}
                                                                                color={colors.green}
                                                                            />
                                                                        ))}
                                                                    </View>
                                                                </View>
                                                                {event.comment && (
                                                                    <View style={styles.commentContainer}>
                                                                        <Text style={[styles.commentText, { color: colors.greyText }]} numberOfLines={2}>
                                                                            "{event.comment}"
                                                                        </Text>
                                                                    </View>
                                                                )}
                                                            </View>
                                                        </View>
                                                    </View>
                                                </Surface>
                                            </Pressable>
                                        </Animated.View>
                                    ))
                                ) : (
                                    <View style={styles.emptyEventsContainer}>
                                        <Ionicons name="calendar-outline" size={48} color={colors.greyText} />
                                        <Text style={[styles.emptyEventsTitle, { color: colors.text }]}>No Past Events</Text>
                                        <Text style={[styles.emptyEventsSubtitle, { color: colors.greyText }]}>
                                            Your event history will appear here once you attend some events
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </ScrollView>
                )}
            </View>
            <Animated.View
                entering={FadeIn.delay(400).duration(600)}
                style={[styles.navContainer, {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border
                }]}
            >
                <Nav />
            </Animated.View>

            {selectedEvent && renderEventDetails()}
            {showAllPast && renderEventList(pastEvents, () => setShowAllPast(false), 'Event History')}
        </View>
    );
};

const styles = StyleSheet.create<{
    mainContainer: ViewStyle;
    container: ViewStyle;
    header: ViewStyle;
    headerTitle: TextStyle;
    scrollView: ViewStyle;
    scrollContent: ViewStyle;
    profileSection: ViewStyle;
    profileImageContainer: ViewStyle;
    profileImage: ImageStyle;
    userInfoSection: ViewStyle;
    userName: TextStyle;
    userRole: TextStyle;
    userDetails: ViewStyle;
    detailValue: TextStyle;
    section: ViewStyle;
    sectionHeader: ViewStyle;
    sectionTitleContainer: ViewStyle;
    sectionTitle: TextStyle;
    seeAllButton: ViewStyle;
    seeAllText: TextStyle;
    pastEventsContainer: ViewStyle;
    pastEventCard: ViewStyle;
    pastEventInfo: ViewStyle;
    eventIconContainer: ViewStyle;
    pastEventContent: ViewStyle;
    pastEventTitle: TextStyle;
    pastEventDetails: ViewStyle;
    pastEventDate: TextStyle;
    categoryPill: ViewStyle;
    categoryPillText: TextStyle;
    ratingContainer: ViewStyle;
    interestsGrid: ViewStyle;
    interestItem: ViewStyle;
    interestIcon: ViewStyle;
    interestText: TextStyle;
    settingsButton: ViewStyle;
    modalOverlay: ViewStyle;
    modalWrapper: ViewStyle;
    modalContent: ViewStyle;
    modalHeader: ViewStyle;
    modalTitle: TextStyle;
    modalScrollView: ViewStyle;
    eventDetailContent: ViewStyle;
    detailRow: ViewStyle;
    detailText: TextStyle;
    ratingSection: ViewStyle;
    ratingTitle: TextStyle;
    starsContainer: ViewStyle;
    starButton: ViewStyle;
    ratingText: TextStyle;
    feedbackSection: ViewStyle;
    feedbackTitle: TextStyle;
    feedbackInput: TextStyle;
    buttonContainer: ViewStyle;
    submitButton: ViewStyle;
    buttonContent: ViewStyle;
    buttonLabel: TextStyle;
    navContainer: ViewStyle;
    loadingContainer: ViewStyle;
    loadingText: TextStyle;
    closeButton: ViewStyle;
    modalContainer: ViewStyle;
    eventCard: ViewStyle;
    eventCardInner: ViewStyle;
    eventCircle: ViewStyle;
    eventContent: ViewStyle;
    eventHeader: ViewStyle;
    eventTitle: TextStyle;
    eventDetails: ViewStyle;
    eventDetailRow: ViewStyle;
    eventDetail: ViewStyle;
    eventDetailText: TextStyle;
    pastEventTouchable: ViewStyle;
    dialog: ViewStyle;
    interestSelector: ViewStyle;
    categorySelector: ViewStyle;
    categoryIcon: ViewStyle;
    categoryText: TextStyle;
    checkmark: ViewStyle;
    clubManagerBadge: TextStyle;
    emptyEventsContainer: ViewStyle;
    emptyEventsTitle: TextStyle;
    emptyEventsSubtitle: TextStyle;
    ratingsContainer: ViewStyle;
    ratingRow: ViewStyle;
    ratingLabelContainer: ViewStyle;
    ratingLabel: TextStyle;
    starsRow: ViewStyle;
    commentContainer: ViewStyle;
    commentText: TextStyle;
    feedbackText: TextStyle;
    submittedBadge: ViewStyle;
    submittedText: TextStyle;
    cardArrow: ViewStyle;
}>({
    mainContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    container: {
        flex: 1,
        width: '100%',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingBottom: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 100,
    },
    profileSection: {
        alignItems: 'center',
        paddingTop: 16,
        paddingBottom: 20,
        borderBottomWidth: 1,
    },
    profileImageContainer: {
        width: 100,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderRadius: 50,
        backgroundColor: COLORS.lightGrey,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: COLORS.lightGrey,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    userInfoSection: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    userName: {
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 4,
        textAlign: 'center',
    },
    userRole: {
        fontSize: 15,
        color: COLORS.greyText,
        marginBottom: 20,
        textAlign: 'center',
    },
    userDetails: {
        width: '100%',
        maxWidth: 300,
        alignItems: 'center',
        gap: 16,
    },
    detailValue: {
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
    },
    section: {
        paddingHorizontal: 20,
        marginTop: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    seeAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: '600',
    },
    pastEventsContainer: {
        gap: 16,
        paddingTop: 8,
    },
    pastEventCard: {
        borderRadius: 16,
        overflow: 'hidden',
        marginHorizontal: 1,
        marginVertical: 1,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        backgroundColor: COLORS.white,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    pastEventInfo: {
        flexDirection: 'row',
        padding: 16,
        gap: 16,
        alignItems: 'flex-start',
    },
    eventIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pastEventContent: {
        flex: 1,
        gap: 12,
    },
    pastEventTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.black,
        marginBottom: 4,
    },
    pastEventDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    pastEventDate: {
        fontSize: 14,
        color: COLORS.greyText,
    },
    categoryPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    categoryPillText: {
        fontSize: 12,
        fontWeight: '600',
    },
    ratingContainer: {
        marginTop: 8,
        gap: 4,
    },
    interestsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        paddingTop: 8,
    },
    interestItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 16,
        gap: 4,
    },
    interestIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    interestText: {
        fontSize: 13,
    },
    settingsButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: COLORS.lightGrey,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalWrapper: {
        width: '85%',
        maxWidth: 340,
        maxHeight: '70%',
    },
    modalContent: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderBottomWidth: 1,
    },
    modalTitle: {
        fontSize: 17,
        fontWeight: '600',
    },
    modalScrollView: {
        maxHeight: '100%',
    },
    eventDetailContent: {
        padding: 14,
        gap: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 10,
        borderRadius: 8,
    },
    detailText: {
        fontSize: 16,
        color: COLORS.greyText,
    },
    ratingSection: {
        alignItems: 'center',
        paddingVertical: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.02)',
        borderRadius: 12,
        paddingHorizontal: 14,
        marginVertical: 10,
    },
    ratingTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    starButton: {
        padding: 4,
    },
    ratingText: {
        marginTop: 12,
        fontSize: 15,
        fontWeight: '500',
    },
    feedbackSection: {
        marginTop: 16,
    },
    feedbackTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },
    feedbackInput: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        minHeight: 120,
        maxHeight: 200,
        textAlignVertical: 'top',
        fontSize: 15,
    },
    buttonContainer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.05)',
    },
    submitButton: {
        borderRadius: 12,
        elevation: 0,
    },
    buttonContent: {
        paddingVertical: 8,
        height: 48,
    },
    buttonLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    navContainer: {
        width: '100%',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopWidth: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 16,
        color: COLORS.greyText,
    },
    closeButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: COLORS.lightGrey,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    eventCard: {
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    eventCardInner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 16,
    },
    eventCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    eventContent: {
        flex: 1,
        gap: 8,
    },
    eventHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 8,
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
    },
    eventDetails: {
        gap: 8,
    },
    eventDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16,
    },
    eventDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flex: 1,
    },
    eventDetailText: {
        fontSize: 14,
        color: COLORS.greyText,
    },
    pastEventTouchable: {
        marginBottom: 0,
    },
    dialog: {
        borderRadius: 16,
    },
    interestSelector: {
        gap: 12,
    },
    categorySelector: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
    },
    categoryIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryText: {
        fontSize: 16,
        marginLeft: 12,
        flex: 1,
    },
    checkmark: {
        marginLeft: 8,
    },
    clubManagerBadge: {
        fontSize: 13,
        fontWeight: '600',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        marginLeft: 6,
    },
    emptyEventsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 32,
        gap: 12,
    },
    emptyEventsTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    emptyEventsSubtitle: {
        fontSize: 14,
        textAlign: 'center',
        maxWidth: '80%',
    },
    ratingsContainer: {
        marginTop: 8,
        gap: 4,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    ratingLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    starsRow: {
        flexDirection: 'row',
        gap: 2,
    },
    commentContainer: {
        marginTop: 4,
        paddingTop: 4,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    commentText: {
        fontSize: 12,
        fontStyle: 'italic',
        lineHeight: 16,
    },
    feedbackText: {
        fontSize: 14,
        lineHeight: 20,
    },
    submittedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        gap: 8,
    },
    submittedText: {
        fontSize: 14,
        fontWeight: '500',
    },
    cardArrow: {
        opacity: 0.5,
    },
});

export default ProfileScreen;

