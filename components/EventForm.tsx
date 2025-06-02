import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Switch, TextInput, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useTheme } from '../contexts/ThemeContext';

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
    { id: '1', name: 'All Events', color: '#28a745', icon: 'calendar-outline' as const },
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
    category: string;
    description: string;
    organizer: string;
    maxAttendees: string;
    club: string;
    isPrivate: boolean;
    invitedUsers: string[];
    link: string;
}

export interface FormErrors {
    title: boolean;
    location: boolean;
    maxAttendees: boolean;
}

interface EventFormProps {
    newEvent: EventFormData;
    setNewEvent: (event: EventFormData) => void;
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
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showClubModal, setShowClubModal] = useState(false);

    const CategoryModal = () => (
        <Modal
            visible={showCategoryModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowCategoryModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Select Category</Text>
                    <ScrollView>
                        {CATEGORIES.map((category) => (
                            <TouchableOpacity
                                key={category.id}
                                style={[
                                    styles.modalItem,
                                    newEvent.category === category.name && styles.selectedItem
                                ]}
                                onPress={() => {
                                    setNewEvent({ ...newEvent, category: category.name });
                                    setShowCategoryModal(false);
                                }}
                            >
                                <Ionicons name={category.icon} size={24} color={category.color} />
                                <Text style={styles.modalItemText}>{category.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setShowCategoryModal(false)}
                    >
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    const ClubModal = () => (
        <Modal
            visible={showClubModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowClubModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Select Club</Text>
                    <ScrollView>
                        {CLUBS.map((club) => (
                            <TouchableOpacity
                                key={club.id}
                                style={[
                                    styles.modalItem,
                                    newEvent.club === club.name && styles.selectedItem
                                ]}
                                onPress={() => {
                                    setNewEvent({ ...newEvent, club: club.name });
                                    setShowClubModal(false);
                                }}
                            >
                                <View style={[styles.clubColor, { backgroundColor: club.color }]} />
                                <Text style={styles.modalItemText}>{club.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setShowClubModal(false)}
                    >
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    return (
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

                {/* Category Selector */}
                <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Category</Text>
                    <TouchableOpacity
                        style={styles.formInput}
                        onPress={() => setShowCategoryModal(true)}
                    >
                        <Text style={newEvent.category ? styles.selectedText : styles.placeholderText}>
                            {newEvent.category || "Select a category"}
                        </Text>
                    </TouchableOpacity>
                    <CategoryModal />
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

                {/* Organizer */}
                <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Organizer</Text>
                    <TextInput
                        style={styles.formInput}
                        value={newEvent.organizer}
                        onChangeText={(text) => setNewEvent({ ...newEvent, organizer: text })}
                        placeholder="Enter organizer name"
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

                {/* Club Selector */}
                <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Club</Text>
                    <TouchableOpacity
                        style={styles.formInput}
                        onPress={() => setShowClubModal(true)}
                    >
                        <Text style={newEvent.club ? styles.selectedText : styles.placeholderText}>
                            {newEvent.club || "Select a club"}
                        </Text>
                    </TouchableOpacity>
                    <ClubModal />
                </View>

                {/* Private Event Toggle */}
                <View style={styles.formGroup}>
                    <View style={styles.switchContainer}>
                        <Text style={styles.formLabel}>Private Event</Text>
                        <Switch
                            value={newEvent.isPrivate}
                            onValueChange={(value) => setNewEvent({ ...newEvent, isPrivate: value })}
                            trackColor={{ false: '#767577', true: COLORS.primary }}
                            thumbColor={newEvent.isPrivate ? '#fff' : '#f4f3f4'}
                        />
                    </View>
                </View>

                {/* Invited Users */}
                {newEvent.isPrivate && (
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Invited Users</Text>
                        <TextInput
                            style={[styles.formInput, styles.textArea]}
                            value={newEvent.invitedUsers.join(', ')}
                            onChangeText={(text) => {
                                const users = text.split(',').map(user => user.trim()).filter(Boolean);
                                setNewEvent({ ...newEvent, invitedUsers: users });
                            }}
                            placeholder="Enter usernames separated by commas"
                            multiline
                            numberOfLines={3}
                        />
                    </View>
                )}

                {/* Event Link */}
                <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Event Link</Text>
                    <TextInput
                        style={styles.formInput}
                        value={newEvent.link}
                        onChangeText={(text) => setNewEvent({ ...newEvent, link: text })}
                        placeholder="Enter event link (optional)"
                    />
                </View>

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
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        maxHeight: '80%',
    },
    formContainer: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 20,
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
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
        marginTop: 12,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.card,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    modalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        gap: 10,
    },
    selectedItem: {
        backgroundColor: COLORS.background,
    },
    modalItemText: {
        fontSize: 16,
        color: COLORS.text,
    },
    closeButton: {
        marginTop: 15,
        padding: 15,
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    clubColor: {
        width: 24,
        height: 24,
        borderRadius: 12,
    },
    selectedText: {
        color: COLORS.text,
        fontSize: 16,
    },
    placeholderText: {
        color: COLORS.greyText,
        fontSize: 16,
    },
});

export default EventForm; 