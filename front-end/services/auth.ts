import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import { User } from '../contexts/UserContext';

// Get URLs from Expo config
const PROD_API_URL = Constants.expoConfig?.extra?.apiUrl || 'https://europe-west1-playstore-e4a65.cloudfunctions.net/api';
const PROD_REDIRECT_URL = Constants.expoConfig?.extra?.redirectUrl || PROD_API_URL;

// Get the API URL from environment or fallback to production
const API_URL = process.env.EXPO_PUBLIC_API_URL || PROD_API_URL;

// Dynamically get the redirect URL based on the environment
const getRedirectUrl = () => {
    // Check if we're in development mode
    if (__DEV__) {
        // Get the host URI from Expo config (includes the tunnel URL when using tunnel)
        const hostUri = Constants.expoConfig?.hostUri || '';
        
        // Extract just the host part (remove port if present)
        const host = hostUri.split(':')[0];
        
        // If using tunnel, the host will contain 'exp.direct'
        if (host.includes('exp.direct')) {
            return `exp://${host}`;
        }
        
        // For LAN or localhost
        return `exp://${hostUri}`;
    }

    // For production, use the configured redirect URL
    return PROD_REDIRECT_URL;
};

const REDIRECT_URL = getRedirectUrl();

interface ApiResponse {
    success: boolean;
    user: User;
}

export const auth = {
    getCurrentUser: async (): Promise<User | null> => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) return null;

            const response = await axios.get<ApiResponse>(`${API_URL}/api/users`, {
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
            // Log the environment and URLs being used
            console.log('Environment:', {
                isDev: __DEV__,
                hostUri: Constants.expoConfig?.hostUri,
                redirectUrl: REDIRECT_URL,
                apiUrl: API_URL
            });

            // Add the redirect URL as a query parameter
            const encodedRedirectUrl = encodeURIComponent(REDIRECT_URL);
            const authUrl = `${API_URL}/api/auth/42?mobileRedirect=${encodedRedirectUrl}`;

            console.log('Opening auth URL:', authUrl);

            const result = await WebBrowser.openAuthSessionAsync(
                authUrl,
                REDIRECT_URL,
                {
                    showInRecents: true,
                    preferEphemeralSession: true
                }
            );

            console.log('Auth result:', result);

            if (result.type === 'success') {
                const url = result.url;
                console.log('Success URL:', url);

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
                    console.log('Token stored successfully');
                } else {
                    throw new Error('No authentication token received');
                }
            } else {
                console.log('Auth was cancelled or failed:', result);
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
                await axios.get(`${API_URL}/api/auth/logout`, {
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