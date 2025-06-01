import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Modal,
    Platform,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
    Image
} from 'react-native';
import { Surface, Text } from 'react-native-paper';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Nav from '../../components/Nav';
import { useTheme } from '../../contexts/ThemeContext';
import axios from 'axios';

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
    id: number;
    title: string;
    date: string;
    category: string;
    rating: number;
}


const ProfileScreen = () => {
    const router = useRouter();
    const { isDarkMode, colors } = useTheme();
    const [refreshing, setRefreshing] = useState(false);
    const [showAllPast, setShowAllPast] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [userInfo, setUserInfo] = useState<User | null>(null);


    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 1500);
    }, []);

    const handleEventPress = (event: Event) => {
        setSelectedEvent(event);
    };

    const isPastEvent = (event: Event): event is Event => {
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
                                { (
                                    <View style={[styles.detailRow, { backgroundColor: colors.lightGrey }]}>
                                        <Ionicons name="star" size={20} color={colors.green} />
                                        <Text style={[styles.detailText, { color: colors.text }]}>Rating: {selectedEvent.rating}/5</Text>
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
                <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
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
                </View>
            </View>
        </Modal>
    );

    const stats: {
        label: string;
        value: string;
        icon: keyof typeof Ionicons.glyphMap;
    }[] = [
        {
            label: 'Events Attended',
            value: userInfo?.attendance?.toString() || '0',
            icon: 'checkmark-circle-outline'
        },
        {
            label: 'Upcoming Events',
            value: userInfo?.register?.toString() || '0',
            icon: 'calendar-outline'
        },
    ];


    // const pastEvents = [
    //     {
    //         id: 1,
    //         title: 'AI Summit 2024',
    //         date: '2024-03-10',
    //         category: 'Tech',
    //         rating: 5,
    //     },
    //     {
    //         id: 2,
    //         title: 'UX/UI Workshop',
    //         date: '2024-03-15',
    //         category: 'Design',
    //         rating: 4,
    //     },
    //     {
    //         id: 3,
    //         title: 'Networking Night',
    //         date: '2024-03-20',
    //         category: 'Social',
    //         rating: 5,
    //     },
    //     {
    //         id: 4,
    //         title: 'AI Summit 2024',
    //         date: '2024-03-10',
    //         category: 'Tech',
    //         rating: 5,
    //     },
    //     {
    //         id: 5,
    //         title: 'UX/UI Workshop',
    //         date: '2024-03-15',
    //         category: 'Design',
    //         rating: 4,
    //     },
    //     {
    //         id: 6,
    //         title: 'Networking Night',
    //         date: '2024-03-20',
    //         category: 'Social',
    //         rating: 5,
    //     },
    // ];

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

    const getUserInfo = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/users', {
                withCredentials: true
            });
            if (response.data.success){
                setUserInfo(response.data.user);
            }
        } catch (error) {
            console.error('Error fetching user info:', error);
            
        }
    }

    const [pastEvents, setPastEvents] = useState<Event[]>([]);

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
        getUserInfo();
        getPastEvents();
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
                    <TouchableOpacity
                        style={[styles.settingsButton, { backgroundColor: colors.lightGrey }]}
                        onPress={() => router.push('/settings')}
                    >
                        <Ionicons name="settings-outline" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.background }]}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[colors.green]}
                            tintColor={colors.green}
                        />
                    }
                >
                    <View style={[styles.profileSection, { borderBottomColor: colors.border }]}>
                        <View style={styles.profileImageContainer}>
                            {userInfo?.avatar ? (
                                <Image
                                    source={{ uri: userInfo.avatar }}
                                    style={{ width: 100, height: 100, borderRadius: 50 }}
                                />
                            ) : (
                                <Ionicons name="person-circle-outline" size={100} color={colors.greyText} />
                            )}
                        </View>
                        <Text style={[styles.username, { color: colors.text }]}>{userInfo?.fname} {userInfo?.lname}</Text>
                        <Text style={[styles.userHandle, { color: colors.greyText }]}>{userInfo?.role} {userInfo?.admin && userInfo?.role == 'student' ? '/ Club Manager' : ''}</Text>
                    </View>

                    <View style={[styles.statsSection, {
                        backgroundColor: colors.surface,
                        borderBottomColor: colors.border
                    }]}>
                        {stats.map((stat, index) => (
                            <View key={index} style={styles.statItem}>
                                <View style={[styles.statIconContainer, { backgroundColor: colors.lightGreen }]}>
                                    <Ionicons name={stat.icon} size={24} color={colors.green} />
                                </View>
                                <Text style={[styles.statValue, { color: colors.green }]}>{stat.value}</Text>
                                <Text style={[styles.statLabel, { color: colors.greyText }]}>{stat.label}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionTitleContainer}>
                                <Ionicons name="time" size={24} color={colors.green} />
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>Past Events</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.seeAllButton}
                                onPress={() => setShowAllPast(true)}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.seeAllText, { color: colors.green }]}>View History</Text>
                                <Ionicons name="chevron-forward" size={16} color={colors.green} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.pastEventsContainer}>
                            {pastEvents.slice(0, 4).map((event, index) => (
                                <Animated.View
                                    key={event.id}
                                    entering={FadeInDown.delay(index * 100)}
                                >
                                    <TouchableOpacity
                                        activeOpacity={0.85}
                                        onPress={() => handleEventPress(event)}
                                        style={styles.pastEventTouchable}
                                    >
                                        <Surface style={[styles.pastEventCard, {
                                            backgroundColor: colors.surface,
                                            borderColor: colors.border
                                        }]}>
                                            <View style={styles.pastEventInfo}>
                                                <View style={styles.pastEventContent}>
                                                    <Text style={[styles.pastEventTitle, { color: colors.text }]}>{event.title}</Text>
                                                    <View style={styles.pastEventDetails}>
                                                        <View style={styles.eventDetail}>
                                                            <Ionicons name="calendar-outline" size={14} color={colors.greyText} />
                                                            <Text style={[styles.pastEventDate, { color: colors.greyText }]}>{event.date}</Text>
                                                        </View>
                                                        <View style={[styles.categoryPill, { backgroundColor: `${getCategoryColor(event.category)}20` }]}>
                                                            <Text style={[styles.categoryPillText, { color: getCategoryColor(event.category) }]}>
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
                                <Ionicons name="bookmark" size={24} color={colors.green} />
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>Interests</Text>
                            </View>
                        </View>
                        <View style={styles.interestsContainer}>
                            {['Tech Events', 'Workshops', 'Networking', 'Conferences', 'Meetups'].map((interest, index) => (
                                <Animated.View
                                    key={index}
                                    entering={FadeInDown.delay(index * 50)}
                                >
                                    <View style={[styles.interestPill, { backgroundColor: colors.lightGreen }]}>
                                        <Text style={[styles.interestText, { color: colors.green }]}>{interest}</Text>
                                    </View>
                                </Animated.View>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            </View>
            <View style={[styles.navContainer, {
                backgroundColor: colors.surface,
                borderTopColor: colors.border
            }]}>
                <Nav />
            </View>

            {selectedEvent && renderEventDetails()}
            {showAllPast && renderEventList(pastEvents, () => setShowAllPast(false), 'Event History')}
        </View>
    );
};

const styles = StyleSheet.create({
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
        color: '#000000',
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
    navContainer: {
        width: '100%',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
    },
});

export default ProfileScreen;
