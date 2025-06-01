import axios from 'axios';
import { User } from '../contexts/UserContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

interface ApiResponse {
    success: boolean;
    user: User;
}

export const auth = {
    getCurrentUser: async (): Promise<User | null> => {
        try {
            const response = await axios.get<ApiResponse>(`${API_URL}/users`, {
                withCredentials: true
            });
            return response.data.user;
        } catch (error) {
            return null;
        }
    },

    login42: async (): Promise<void> => {
        try {
            // Redirect to 42 OAuth, the backend will handle setting cookies and redirecting to /home
            window.location.href = `${API_URL}/auth/42`;
        } catch (error) {
            console.error('Error during 42 login:', error);
            throw error;
        }
    },

    logout: async (): Promise<void> => {
        try {
            await axios.get(`${API_URL}/auth/logout`, {
                withCredentials: true
            });
        } catch (error) {
            console.error('Error during logout:', error);
            throw error;
        }
    }
}; 