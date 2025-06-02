import Constants from 'expo-constants';

const PROD_API_URL = Constants.expoConfig?.extra?.apiUrl || 'https://europe-west1-playstore-e4a65.cloudfunctions.net/api';
export const API_URL = process.env.EXPO_PUBLIC_API_URL || PROD_API_URL; 