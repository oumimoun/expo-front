import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Dimensions,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { Surface, Text } from 'react-native-paper';
import Animated from 'react-native-reanimated';
import Nav from '../../components/Nav';

const { width } = Dimensions.get('window');

const COLORS = {
    background: '#FFFFFF',
    green: '#1b8456',
    lightGreen: '#e0f0e9',
    greyText: '#555555',
    lightGrey: '#f9f9f9',
    white: '#FFFFFF',
};

const ProfileScreen = () => {
    const stats = [
        { label: 'Events Attended', value: '24' },
        { label: 'Upcoming Events', value: '5' },
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
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.header}>
                        <Surface style={styles.profileImageContainer}>
                            <Image
                                source={{ uri: 'https://picsum.photos/200' }}
                                style={styles.profileImage}
                            />
                        </Surface>
                        <Text style={styles.username}>John Doe</Text>
                        <Text style={styles.userHandle}>Event Enthusiast</Text>
                    </View>

                    <View style={styles.statsContainer}>
                        {stats.map((stat, index) => (
                            <View key={index} style={styles.statItem}>
                                <Text style={styles.statValue}>{stat.value}</Text>
                                <Text style={styles.statLabel}>{stat.label}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Upcoming Events</Text>
                            <TouchableOpacity>
                                <Text style={styles.seeAllButton}>See All</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.eventsContainer}>
                            {upcomingEvents.map((event) => (
                                <Animated.View key={event.id} style={styles.eventCard}>
                                    <TouchableOpacity
                                        style={styles.eventCardInner}
                                        activeOpacity={0.7}
                                    >
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
                                                    <View style={styles.eventDetail}>
                                                        <Ionicons name="people-outline" size={16} color={COLORS.greyText} />
                                                        <Text style={styles.eventDetailText}>{event.attendees} attending</Text>
                                                    </View>
                                                </View>
                                            </View>

                                            <View style={styles.registrationBadge}>
                                                <Ionicons name="checkmark-circle" size={16} color={COLORS.green} />
                                                <Text style={styles.registrationText}>Registered</Text>
                                            </View>
                                        </View>
                                        <Ionicons name="chevron-forward" size={20} color={COLORS.greyText} />
                                    </TouchableOpacity>
                                </Animated.View>
                            ))}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Past Events</Text>
                            <TouchableOpacity>
                                <Text style={styles.seeAllButton}>View History</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.pastEventsContainer}>
                            {pastEvents.map((event) => (
                                <Surface key={event.id} style={styles.pastEventCard}>
                                    <View style={styles.pastEventInfo}>
                                        <View>
                                            <Text style={styles.pastEventTitle}>{event.title}</Text>
                                            <View style={styles.pastEventDetails}>
                                                <Ionicons name="calendar-outline" size={14} color={COLORS.greyText} />
                                                <Text style={styles.pastEventDate}>{event.date}</Text>
                                                <View style={[styles.categoryPill, { backgroundColor: COLORS.lightGreen }]}>
                                                    <Text style={styles.categoryPillText}>{event.category}</Text>
                                                </View>
                                            </View>
                                        </View>
                                        {renderRatingStars(event.rating)}
                                    </View>
                                </Surface>
                            ))}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Your Interests</Text>
                            <TouchableOpacity>
                                <Text style={styles.seeAllButton}>Edit</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.interestsContainer}>
                            {['Tech Events', 'Workshops', 'Networking', 'Conferences', 'Meetups'].map((interest, index) => (
                                <View key={index} style={styles.interestPill}>
                                    <Text style={styles.interestText}>{interest}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </ScrollView>
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 80, // Add padding for the nav bar
    },
    header: {
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 20,
    },
    profileImageContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        elevation: 4,
        overflow: 'hidden',
        marginBottom: 16,
        backgroundColor: COLORS.white,
    },
    profileImage: {
        width: '100%',
        height: '100%',
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
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    statItem: {
        alignItems: 'center',
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
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000000',
    },
    seeAllButton: {
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
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
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
    registrationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: COLORS.lightGreen,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginTop: 4,
    },
    registrationText: {
        color: COLORS.green,
        fontSize: 12,
        fontWeight: '600',
    },
    pastEventsContainer: {
        gap: 12,
    },
    pastEventCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 16,
        elevation: 2,
    },
    pastEventInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
});

export default ProfileScreen;
