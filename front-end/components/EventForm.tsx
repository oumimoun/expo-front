import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';

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

// Available categories
const CATEGORIES = [
    { id: '1', name: 'Other', color: '#28a745', icon: 'calendar-outline' as const },
    { id: '2', name: 'Tech', color: '#3a7bd5', icon: 'laptop-outline' as const },
    { id: '3', name: 'Design', color: '#c471f5', icon: 'color-palette-outline' as const },
    { id: '4', name: 'Social', color: '#FF8C42', icon: 'people-outline' as const },
    { id: '5', name: 'Business', color: '#4CAF50', icon: 'briefcase-outline' as const },
    { id: '6', name: 'Workshop', color: '#9C27B0', icon: 'construct-outline' as const },
];

// Available clubs
const CLUBS = [
    { id: 'other', name: 'OTHER', color: '#000000' },
    { id: 'appx', name: 'APPx', color: '#006400' },
    { id: 'akasec', name: 'Akasec', color: '#8b0000' },
    { id: 'leetna', name: 'LeetNa', color: '#ffa500' },
    { id: 'leetops', name: 'LeetOps', color: '#808080' },
    { id: '1337ai', name: '1337AI', color: '#00ff61' },
    { id: 'laksport', name: 'LakSport', color: '#008000' },
    { id: 'wedesign', name: 'Wedesign', color: '#ff69b4' }
];

export interface EventFormData {
    title: string;
    date: Date;
    time: Date;
    location: string;
    categories: string[];
    description: string;
    maxAttendees: string;
    club: string;
}

export interface FormErrors {
    title: boolean;
    location: boolean;
    maxAttendees: boolean;
}

interface EventFormProps {
    newEvent: EventFormData;
    setNewEvent: React.Dispatch<React.SetStateAction<EventFormData>>;
    formErrors: FormErrors;
    setFormErrors: (errors: FormErrors) => void;
    showDatePicker: boolean;
    setShowDatePicker: (show: boolean) => void;
    showTimePicker: boolean;
    setShowTimePicker: (show: boolean) => void;
    handleDateChange: (event: any, selectedDate?: Date) => void;
    handleTimeChange: (event: any, selectedTime?: Date) => void;
    handleAddEvent: () => void;
}

const EventForm: React.FC<EventFormProps> = ({
    newEvent,
    setNewEvent,
    formErrors,
    setFormErrors,
    showDatePicker,
    setShowDatePicker,
    showTimePicker,
    setShowTimePicker,
    handleDateChange,
    handleTimeChange,
    handleAddEvent
}) => {
    const { colors } = useTheme();
    const { user } = useUser();

    // Set club automatically for club admin
    useEffect(() => {
        if (user?.clubManager && user.clubManager !== 'none') {
            const club = CLUBS.find(c => c.id === user.clubManager.toLowerCase());
            if (club) {
                setNewEvent(prev => ({
                    ...prev,
                    club: club.name
                }));
            }
        }
    }, [user?.clubManager]);

    const toggleCategory = (categoryName: string) => {
        setNewEvent((prev: EventFormData) => {
            const categories = prev.categories || [];
            if (categories.includes(categoryName)) {
                return { ...prev, categories: categories.filter((c: string) => c !== categoryName) };
            } else {
                return { ...prev, categories: [...categories, categoryName] };
            }
        });
    };

    const toggleClub = (clubName: string) => {
        setNewEvent((prev: EventFormData) => ({
            ...prev,
            club: prev.club === clubName ? '' : clubName
        }));
    };

    return (
        <>
            <ScrollView style={styles.scrollView}>
                <View style={styles.formContainer}>
                    {/* Title */}
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Event Title *</Text>
                        <TextInput
                            style={[styles.formInput, formErrors.title && styles.formInputError]}
                            value={newEvent.title}
                            onChangeText={(text) => {
                                setNewEvent({ ...newEvent, title: text });
                                setFormErrors({ ...formErrors, title: false });
                            }}
                            placeholder="Enter event title"
                        />
                        {formErrors.title && (
                            <Text style={styles.errorText}>Title is required</Text>
                        )}
                    </View>

                    {/* Date and Time */}
                    <View style={styles.formRow}>
                        <TouchableOpacity
                            style={styles.dateTimeButton}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Ionicons name="calendar-outline" size={22} color={COLORS.primary} />
                            <Text>{newEvent.date.toLocaleDateString()}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.dateTimeButton}
                            onPress={() => setShowTimePicker(true)}
                        >
                            <Ionicons name="time-outline" size={22} color={COLORS.primary} />
                            <Text>
                                {newEvent.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Location */}
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Location *</Text>
                        <TextInput
                            style={[styles.formInput, formErrors.location && styles.formInputError]}
                            value={newEvent.location}
                            onChangeText={(text) => {
                                setNewEvent({ ...newEvent, location: text });
                                setFormErrors({ ...formErrors, location: false });
                            }}
                            placeholder="Enter event location"
                        />
                        {formErrors.location && (
                            <Text style={styles.errorText}>Location is required</Text>
                        )}
                    </View>

                    {/* Categories */}
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Categories</Text>
                        <View style={styles.tagsContainer}>
                            {CATEGORIES.map((category) => (
                                <TouchableOpacity
                                    key={category.id}
                                    style={[
                                        styles.tag,
                                        { backgroundColor: category.color + '20' },
                                        newEvent.categories?.includes(category.name) && styles.selectedTag
                                    ]}
                                    onPress={() => toggleCategory(category.name)}
                                >
                                    <Ionicons
                                        name={category.icon}
                                        size={16}
                                        color={newEvent.categories?.includes(category.name) ? '#fff' : category.color}
                                    />
                                    <Text style={[
                                        styles.tagText,
                                        { color: newEvent.categories?.includes(category.name) ? '#fff' : category.color }
                                    ]}>
                                        {category.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Description */}
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Description</Text>
                        <TextInput
                            style={[styles.formInput, styles.textArea]}
                            value={newEvent.description}
                            onChangeText={(text) => setNewEvent({ ...newEvent, description: text })}
                            placeholder="Enter event description"
                            multiline
                            numberOfLines={4}
                        />
                    </View>

                    {/* Max Attendees */}
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Max Attendees *</Text>
                        <TextInput
                            style={[styles.formInput, formErrors.maxAttendees && styles.formInputError]}
                            value={newEvent.maxAttendees}
                            onChangeText={(text) => {
                                setNewEvent({ ...newEvent, maxAttendees: text });
                                setFormErrors({ ...formErrors, maxAttendees: false });
                            }}
                            placeholder="Enter maximum number of attendees"
                            keyboardType="numeric"
                        />
                        {formErrors.maxAttendees && (
                            <Text style={styles.errorText}>Please enter a valid number greater than 0</Text>
                        )}
                    </View>

                    {/* Club Selection - Only show for staff */}
                    {user?.role === 'staff' && (
                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Club</Text>
                            <View style={styles.tagsContainer}>
                                {CLUBS.map((club) => (
                                    <TouchableOpacity
                                        key={club.id}
                                        style={[
                                            styles.tag,
                                            { backgroundColor: club.color + '20' },
                                            newEvent.club === club.name && [styles.selectedTag, { backgroundColor: club.color }]
                                        ]}
                                        onPress={() => toggleClub(club.name)}
                                    >
                                        <View style={[styles.clubDot, { backgroundColor: club.color }]} />
                                        <Text style={[
                                            styles.tagText,
                                            { color: newEvent.club === club.name ? '#fff' : club.color }
                                        ]}>
                                            {club.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Show selected club for club admin */}
                    {user?.clubManager && user.clubManager !== 'none' && user.role !== 'staff' && (
                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Club</Text>
                            <View style={styles.selectedClubContainer}>
                                {CLUBS.map((club) => {
                                    if (club.id === user.clubManager.toLowerCase()) {
                                        return (
                                            <View
                                                key={club.id}
                                                style={[
                                                    styles.tag,
                                                    { backgroundColor: club.color }
                                                ]}
                                            >
                                                <View style={[styles.clubDot, { backgroundColor: '#fff' }]} />
                                                <Text style={[styles.tagText, { color: '#fff' }]}>
                                                    {club.name}
                                                </Text>
                                            </View>
                                        );
                                    }
                                    return null;
                                })}
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>

            <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.green }]}
                onPress={handleAddEvent}
            >
                <Text style={styles.submitButtonText}>Create Event</Text>
                <Ionicons name="arrow-forward" size={24} color="#fff" />
            </TouchableOpacity>

            {showDatePicker && (
                <DateTimePicker
                    value={newEvent.date}
                    mode="date"
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                />
            )}

            {showTimePicker && (
                <DateTimePicker
                    value={newEvent.time}
                    mode="time"
                    onChange={handleTimeChange}
                />
            )}
        </>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        maxHeight: '85%',
    },
    formContainer: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
        marginHorizontal: 20,
        marginVertical: 10,
    },
    formGroup: {
        marginBottom: 20,
    },
    formLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: COLORS.text,
    },
    formInput: {
        backgroundColor: COLORS.background,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        color: COLORS.text,
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    formInputError: {
        borderColor: COLORS.red,
    },
    formRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    dateTimeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: COLORS.background,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    errorText: {
        fontSize: 14,
        color: COLORS.red,
        marginTop: 4,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 8,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 20,
        gap: 4,
    },
    selectedTag: {
        backgroundColor: COLORS.primary,
    },
    tagText: {
        fontSize: 14,
        fontWeight: '500',
    },
    clubDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    selectedClubContainer: {
        flexDirection: 'row',
        marginTop: 8,
    }
});

export default EventForm; 