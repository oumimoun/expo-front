import { Stack } from 'expo-router';
import React from 'react';
import { ThemeProvider } from './theme/ThemeContext';

export default function Layout() {
    return (
        <ThemeProvider>
            <Stack
                screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
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
        </ThemeProvider>
    );
} 