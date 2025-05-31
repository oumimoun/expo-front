import { Stack, usePathname } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Header from './components/Header';
import Navbar from './components/Navbar';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider, useTheme } from './theme/ThemeContext';

function LayoutContent() {
    const { theme } = useTheme();
    const pathname = usePathname();
    const styles = makeStyles(theme);

    const showHeader = pathname !== '/';
    const showNavbar = pathname !== '/' && !pathname.startsWith('/screens/');

    return (
        <View style={styles.container}>
            {showHeader && <Header />}
            <View style={styles.content}>
                <Stack
                    screenOptions={{
                        headerShown: false,
                        contentStyle: { backgroundColor: theme.background },
                    }}
                >
                    <Stack.Screen name="index" />
                    <Stack.Screen name="home" />
                    <Stack.Screen name="profile" />
                    <Stack.Screen name="settings" />
                    <Stack.Screen name="notifications" />
                    <Stack.Screen name="events/attended" />
                    <Stack.Screen name="events/upcoming" />
                </Stack>
            </View>
            {showNavbar && <Navbar />}
        </View>
    );
}

export default function Layout() {
    return (
        <ThemeProvider>
            <NotificationProvider>
                <LayoutContent />
            </NotificationProvider>
        </ThemeProvider>
    );
}

const makeStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    content: {
        flex: 1,
    },
}); 