import ClubCard from '@/components/ClubCard';
import EventForm from '@/components/EventForm';
import Nav from '@/components/Nav';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Platform, ScrollView, StatusBar, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useTheme } from '../../contexts/ThemeContext';
import { useUser } from '../../contexts/UserContext';
import type { Club, ClubAdmin } from '../types/club';

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

interface Event {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
}

interface EventFormData {
    title: string;
    date: Date;
    time: Date;
    location: string;
    category: string;
    description: string;
    organizer: string;
    maxAttendees: string;
    club: string;
    isPrivate: boolean;
    invitedUsers: string[];
    link: string;
}



export default function AdminPage() {
    const { user, loading } = useUser();
    const router = useRouter();
    const { isDarkMode, colors } = useTheme();
    const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
    const [clubs, setClubs] = useState<Club[]>([
        {
            id: 'all',
            name: 'All Clubs',
            admins: [],
            eventCount: 0,
            color: '#000000'
        }
    ]);
    const [events, setEvents] = useState<Event[]>([]);
    const [loadingClubs, setLoadingClubs] = useState(true);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [showEventModal, setShowEventModal] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [newEvent, setNewEvent] = useState<EventFormData>({
        title: '',
        date: new Date(),
        time: new Date(),
        location: '',
        category: '',
        description: '',
        organizer: '',
        maxAttendees: '',
        club: '',
        isPrivate: false,
        invitedUsers: [],
        link: ''
    });
    const [formErrors, setFormErrors] = useState({
        title: false,
        location: false,
        maxAttendees: false
    });
    const scrollViewRef = useRef<ScrollView>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const [showAdminInput, setShowAdminInput] = useState(false);
    const [newAdminUsername, setNewAdminUsername] = useState('');
    const [adminInputError, setAdminInputError] = useState('');
    const slideUpAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        // Fade in animation when component mounts
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    useEffect(() => {
        // Center selected club in scroll view
        if (selectedClubId && scrollViewRef.current) {
            const selectedIndex = clubs.findIndex(club => club.id === selectedClubId);
            if (selectedIndex !== -1) {
                scrollViewRef.current.scrollTo({
                    x: selectedIndex * 216 - 80, // 200 (card width) + 16 (margin) - some offset
                    animated: true
                });
            }
        }
    }, [selectedClubId]);

    useEffect(() => {
        // Instead of fetching, we'll use our predefined clubs for now
        const mockClubs: Club[] = [
            {
                id: 'other',
                name: 'OTHER',
                admins: [],
                eventCount: 0,
                color: '#000000'
            },
            {
                id: 'appx',
                name: 'APPx',
                admins: [{ id: '1', name: 'Admin 1', avatar: '' }],
                eventCount: 3,
                //black green
                color: '#006400'
            },
            {
                id: 'akasec',
                name: 'Akasec',
                admins: [{ id: '2', name: 'Admin 2', avatar: '' }],
                eventCount: 2,
                // black red
                color: '#8b0000'
            },
            {
                id: 'leetna',
                name: 'LeetNa',
                admins: [{ id: '3', name: 'Admin 3', avatar: '' }],
                eventCount: 4,
                // orange
                color: '#ffa500'
            },
            {
                id: 'leetops',
                name: 'LeetOps',
                admins: [{ id: '4', name: 'Admin 4', avatar: '' }],
                eventCount: 1,
                // grey
                color: '#808080'
            },
            {
                id: '1337ai',
                name: '1337AI',
                admins: [{ id: '5', name: 'Admin 5', avatar: '' }],
                eventCount: 5,
                // green different green
                color: '#00ff61'
            },
            {
                id: 'laksport',
                name: 'LakSport',
                admins: [{ id: '6', name: 'Admin 6', avatar: '' }],
                eventCount: 2,
                // dark green
                color: '#008000'
            },
            {
                id: 'wedesign',
                name: 'Wedesign',
                admins: [{ id: '7', name: 'Admin 7', avatar: '' }],
                eventCount: 3,
                // orange pink
                color: '#ff69b4'
            }
        ];
        setClubs(mockClubs);
        setLoadingClubs(false);
        // Set the first club as default selected
        if (mockClubs.length > 0) {
            setSelectedClubId(mockClubs[0].id);
        }
    }, []);

    useEffect(() => {
        if (selectedClubId) {
            fetchClubEvents(selectedClubId);
        }
    }, [selectedClubId]);

    const fetchClubEvents = async (clubId: string) => {
        try {
            setLoadingEvents(true);
            // Mock events data for now
            const mockEvents: Event[] = [
                {
                    id: '1',
                    title: 'Sample Event 1',
                    date: '2024-03-20',
                    time: '14:00',
                    location: 'Main Hall'
                },
                {
                    id: '2',
                    title: 'Sample Event 2',
                    date: '2024-03-21',
                    time: '15:00',
                    location: 'Lab 1'
                }
            ];
            setEvents(mockEvents);
        } catch (error) {
            console.error('Failed to fetch club events:', error);
        } finally {
            setLoadingEvents(false);
        }
    };

    const handleAddAdmin = async (clubId: string) => {
        if (!newAdminUsername.trim()) {
            setAdminInputError('Username is required');
            return;
        }
        // TODO: Implement add admin API call
        console.log('Adding admin:', newAdminUsername, 'to club:', clubId);
        setNewAdminUsername('');
        setShowAdminInput(false);
        setAdminInputError('');
    };

    const handleRemoveAdmin = async (clubId: string, adminId: string) => {
        // TODO: Implement remove admin API call
        console.log('Removing admin:', adminId, 'from club:', clubId);
    };

    const toggleAdminInput = () => {
        setShowAdminInput(!showAdminInput);
        Animated.spring(slideUpAnim, {
            toValue: showAdminInput ? 50 : 0,
            useNativeDriver: true,
        }).start();
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setNewEvent({ ...newEvent, date: selectedDate });
        }
    };

    const handleTimeChange = (event: any, selectedTime?: Date) => {
        setShowTimePicker(false);
        if (selectedTime) {
            setNewEvent({ ...newEvent, time: selectedTime });
        }
    };

    const handleAddEvent = () => {
        setShowEventModal(true);
    };

    const handleCreateEvent = () => {
        // Validate form
        const errors = {
            title: !newEvent.title,
            location: !newEvent.location,
            maxAttendees: !newEvent.maxAttendees || parseInt(newEvent.maxAttendees) <= 0
        };

        if (Object.values(errors).some(error => error)) {
            setFormErrors(errors);
            return;
        }

        // TODO: Add event creation logic here

        // Reset form and close modal
        setNewEvent({
            title: '',
            date: new Date(),
            time: new Date(),
            location: '',
            category: '',
            description: '',
            organizer: '',
            maxAttendees: '',
            club: '',
            isPrivate: false,
            invitedUsers: [],
            link: ''
        });
        setShowEventModal(false);
    };

    if (loading) {
        return (
            <View style={[styles.mainContainer, styles.centerContent]}>
                <Animated.View style={{ opacity: fadeAnim }}>
                    <Ionicons name="sync" size={40} color={colors.green} />
                </Animated.View>
            </View>
        );
    }

    if (!user?.clubManager || user.clubManager === 'none') {
        return (
            <View style={[styles.mainContainer, styles.centerContent]}>
                <Animated.View style={{
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                }}>
                    <Ionicons name="shield-outline" size={60} color={colors.red} />
                    <Text style={[styles.sectionTitle, { color: colors.red }]}>Unauthorized Access</Text>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.push('/home')}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.green} />
                        <Text style={[styles.backButtonText, { color: colors.green }]}>
                            Return to Home
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        );
    }

    const selectedClub = clubs.find(club => club.id === selectedClubId);

    return (
        <View style={[styles.mainContainer, { backgroundColor: COLORS.background }]}>
            <StatusBar
                barStyle={isDarkMode ? "light-content" : "dark-content"}
                backgroundColor={colors.background}
                translucent={true}
            />

            <View style={styles.header}>
                <Text style={styles.title}>Admin</Text>
                <TouchableOpacity
                    style={[styles.iconButton, { backgroundColor: colors.green }]}
                    onPress={handleAddEvent}
                >
                    <Ionicons name="add-circle" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <ScrollView
                    ref={scrollViewRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.clubsScroll}
                    contentContainerStyle={styles.clubsScrollContent}
                    decelerationRate="fast"
                    snapToInterval={216}
                    snapToAlignment="center"
                >
                    {clubs.map(club => (
                        <ClubCard
                            key={club.id}
                            club={club}
                            isSelected={club.id === selectedClubId}
                            onSelect={setSelectedClubId}
                        />
                    ))}
                </ScrollView>

                <ScrollView
                    style={styles.detailsContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {selectedClub && !['all'].includes(selectedClub.id) && (
                        <Animated.View
                            style={[
                                styles.detailsSection,
                                {
                                    opacity: fadeAnim,
                                    transform: [{ translateY: slideAnim }]
                                }
                            ]}
                        >
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>
                                    <Text>
                                        <Ionicons name="people" size={18} color={COLORS.text} />
                                        {' Club Management'}
                                    </Text>
                                </Text>
                                {selectedClub?.id !== 'other' && (
                                    <TouchableOpacity
                                        style={[styles.iconButton, { backgroundColor: colors.green }]}
                                        onPress={toggleAdminInput}
                                    >
                                        <Ionicons
                                            name={showAdminInput ? "close" : "person-add"}
                                            size={18}
                                            color="#fff"
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>

                            <Animated.View
                                style={[
                                    styles.adminInputContainer,
                                    {
                                        height: showAdminInput ? 'auto' : 0,
                                        opacity: showAdminInput ? 1 : 0,
                                        transform: [{ translateY: slideUpAnim }],
                                        margin: showAdminInput ? undefined : 0,
                                        padding: showAdminInput ? 12 : 0,
                                        overflow: 'hidden'
                                    }
                                ]}
                            >
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={[
                                            styles.adminInput,
                                            adminInputError && styles.inputError
                                        ]}
                                        placeholder="Enter username"
                                        value={newAdminUsername}
                                        onChangeText={(text) => {
                                            setNewAdminUsername(text);
                                            setAdminInputError('');
                                        }}
                                    />
                                    <TouchableOpacity
                                        style={[styles.addButton, { backgroundColor: colors.green }]}
                                        onPress={() => handleAddAdmin(selectedClub.id)}
                                    >
                                        <Ionicons name="checkmark" size={18} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                                {adminInputError && (
                                    <Text style={styles.errorText}>{adminInputError}</Text>
                                )}
                            </Animated.View>

                            {selectedClub.admins.length > 0 && (
                                <ScrollView style={styles.adminsList}>
                                    {selectedClub.admins.map((admin: ClubAdmin) => (
                                        <Animated.View
                                            key={admin.id}
                                            style={styles.adminCard}
                                        >
                                            <View style={styles.adminInfo}>
                                                <View style={styles.avatarContainer}>
                                                    <Ionicons name="person" size={20} color={colors.green} />
                                                </View>
                                                <Text style={styles.adminName}>{admin.name}</Text>
                                            </View>
                                            <TouchableOpacity
                                                style={styles.deleteButton}
                                                onPress={() => handleRemoveAdmin(selectedClub.id, admin.id)}
                                            >
                                                <Ionicons name="trash-outline" size={20} color={COLORS.red} />
                                            </TouchableOpacity>
                                        </Animated.View>
                                    ))}
                                </ScrollView>
                            )}

                            <View style={styles.eventsSection}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>
                                        <Text>
                                            <Ionicons name="calendar" size={20} color={COLORS.text} />
                                            {' Events'}
                                        </Text>
                                    </Text>
                                </View>

                                {loadingEvents ? (
                                    <View style={styles.centerContent}>
                                        <Ionicons name="sync" size={24} color={colors.green} />
                                    </View>
                                ) : events.length === 0 ? (
                                    <View style={styles.emptyState}>
                                        <Ionicons name="calendar-outline" size={40} color={COLORS.greyText} />
                                        <Text style={styles.emptyText}>No events yet</Text>
                                        <TouchableOpacity
                                            style={[styles.addButton, { backgroundColor: colors.green }]}
                                            onPress={handleAddEvent}
                                        >
                                            <Ionicons name="add" size={20} color="#fff" />
                                            <Text style={styles.buttonText}>Create Event</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View style={styles.eventsSection}>
                                        {events.map(event => (
                                            <TouchableOpacity
                                                key={event.id}
                                                style={styles.eventCard}
                                                onPress={() => router.push(`/event/${event.id}`)}
                                            >
                                                <View style={styles.eventInfo}>
                                                    <Text style={styles.eventTitle}>{event.title}</Text>
                                                    <View style={styles.eventMetaInfo}>
                                                        <Ionicons name="time-outline" size={16} color={COLORS.greyText} />
                                                        <Text style={styles.eventDetails}>
                                                            {event.date} at {event.time}
                                                        </Text>
                                                        <Ionicons name="location-outline" size={16} color={COLORS.greyText} />
                                                        <Text style={styles.eventDetails}>
                                                            {event.location}
                                                        </Text>
                                                    </View>
                                                </View>
                                                <Ionicons name="chevron-forward" size={20} color={COLORS.greyText} />
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>
                        </Animated.View>
                    )}
                </ScrollView>
            </View>

            <View style={[styles.navContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                <Nav />
            </View>

            <Modal
                visible={showEventModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowEventModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.sectionTitle}>Create Event</Text>
                            <TouchableOpacity
                                onPress={() => setShowEventModal(false)}
                                style={styles.iconButton}
                            >
                                <Ionicons name="close" size={24} color={COLORS.greyText} />
                            </TouchableOpacity>
                        </View>
                        <EventForm
                            newEvent={newEvent}
                            setNewEvent={setNewEvent}
                            formErrors={formErrors}
                            setFormErrors={setFormErrors}
                            showDatePicker={showDatePicker}
                            setShowDatePicker={setShowDatePicker}
                            showTimePicker={showTimePicker}
                            setShowTimePicker={setShowTimePicker}
                            handleDateChange={handleDateChange}
                            handleTimeChange={handleTimeChange}
                            handleAddEvent={handleCreateEvent}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
} 



const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: COLORS.card,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        zIndex: 1,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    clubsScroll: {
        maxHeight: 160, // Fixed height for club cards section
        backgroundColor: COLORS.background,
        paddingVertical: 12,
    },
    clubsScrollContent: {
        paddingHorizontal: 20,
    },
    detailsContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    detailsSection: {
        backgroundColor: COLORS.card,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 16,
        paddingTop: 20,
        marginHorizontal: 12,
        marginTop: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        minHeight: '100%',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        flexDirection: 'row',
        alignItems: 'center',
    },
    adminInputContainer: {
        marginBottom: 20,
        overflow: 'hidden',
        backgroundColor: COLORS.background,
        borderRadius: 12,
        padding: 12,
    },
    inputWrapper: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    adminInput: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingVertical: 8,
        paddingLeft: 8,
        paddingRight: 16,
        fontSize: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    inputError: {
        borderColor: COLORS.red,
    },
    errorText: {
        color: COLORS.red,
        fontSize: 12,
        marginTop: 4,
    },
    adminsList: {
        backgroundColor: COLORS.background,
        borderRadius: 12,
        padding: 12,
        marginBottom: 20,
    },
    adminCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 10,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    adminInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    avatarContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(58, 123, 213, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    adminName: {
        fontSize: 14,
        color: COLORS.text,
        fontWeight: '500',
    },
    deleteButton: {
        padding: 6,
        borderRadius: 6,
        backgroundColor: 'rgba(220, 53, 69, 0.1)',
    },
    eventsSection: {
        backgroundColor: COLORS.background,
        borderRadius: 12,
        padding: 12,
    },
    eventCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    eventInfo: {
        flex: 1,
    },
    eventTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 4,
    },
    eventMetaInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    eventDetails: {
        fontSize: 12,
        color: COLORS.greyText,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyState: {
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginTop: 8,
    },
    emptyText: {
        fontSize: 14,
        color: COLORS.greyText,
        marginVertical: 8,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 16,
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    navContainer: {
        width: '100%',
        borderTopWidth: 1,
        paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 20,
    },
    modalContent: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 20,
        width: '100%',
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
});