import { ConfigContext, ExpoConfig } from 'expo/config';

// Production URLs
const PROD_API_URL = 'https://europe-west1-playstore-e4a65.cloudfunctions.net/api';
const PROD_REDIRECT_URL = PROD_API_URL;

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    name: "expo-front",
    slug: "expo-front",
    extra: {
        apiUrl: process.env.EXPO_PUBLIC_API_URL || PROD_API_URL,
        redirectUrl: process.env.EXPO_PUBLIC_REDIRECT_URL || PROD_REDIRECT_URL,
    },
    plugins: [
        "expo-router"
    ],
    scheme: "expo-front",
    web: {
        bundler: "metro"
    }
}); 