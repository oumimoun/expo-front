import { API_URL } from '@/constants';
import axios from 'axios';
import { Alert } from 'react-native';

export interface EventFormData {
    title: string;
    date: Date;
    time: Date;
    location: string;
    description: string;
    maxAttendees: string;
}

export interface FormErrors {
    title: boolean;
    location: boolean;
    maxAttendees: boolean;
}

class EventService {
    static async createEvent(eventData: EventFormData) {
        try {
            const formattedData = {
                ...eventData,
                date: eventData.date.toISOString().split('T')[0],
                time: eventData.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                maxAttendees: parseInt(eventData.maxAttendees)
            };

            const response = await axios.post(
                `${API_URL}/api/events`,
                formattedData,
                { withCredentials: true }
            );
            Alert.alert('Success', 'Event created successfully');

            return response.data;
        } catch (error: any) {
            Alert.alert('Error', `Failed to create event: ${error.response?.data?.message || error.message}`);
            throw error;
        }
    }

    static async getAllEvents() {
        try {
            const response = await axios.get(
                `${API_URL}/api/events`,
                { withCredentials: true }
            );

            return response.data;
        } catch (error: any) {
            Alert.alert('Error', 'Failed to fetch events');
            throw error;
        }
    }

    static validateEventForm(eventData: EventFormData): FormErrors {
        const errors = {
            title: !eventData.title.trim(),
            location: !eventData.location.trim(),
            maxAttendees: !eventData.maxAttendees || parseInt(eventData.maxAttendees) <= 0
        };
        
        if (Object.values(errors).some(error => error)) {
            Alert.alert('Validation Error', 'Please fill in all required fields correctly');
        }
        return errors;
    }
}

export default EventService; 