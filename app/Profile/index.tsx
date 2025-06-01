import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    Dimensions,
    Modal,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { Surface, Text } from 'react-native-paper';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Nav from '../../components/Nav';

const { width } = Dimensions.get('window');

const COLORS = {
    background: '#FFFFFF',
    green: '#1b8456',
    lightGreen: '#e0f0e9',
    greyText: '#555555',
    lightGrey: '#f9f9f9',
    white: '#FFFFFF',
    red: '#ff4444',
};

interface BaseEvent {
    id: number;
    title: string;
    date: string;
    category: string;
}

interface UpcomingEvent extends BaseEvent {
    time: string;
    location: string;
    attendees?: number;
}

interface PastEvent extends BaseEvent {
    rating: number;
}

type Event = UpcomingEvent | PastEvent;

const ProfileScreen = () => {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [showAllUpcoming, setShowAllUpcoming] = useState(false);
    const [showAllPast, setShowAllPast] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 1500);
    }, []);

    const handleEventPress = (event: Event) => {
        setSelectedEvent(event);
    };

    const isPastEvent = (event: Event): event is PastEvent => {
        return 'rating' in event;
    };

    const renderEventDetails = () => {
        if (!selectedEvent) return null;

        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={true}
                onRequestClose={() => setSelectedEvent(null)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.sectionTitle}>{selectedEvent.title}</Text>
                            <TouchableOpacity
                                onPress={() => setSelectedEvent(null)}
                                style={styles.closeButton}
                            >
                                <Ionicons name="close" size={24} color={COLORS.greyText} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalScrollView}>
                            <View style={styles.eventDetailContent}>
                                <View style={styles.detailRow}>
                                    <Ionicons name="calendar-outline" size={20} color={COLORS.greyText} />
                                    <Text style={styles.detailText}>{selectedEvent.date}</Text>
                                </View>
                                {!isPastEvent(selectedEvent) && (
                                    <>
                                        <View style={styles.detailRow}>
                                            <Ionicons name="time-outline" size={20} color={COLORS.greyText} />
                                            <Text style={styles.detailText}>{selectedEvent.time}</Text>
                                        </View>
                                        <View style={styles.detailRow}>
                                            <Ionicons name="location-outline" size={20} color={COLORS.greyText} />
                                            <Text style={styles.detailText}>{selectedEvent.location}</Text>
                                        </View>
                                    </>
                                )}
                                {isPastEvent(selectedEvent) && (
                                    <View style={styles.detailRow}>
                                        <Ionicons name="star" size={20} color={COLORS.green} />
                                        <Text style={styles.detailText}>Rating: {selectedEvent.rating}/5</Text>
                                    </View>
                                )}
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        );
    };

    const renderEventList = (events: Event[], onClose: () => void, title: string) => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.sectionTitle}>{title}</Text>
                        <TouchableOpacity
                            onPress={onClose}
                            style={styles.closeButton}
                        >
                            <Ionicons name="close" size={24} color={COLORS.greyText} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.modalScrollView}>
                        {events.map((event) => (
                            <TouchableOpacity
                                key={event.id}
                                style={styles.eventCard}
                                onPress={() => handleEventPress(event)}
                            >
                                <View style={styles.eventCardInner}>
                                    <View style={[styles.eventCircle, { backgroundColor: getCategoryColor(event.category) }]}>
                                        <Ionicons name="calendar" size={24} color={COLORS.white} />
                                    </View>
                                    <View style={styles.eventContent}>
                                        <View style={styles.eventHeader}>
                                            <Text style={styles.eventTitle}>{event.title}</Text>
                                            <View style={[styles.categoryPill, { backgroundColor: `${getCategoryColor(event.category)}20` }]}>
                                                <Text style={[styles.categoryPillText, { color: getCategoryColor(event.category) }]}>
                                                    {event.category}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={styles.eventDetails}>
                                            <View style={styles.eventDetailRow}>
                                                <View style={styles.eventDetail}>
                                                    <Ionicons name="calendar-outline" size={16} color={COLORS.greyText} />
                                                    <Text style={styles.eventDetailText}>{event.date}</Text>
                                                </View>
                                                {!isPastEvent(event) && (
                                                    <View style={styles.eventDetail}>
                                                        <Ionicons name="time-outline" size={16} color={COLORS.greyText} />
                                                        <Text style={styles.eventDetailText}>{event.time}</Text>
                                                    </View>
                                                )}
                                            </View>
                                            {!isPastEvent(event) && (
                                                <View style={styles.eventDetailRow}>
                                                    <View style={styles.eventDetail}>
                                                        <Ionicons name="location-outline" size={16} color={COLORS.greyText} />
                                                        <Text style={styles.eventDetailText}>{event.location}</Text>
                                                    </View>
                                                </View>
                                            )}
                                            {isPastEvent(event) && (
                                                <View style={styles.eventDetailRow}>
                                                    <View style={styles.eventDetail}>
                                                        <Ionicons name="star" size={16} color={COLORS.green} />
                                                        <Text style={styles.eventDetailText}>Rating: {event.rating}/5</Text>
                                                    </View>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    const stats = [
        {
            label: 'Events Attended',
            value: '24',
            icon: 'checkmark-circle-outline'
        },
        {
            label: 'Upcoming Events',
            value: '5',
            icon: 'calendar-outline'
        },
    ];

    const upcomingEvents = [
        {
            id: 1,
            title: 'Tech Conference 2024',
            date: '2024-04-15',
            time: '09:00 AM',
            location: 'Convention Center',
            category: 'Tech',
            attendees: 234,
            isRegistered: true,
        },
        {
            id: 2,
            title: 'Design Workshop',
            date: '2024-04-20',
            time: '02:00 PM',
            location: 'Creative Hub',
            category: 'Design',
            attendees: 45,
            isRegistered: true,
        },
        {
            id: 3,
            title: 'Startup Meetup',
            date: '2024-04-25',
            time: '06:00 PM',
            location: 'Innovation Center',
            category: 'Networking',
            attendees: 120,
            isRegistered: true,
        },
    ];

    const pastEvents = [
        {
            id: 1,
            title: 'AI Summit 2024',
            date: '2024-03-10',
            category: 'Tech',
            rating: 5,
        },
        {
            id: 2,
            title: 'UX/UI Workshop',
            date: '2024-03-15',
            category: 'Design',
            rating: 4,
        },
        {
            id: 3,
            title: 'Networking Night',
            date: '2024-03-20',
            category: 'Social',
            rating: 5,
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

    return (
        <View style={styles.mainContainer}>
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Profile</Text>
                    <TouchableOpacity
                        style={styles.settingsButton}
                        onPress={() => router.push('/settings')}
                    >
                        <Ionicons name="settings-outline" size={24} color="#000000" />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[COLORS.green]}
                            tintColor={COLORS.green}
                        />
                    }
                >
                    <View style={styles.profileSection}>
                        <View style={styles.profileImageContainer}>
                            <Ionicons name="person-circle" size={100} color={COLORS.green} />
                        </View>
                        <Text style={styles.username}>John Doe</Text>
                        <Text style={styles.userHandle}>Computer Science Student</Text>
                    </View>

                    <View style={styles.statsSection}>
                        {stats.map((stat, index) => (
                            <View key={index} style={styles.statItem}>
                                <View style={styles.statIconContainer}>
                                    <Ionicons name={stat.icon as keyof typeof Ionicons.glyphMap} size={24} color={COLORS.green} />
                                </View>
                                <Text style={styles.statValue}>{stat.value}</Text>
                                <Text style={styles.statLabel}>{stat.label}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionTitleContainer}>
                                <Ionicons name="calendar" size={24} color={COLORS.green} />
                                <Text style={styles.sectionTitle}>Upcoming Events</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.seeAllButton}
                                onPress={() => setShowAllUpcoming(true)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.seeAllText}>See All</Text>
                                <Ionicons name="chevron-forward" size={16} color={COLORS.green} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.eventsContainer}>
                            {upcomingEvents.slice(0, 2).map((event, index) => (
                                <TouchableOpacity
                                    key={event.id}
                                    style={styles.eventCard}
                                    onPress={() => handleEventPress(event)}
                                >
                                    <View style={styles.eventCardInner}>
                                        <View style={[styles.eventCircle, { backgroundColor: getCategoryColor(event.category) }]}>
                                            <Ionicons name="calendar" size={24} color={COLORS.white} />
                                        </View>
                                        <View style={styles.eventContent}>
                                            <View style={styles.eventHeader}>
                                                <Text style={styles.eventTitle}>{event.title}</Text>
                                                <View style={[styles.categoryPill, { backgroundColor: `${getCategoryColor(event.category)}20` }]}>
                                                    <Text style={[styles.categoryPillText, { color: getCategoryColor(event.category) }]}>
                                                        {event.category}
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={styles.eventDetails}>
                                                <View style={styles.eventDetailRow}>
                                                    <View style={styles.eventDetail}>
                                                        <Ionicons name="calendar-outline" size={16} color={COLORS.greyText} />
                                                        <Text style={styles.eventDetailText}>{event.date}</Text>
                                                    </View>
                                                    <View style={styles.eventDetail}>
                                                        <Ionicons name="time-outline" size={16} color={COLORS.greyText} />
                                                        <Text style={styles.eventDetailText}>{event.time}</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.eventDetailRow}>
                                                    <View style={styles.eventDetail}>
                                                        <Ionicons name="location-outline" size={16} color={COLORS.greyText} />
                                                        <Text style={styles.eventDetailText}>{event.location}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionTitleContainer}>
                                <Ionicons name="time" size={24} color={COLORS.green} />
                                <Text style={styles.sectionTitle}>Past Events</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.seeAllButton}
                                onPress={() => setShowAllPast(true)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.seeAllText}>View History</Text>
                                <Ionicons name="chevron-forward" size={16} color={COLORS.green} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.pastEventsContainer}>
                            {pastEvents.map((event, index) => (
                                <Animated.View
                                    key={event.id}
                                    entering={FadeInDown.delay(index * 100)}
                                >
                                    <TouchableOpacity
                                        activeOpacity={0.85}
                                        onPress={() => handleEventPress(event)}
                                        style={styles.pastEventTouchable}
                                        android_ripple={null}
                                        android_disableSound={true}
                                        pressRetentionOffset={{ top: 0, left: 0, bottom: 0, right: 0 }}
                                        hitSlop={{ top: 0, left: 0, bottom: 0, right: 0 }}
                                    >
                                        <Surface style={styles.pastEventCard}>
                                            <View style={[styles.pastEventInfo, { userSelect: 'none' }]}>
                                                <View style={styles.pastEventContent}>
                                                    <Text style={styles.pastEventTitle} selectable={false}>{event.title}</Text>
                                                    <View style={styles.pastEventDetails}>
                                                        <View style={styles.eventDetail}>
                                                            <Ionicons name="calendar-outline" size={14} color={COLORS.greyText} />
                                                            <Text style={styles.pastEventDate} selectable={false}>{event.date}</Text>
                                                        </View>
                                                        <View style={[styles.categoryPill, { backgroundColor: `${getCategoryColor(event.category)}20` }]}>
                                                            <Text style={[styles.categoryPillText, { color: getCategoryColor(event.category) }]} selectable={false}>
                                                                {event.category}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </View>
                                                {renderRatingStars(event.rating)}
                                            </View>
                                        </Surface>
                                    </TouchableOpacity>
                                </Animated.View>
                            ))}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionTitleContainer}>
                                <Ionicons name="bookmark" size={24} color={COLORS.green} />
                                <Text style={styles.sectionTitle}>Interests</Text>
                            </View>
                        </View>
                        <View style={styles.interestsContainer}>
                            {['Tech Events', 'Workshops', 'Networking', 'Conferences', 'Meetups'].map((interest, index) => (
                                <Animated.View
                                    key={index}
                                    entering={FadeInDown.delay(index * 50)}
                                >
                                    <View style={styles.interestPill}>
                                        <Text style={styles.interestText}>{interest}</Text>
                                    </View>
                                </Animated.View>
                            ))}
                        </View>
                    </View>
                </ScrollView>

                {selectedEvent && renderEventDetails()}
                {showAllUpcoming && (
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={true}
                        onRequestClose={() => setShowAllUpcoming(false)}
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.sectionTitle}>All Upcoming Events</Text>
                                    <TouchableOpacity
                                        onPress={() => setShowAllUpcoming(false)}
                                        style={styles.closeButton}
                                    >
                                        <Ionicons name="close" size={24} color={COLORS.greyText} />
                                    </TouchableOpacity>
                                </View>
                                <ScrollView style={styles.modalScrollView}>
                                    {upcomingEvents.map((event) => (
                                        <TouchableOpacity
                                            key={event.id}
                                            style={styles.eventCard}
                                            onPress={() => handleEventPress(event)}
                                        >
                                            <View style={styles.eventCardInner}>
                                                <View style={[styles.eventCircle, { backgroundColor: getCategoryColor(event.category) }]}>
                                                    <Ionicons name="calendar" size={24} color={COLORS.white} />
                                                </View>
                                                <View style={styles.eventContent}>
                                                    <View style={styles.eventHeader}>
                                                        <Text style={styles.eventTitle}>{event.title}</Text>
                                                        <View style={[styles.categoryPill, { backgroundColor: `${getCategoryColor(event.category)}20` }]}>
                                                            <Text style={[styles.categoryPillText, { color: getCategoryColor(event.category) }]}>
                                                                {event.category}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                    <View style={styles.eventDetails}>
                                                        <View style={styles.eventDetailRow}>
                                                            <View style={styles.eventDetail}>
                                                                <Ionicons name="calendar-outline" size={16} color={COLORS.greyText} />
                                                                <Text style={styles.eventDetailText}>{event.date}</Text>
                                                            </View>
                                                            <View style={styles.eventDetail}>
                                                                <Ionicons name="time-outline" size={16} color={COLORS.greyText} />
                                                                <Text style={styles.eventDetailText}>{event.time}</Text>
                                                            </View>
                                                        </View>
                                                        <View style={styles.eventDetailRow}>
                                                            <View style={styles.eventDetail}>
                                                                <Ionicons name="location-outline" size={16} color={COLORS.greyText} />
                                                                <Text style={styles.eventDetailText}>{event.location}</Text>
                                                            </View>
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        </View>
                    </Modal>
                )}
                {showAllPast && renderEventList(pastEvents, () => setShowAllPast(false), 'Event History')}
            </SafeAreaView>
            <Nav />
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 15,
        backgroundColor: COLORS.background,
        zIndex: 1,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000000',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    profileSection: {
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    profileImageContainer: {
        width: 100,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    username: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 4,
    },
    userHandle: {
        fontSize: 16,
        color: COLORS.greyText,
        marginBottom: 16,
    },
    statsSection: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 20,
        paddingHorizontal: 20,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.lightGreen,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.green,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
        color: COLORS.greyText,
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
        color: '#000000',
    },
    seeAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    seeAllText: {
        color: COLORS.green,
        fontSize: 14,
        fontWeight: '600',
    },
    eventsContainer: {
        gap: 12,
    },
    eventCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)'
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
        color: '#000000',
        flex: 1,
    },
    categoryPill: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    categoryPillText: {
        fontSize: 12,
        fontWeight: '600',
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
    pastEventsContainer: {
        gap: 12,
    },
    pastEventCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    pastEventInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pastEventContent: {
        flex: 1,
    },
    pastEventTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
        marginBottom: 8,
    },
    pastEventDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    pastEventDate: {
        fontSize: 14,
        color: COLORS.greyText,
    },
    ratingContainer: {
        flexDirection: 'row',
        gap: 2,
    },
    interestsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    interestPill: {
        backgroundColor: COLORS.lightGreen,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    interestText: {
        color: COLORS.green,
        fontSize: 14,
        fontWeight: '500',
    },
    settingsButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: COLORS.lightGrey,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    modalScrollView: {
        padding: 20,
    },
    closeButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: COLORS.lightGrey,
    },
    eventDetailContent: {
        gap: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: COLORS.lightGrey,
        borderRadius: 12,
    },
    detailText: {
        fontSize: 16,
        color: COLORS.greyText,
    },
    pastEventTouchable: {
        marginBottom: 12,
    },
});

export default ProfileScreen;
