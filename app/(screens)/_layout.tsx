import { Stack } from 'expo-router';
import React from 'react';
import { useTheme } from '../theme/ThemeContext';

export default function ScreensLayout() {
    const { theme } = useTheme();

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: theme.background },
            }}
        >
            <Stack.Screen
                name="create-event"
                options={{
                    presentation: 'modal',
                }}
            />
            <Stack.Screen
                name="select-admin"
                options={{
                    presentation: 'modal',
                }}
            />
        </Stack>
    );
} 