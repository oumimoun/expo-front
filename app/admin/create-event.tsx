import EventForm, { EventFormData } from '@/components/EventForm';
import { API_URL } from '@/constants';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';

export default function CreateEventPage() {
    const router = useRouter();
    const { colors } = useTheme();
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

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setNewEvent(prev => ({ ...prev, date: selectedDate }));
        }
    };

    const handleTimeChange = (event: any, selectedTime?: Date) => {
        setShowTimePicker(false);
        if (selectedTime) {
            setNewEvent(prev => ({ ...prev, time: selectedTime }));
        }
    };

    const handleAddEvent = async () => {
        try {
            const eventData = {
                title: newEvent.title.trim(),
                date: newEvent.date.toISOString().split('T')[0],
                time: newEvent.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                location: newEvent.location.trim(),
                description: newEvent.description.trim(),
                maxAttendees: parseInt(newEvent.maxAttendees),
                categories: newEvent.categories,
                club: newEvent.club || 'OTHER'
            };

            const response = await axios.post(
                `${API_URL}/api/events`,
                eventData,
                { 
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );

            if (response.data && response.data.success) {
                router.back();
            } else {
                throw new Error('Operation did not complete successfully');
            }
        } catch (error: any) {
            console.error('Error creating event:', error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Create Event</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
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
                    handleAddEvent={handleAddEvent}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingTop: Platform.OS === 'ios' ? 60 : 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd'
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    formContainer: {
        flex: 1,
        marginTop: 20
    }
}); 