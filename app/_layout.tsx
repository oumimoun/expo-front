import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { ThemeProvider } from '../contexts/ThemeContext';

export default function RootLayout() {
    return (
        <ThemeProvider>
            <PaperProvider>
                <Stack screenOptions={{ headerShown: false }} />
            </PaperProvider>
        </ThemeProvider>
    );
} 