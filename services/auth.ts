import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as WebBrowser from 'expo-web-browser';
import { User } from '../contexts/UserContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://europe-west1-playstore-e4a65.cloudfunctions.net/api/api';
const REDIRECT_URL = 'exp://klty-gs-anonymous-8081.exp.direct';

interface ApiResponse {
    success: boolean;
    user: User;
}

export const auth = {
    getCurrentUser: async (): Promise<User | null> => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) return null;

            const response = await axios.get<ApiResponse>(`${API_URL}/users`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data.user;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    },

    login42: async (): Promise<void> => {
        try {
            // Open 42 OAuth URL in browser
            const authUrl = `${API_URL}/auth/42`;
            const result = await WebBrowser.openAuthSessionAsync(
                authUrl,
                REDIRECT_URL,
                {
                    showInRecents: true,
                    preferEphemeralSession: true,
                }
            );

            if (result.type === 'success') {
                const url = result.url;
                // Check for errors first
                const errorMatch = url.match(/error=([^&]*)/);
                if (errorMatch) {
                    const error = decodeURIComponent(errorMatch[1]);
                    const messageMatch = url.match(/message=([^&]*)/);
                    const message = messageMatch ? decodeURIComponent(messageMatch[1]) : '';
                    throw new Error(`Authentication failed: ${error}${message ? ` - ${message}` : ''}`);
                }

                // Extract token if present
                const tokenMatch = url.match(/token=([^&]*)/);
                if (tokenMatch) {
                    const token = tokenMatch[1];
                    await AsyncStorage.setItem('userToken', token);
                } else {
                    throw new Error('No authentication token received');
                }
            } else {
                throw new Error('Authentication was cancelled or failed');
            }
        } catch (error) {
            console.error('Error during 42 login:', error);
            throw error;
        }
    },

    logout: async (): Promise<void> => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                await axios.get(`${API_URL}/auth/logout`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            }
            await AsyncStorage.removeItem('userToken');
        } catch (error) {
            // Even if the server call fails, we want to remove the token
            await AsyncStorage.removeItem('userToken');
            console.error('Error during logout:', error);
            throw error;
        }
    }
}; 