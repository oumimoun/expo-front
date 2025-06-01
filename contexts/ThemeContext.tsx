import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    colors: typeof lightColors;
}

export const lightColors = {
    background: '#FFFFFF',
    text: '#000000',
    green: '#1b8456',
    lightGreen: '#e0f0e9',
    greyText: '#555555',
    lightGrey: '#f9f9f9',
    white: '#FFFFFF',
    red: '#ff4444',
    surface: '#FFFFFF',
    border: 'rgba(0,0,0,0.05)',
};

export const darkColors = {
    background: '#1A1A1A',
    text: '#FFFFFF',
    green: '#22A06B',
    lightGreen: '#193D2C',
    greyText: '#BBBBBB',
    lightGrey: '#2A2A2A',
    white: '#1A1A1A',
    red: '#ff4444',
    surface: '#2A2A2A',
    border: 'rgba(255,255,255,0.1)',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        loadThemePreference();
    }, []);

    const loadThemePreference = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('isDarkMode');
            if (savedTheme !== null) {
                setIsDarkMode(JSON.parse(savedTheme));
            }
        } catch (error) {
            console.error('Error loading theme:', error);
        }
    };

    const toggleDarkMode = async () => {
        try {
            const newMode = !isDarkMode;
            setIsDarkMode(newMode);
            await AsyncStorage.setItem('isDarkMode', JSON.stringify(newMode));
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    };

    return (
        <ThemeContext.Provider value={{
            isDarkMode,
            toggleDarkMode,
            colors: isDarkMode ? darkColors : lightColors,
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}; 