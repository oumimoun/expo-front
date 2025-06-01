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
    ViewStyle,
} from 'react-native';
import { Button, Surface, Text } from 'react-native-paper';
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

interface Category {
    id: string;
    name: string;
    color: string;
    icon: string;
}

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
    id: number;
    title: string;
    date: string;
    category: string;
    rating: number;
}

const INTEREST_CATEGORIES: Category[] = [
    { id: '1', name: 'Web Dev', color: '#3a7bd5', icon: 'code-slash-outline' },
    { id: '2', name: 'Mobile Dev', color: '#4CAF50', icon: 'phone-portrait-outline' },
    { id: '3', name: 'Social', color: '#f5a623', icon: 'people-outline' },
    { id: '4', name: 'DevOps', color: '#6b52ae', icon: 'git-branch-outline' },
    { id: '5', name: 'AI', color: '#00bcd4', icon: 'analytics-outline' },
    { id: '6', name: 'Robotics', color: '#ff5722', icon: 'hardware-chip-outline' },
    { id: '7', name: 'Sport', color: '#8bc34a', icon: 'football-outline' },
    { id: '8', name: 'Cyber Sec', color: '#607d8b', icon: 'shield-checkmark-outline' },
    { id: '9', name: 'Design', color: '#e91e63', icon: 'brush-outline' },
];

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
    const [interests, setInterests] = useState<string[]>(['Tech Events', 'Workshops', 'Networking']);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [pastEvents, setPastEvents] = useState<Event[]>([]);

    const onRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await getPastEvents();
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            setIsRefreshing(false);
        }
    }, []);

    const handleEventPress = (event: Event) => {
        router.push(`/event/${event.id}`);
    };

    const isPastEvent = (event: Event): event is Event => {
        return 'rating' in event;
    };

    const renderEventDetails = () => {
        if (!selectedEvent) return null;

        const handleRatingPress = (rating: number) => {
            setUserRating(rating);
        };

        const handleModalClose = () => {
            setUserRating(0);
            setFeedback('');
            setSelectedEvent(null);
        };

        const handleSubmitFeedback = async () => {
            setIsSubmitting(true);
            try {
                // TODO: Implement API call to submit rating and feedback
                console.log('Submitting feedback:', { eventId: selectedEvent.id, rating: userRating, feedback });
                setIsSubmitting(false);
                setSelectedEvent(null);
            } catch (error) {
                console.error('Error submitting feedback:', error);
                setIsSubmitting(false);
            }
        };

        return (
            <Modal
                animationType="fade"
                transparent={true}
                visible={true}
                onRequestClose={() => setSelectedEvent(null)}
            >
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>{selectedEvent.title}</Text>
                            <TouchableOpacity
                                onPress={() => setSelectedEvent(null)}
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
                                <View style={[styles.detailRow, { backgroundColor: colors.lightGrey }]}>
                                    <Ionicons name="star" size={20} color={colors.green} />
                                    <Text style={[styles.detailText, { color: colors.text }]}>Rating: {selectedEvent.rating}/5</Text>
                                </View>
                                <View style={styles.feedbackSection}>
                                    <Text style={[styles.feedbackTitle, { color: colors.text }]}>Your Feedback</Text>
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
                                </View>
                            </View>
                        </ScrollView>
                        <View style={styles.buttonContainer}>
                            <Button
                                mode="contained"
                                onPress={handleSubmitFeedback}
                                style={[styles.submitButton, { backgroundColor: colors.green }]}
                                contentStyle={styles.buttonContent}
                                labelStyle={[styles.buttonLabel, { color: colors.white }]}
                                loading={isSubmitting}
                                disabled={isSubmitting || userRating === 0}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                            </Button>
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
                                                : getCategoryColor(event.category)
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
                                            <Text style={[styles.eventTitle, { color: colors.text }]}>{event.title}</Text>
                                            <View style={[styles.categoryPill, { backgroundColor: `${getCategoryColor(event.category)}20` }]}>
                                                <Text style={[styles.categoryPillText, { color: getCategoryColor(event.category) }]}>
                                                    {event.category}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={styles.eventDetails}>
                                            <View style={styles.eventDetailRow}>
                                                <View style={styles.eventDetail}>
                                                    <Ionicons name="calendar-outline" size={16} color={colors.greyText} />
                                                    <Text style={[styles.eventDetailText, { color: colors.greyText }]}>{event.date}</Text>
                                                </View>
                                            </View>

                                            {isPastEvent(event) && (
                                                <View style={styles.eventDetailRow}>
                                                    <View style={styles.eventDetail}>
                                                        <Ionicons name="star" size={16} color={colors.green} />
                                                        <Text style={[styles.eventDetailText, { color: colors.greyText }]}>Rating: {event.rating}/5</Text>
                                                    </View>
                                                </View>
                                            )}
                                        </View>
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

    const renderRatingStars = (rating: number) => {
        return (
            <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                        key={star}
                        name={star <= rating ? 'star' : 'star-outline'}
                        size={14}
                        color={star <= rating ? COLORS.green : COLORS.greyText}
                    />
                ))}
            </View>
        );
    };

    const getPastEvents = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/events/past', {
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
                await getPastEvents();
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const toggleInterest = (categoryName: string) => {
        setSelectedInterests(prev =>
            prev.includes(categoryName)
                ? prev.filter(name => name !== categoryName)
                : [...prev, categoryName]
        );
    };

    const handleAddInterests = async () => {
        try {
            const response = await axios.post('http://localhost:3000/api/users/interests', {
                interests: selectedInterests
            }, {
                withCredentials: true
            });

            if (response.data.success) {
                setInterests(selectedInterests);
                setShowAddDialog(false);
            }
        } catch (error) {
            console.error('Error updating interests:', error);
        }
    };

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
                                            <Text style={[styles.clubManagerBadge, { backgroundColor: colors.red, color: colors.white}]}>
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
                                {INTEREST_CATEGORIES.map((category) => {
                                    const isSelected = interests.includes(category.name);
                                    return (
                                        <Pressable
                                            key={category.id}
                                            onPress={() => {
                                                const updatedInterests = isSelected
                                                    ? interests.filter(i => i !== category.name)
                                                    : [...interests, category.name];
                                                setInterests(updatedInterests);
                                            }}
                                            style={[
                                                styles.interestItem,
                                                {
                                                    backgroundColor: isSelected
                                                        ? category.color
                                                        : isDarkMode
                                                            ? `${category.color}20`
                                                            : `${category.color}10`,
                                                    borderWidth: 1,
                                                    borderColor: isSelected ? 'transparent' : category.color
                                                }
                                            ]}
                                        >
                                            <View style={[
                                                styles.interestIcon,
                                                {
                                                    backgroundColor: isSelected
                                                        ? 'rgba(255,255,255,0.2)'
                                                        : isDarkMode
                                                            ? `${category.color}30`
                                                            : `${category.color}15`
                                                }
                                            ]}>
                                                <Ionicons
                                                    name={category.icon as keyof typeof Ionicons.glyphMap}
                                                    size={16}
                                                    color={isSelected ? colors.white : category.color}
                                                />
                                            </View>
                                            <Text style={[
                                                styles.interestText,
                                                {
                                                    color: isSelected ? colors.white : category.color,
                                                    fontWeight: isSelected ? '600' : '500'
                                                }
                                            ]}>
                                                {category.name}
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
                                                            {renderRatingStars(event.rating)}
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
        borderRadius: 12,
        overflow: 'hidden',
        marginHorizontal: 1,
        marginVertical: 1,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    pastEventInfo: {
        flexDirection: 'row',
        padding: 16,
        gap: 16,
        alignItems: 'center',
    },
    eventIconContainer: {
        width: 42,
        height: 42,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pastEventContent: {
        flex: 1,
        gap: 8,
    },
    pastEventTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    pastEventDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    pastEventDate: {
        fontSize: 13,
        color: COLORS.greyText,
    },
    categoryPill: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryPillText: {
        fontSize: 12,
        fontWeight: '600',
    },
    ratingContainer: {
        flexDirection: 'row',
        gap: 4,
        marginTop: 4,
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
        paddingVertical: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.02)',
        borderRadius: 8,
        paddingHorizontal: 14,
    },
    ratingTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 10,
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
    },
    starButton: {
        padding: 3,
    },
    ratingText: {
        marginTop: 6,
        fontSize: 13,
    },
    feedbackSection: {
        marginTop: 0,
    },
    feedbackTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 6,
    },
    feedbackInput: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        minHeight: 70,
        maxHeight: 100,
        textAlignVertical: 'top',
        fontSize: 13,
    },
    buttonContainer: {
        padding: 14,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.05)',
    },
    submitButton: {
        borderRadius: 8,
        elevation: 0,
    },
    buttonContent: {
        paddingVertical: 4,
        height: 40,
    },
    buttonLabel: {
        fontSize: 14,
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
});

export default ProfileScreen;

