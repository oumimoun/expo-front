import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { ThemeProvider } from '../contexts/ThemeContext';
import { UserProvider } from '../contexts/UserContext';

export default function RootLayout() {
    return (
        <ThemeProvider>
            <UserProvider>
                <PaperProvider>
                    <Stack screenOptions={{ headerShown: false }} />
                </PaperProvider>
            </UserProvider>
        </ThemeProvider>
    );
} 