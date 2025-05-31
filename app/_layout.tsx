import { Stack } from 'expo-router';
import React from 'react';

export default function Layout() {
    return (
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
    );
} 