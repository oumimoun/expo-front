import ClubCard from '@/components/ClubCard';
import EventForm, { EventFormData } from '@/components/EventForm';
import Nav from '@/components/Nav';
import { API_URL } from '@/constants';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Modal, Platform, ScrollView, StatusBar, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useTheme } from '../../contexts/ThemeContext';
import { useUser } from '../../contexts/UserContext';
import type { ClubAdmin } from '../types/club';

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

interface ExtendedClub {
    name: string;
    managers: string[];
    managerCount: number;
    eventCount: number;
    events: Event[];
}

export default function AdminPage() {
    const { user, loading } = useUser();
    const router = useRouter();
    const { isDarkMode, colors } = useTheme();
    const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
    const [clubs, setClubs] = useState<ExtendedClub[]>([]);
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
        categories: [],
        description: '',
        maxAttendees: '',
        club: ''
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

    // Add debug function
    const debugLog = (message: string, data?: any) => {
        console.log(message, data);
        if (__DEV__) {
            Alert.alert(
                'Debug Info',
                `${message}\n${data ? JSON.stringify(data, null, 2) : ''}`,
                [{ text: 'OK' }]
            );
        }
    };

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
        // Initial clubs structure with empty admins
        const initialClubs: ExtendedClub[] = [
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
                admins: [],
                eventCount: 0,
                color: '#006400'
            },
            {
                id: 'akasec',
                name: 'Akasec',
                admins: [],
                eventCount: 0,
                color: '#8b0000'
            },
            {
                id: 'leetna',
                name: 'LeetNa',
                admins: [],
                eventCount: 0,
                color: '#ffa500'
            },
            {
                id: 'leetops',
                name: 'LeetOps',
                admins: [],
                eventCount: 0,
                color: '#808080'
            },
            {
                id: '1337ai',
                name: '1337AI',
                admins: [],
                eventCount: 0,
                color: '#00ff61'
            },
            {
                id: 'laksport',
                name: 'LakSport',
                admins: [],
                eventCount: 0,
                color: '#008000'
            },
            {
                id: 'wedesign',
                name: 'Wedesign',
                admins: [],
                eventCount: 0,
                color: '#ff69b4'
            }
        ];

        let filteredClubs: ExtendedClub[] = [];

        if (!user) {
            filteredClubs = [];
        } else if (user.role === 'staff') {
            filteredClubs = initialClubs;
        } else if (user.clubManager && user.clubManager !== 'none') {
            filteredClubs = initialClubs.filter(club =>
                club.id.toLowerCase() === user.clubManager.toLowerCase()
            );
        }

        setClubs(filteredClubs);
        setLoadingClubs(false);

        // Set the selected club
        if (filteredClubs.length > 0 && user) {
            if (user.clubManager && user.clubManager !== 'none') {
                const clubId = user.clubManager.toLowerCase();
                setSelectedClubId(clubId);
            } else {
                setSelectedClubId(filteredClubs[0].id);
            }
        }
    }, [user]);

    useEffect(() => {
        if (selectedClubId) {
            fetchClubInfo(selectedClubId);
        }
    }, [selectedClubId]);

    const fetchClubInfo = async (clubId: string) => {
        try {
            setLoadingClubs(true);
            const response = await axios.post(`${API_URL}/api/admin/getClubInfo`, {
                clubName: clubId
            }, {
                withCredentials: true
            });

            if (response.data.success) {
                const clubInfo = response.data.clubInfo;
                debugLog('Club info:', clubInfo);

                setClubs(prevClubs =>
                    prevClubs.map(club =>
                        club.name === clubId ? clubInfo : club
                    )
                );
                setEvents(clubInfo.events || []);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error: any) {
            debugLog('Error details:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                stack: error.stack
            });

            Alert.alert(
                'Error',
                'Failed to fetch club information. Please try again later.',
                [{ text: 'OK' }]
            );
        } finally {
            setLoadingClubs(false);
        }
    };

    const handleAddAdmin = async (clubId: string) => {
        if (!newAdminUsername.trim()) {
            setAdminInputError('Username is required');
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/addClubManager`, {
                username: newAdminUsername,
                club: clubId
            }, {
                withCredentials: true
            });

            if (response.data.success) {
                // Refresh club info
                await fetchClubInfo(clubId);
                setNewAdminUsername('');
                setShowAdminInput(false);
                setAdminInputError('');
                Alert.alert('Success', 'Club manager added successfully');
            }
        } catch (error) {
            console.error('Error adding club manager:', error);
            setAdminInputError('Failed to add club manager');
        }
    };

    const handleRemoveAdmin = async (clubId: string, username: string) => {
        try {
            const response = await axios.post(`${API_URL}/removeClubManager`, {
                username
            }, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (response.data.success) {
                // Refresh club info
                await fetchClubInfo(clubId);
                Alert.alert('Success', 'Club manager removed successfully');
            }
        } catch (error) {
            console.error('Error removing club manager:', error);
            Alert.alert('Error', 'Failed to remove club manager');
        }
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
            categories: [],
            description: '',
            maxAttendees: '',
            club: ''
        });
        setShowEventModal(false);
    };

    const renderAdminCard = (admin: ExtendedClubAdmin, clubId: string) => {
        const isCurrentUser = user?.email === admin.email;

        return (
            <Animated.View
                key={admin.id}
                style={[
                    styles.adminCard,
                    isCurrentUser && styles.currentUserAdminCard
                ]}
            >
                <View style={styles.adminInfo}>
                    <View style={[
                        styles.avatarContainer,
                        isCurrentUser && { backgroundColor: 'rgba(40, 167, 69, 0.2)' }
                    ]}>
                        <Ionicons
                            name="person"
                            size={20}
                            color={isCurrentUser ? COLORS.success : COLORS.primary}
                        />
                    </View>
                    <View>
                        <Text style={[
                            styles.adminName,
                            isCurrentUser && { color: COLORS.success }
                        ]}>
                            {admin.name}
                            {isCurrentUser && ' (You)'}
                        </Text>
                        <Text style={styles.adminEmail}>{admin.email}</Text>
                    </View>
                </View>
                {/* Only show delete button for staff and not for current user */}
                {user?.role === 'staff' && !isCurrentUser && clubId !== 'other' && (
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleRemoveAdmin(clubId, admin.id)}
                    >
                        <Ionicons name="trash-outline" size={20} color={COLORS.red} />
                    </TouchableOpacity>
                )}
            </Animated.View>
        );
    };

    const fetchEvents = async (clubId: string) => {
        try {
            setLoadingEvents(true);
            const response = await axios.get(`${API_URL}/api/events`, {
                withCredentials: true
            });
            // debugLog('Events:', response.data);
            if (response.data.success) {
                // Filter events for the selected club
                const clubEvents = response.data.events.filter((event: any) =>
                    event.club?.toLowerCase() === clubId.toLowerCase()
                );
                setEvents(clubEvents);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoadingEvents(false);
        }
    };

    useEffect(() => {
        if (selectedClubId) {
            fetchEvents(selectedClubId);
        }
    }, [selectedClubId]);

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
                                {user?.role === 'staff' && selectedClub?.id !== 'other' && (
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

                            {user?.role === 'staff' && showAdminInput && (
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
                            )}

                            {selectedClub.admins.length > 0 && (
                                <ScrollView style={styles.adminsList}>
                                    {selectedClub.admins.map((admin: ExtendedClubAdmin) =>
                                        renderAdminCard(admin, selectedClub.id)
                                    )}
                                </ScrollView>
                            )}

                            {selectedClub.admins.length === 0 && (
                                <View style={styles.emptyState}>
                                    <Ionicons name="people-outline" size={40} color={COLORS.greyText} />
                                    <Text style={styles.emptyText}>No admins yet</Text>
                                    {user?.role === 'staff' && (
                                        <TouchableOpacity
                                            style={[styles.addButton, { backgroundColor: colors.green }]}
                                            onPress={toggleAdminInput}
                                        >
                                            <Ionicons name="person-add" size={20} color="#fff" />
                                            <Text style={styles.buttonText}>Add Admin</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
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
        maxHeight: 160,
        backgroundColor: COLORS.background,
        paddingVertical: 12,
    },
    clubsScrollContent: {
        paddingHorizontal: 20,
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    currentUserAdminCard: {
        borderColor: COLORS.success,
        backgroundColor: 'rgba(40, 167, 69, 0.05)',
    },
    adminInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    avatarContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(58, 123, 213, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    adminName: {
        fontSize: 14,
        color: COLORS.text,
        fontWeight: '600',
    },
    adminEmail: {
        fontSize: 12,
        color: COLORS.greyText,
        marginTop: 2,
    },
    deleteButton: {
        padding: 8,
        borderRadius: 8,
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