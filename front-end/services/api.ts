import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'https://europe-west1-playstore-e4a65.cloudfunctions.net/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});



export const auth = {
    login42: async () => {
        return api.get('/api/auth/42');
    },
    logout: async () => {
        await AsyncStorage.removeItem('userToken');
        return api.get('/api/auth/logout');
    },
};

export const events = {
    getAll: async () => {
        return api.get('/api/events');
    },
    getPastEvents: async () => {
        return api.get('/api/events/past');
    },
    getById: async (id: string) => {
        return api.get(`/api/events/${id}`);
    },
    register: async (eventId: string) => {
        return api.post(`/api/events/${eventId}/register`);
    },
    rate: async (eventId: string, rating: number, feedback: string) => {
        return api.post(`/api/events/${eventId}/rate`, { rating, feedback });
    },
};

export const users = {
    getCurrentUser: async () => {
        return api.get('/api/users');
    },
    getNotifications: async () => {
        return api.get('/api/users/notifications');
    },
};

export default api; 