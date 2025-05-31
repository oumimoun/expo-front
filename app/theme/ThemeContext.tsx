import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

export const lightTheme = {
    background: '#F5F7FA',
    surface: '#FFFFFF',
    text: '#1A1D1F',
    textSecondary: '#6B7280',
    primary: '#1A866F',
    primaryLight: '#1A866F15',
    accent: '#F59E0B',
    accentLight: '#F59E0B15',
    border: 'rgba(26, 29, 31, 0.12)',
    shadow: '#000000',
    categories: {
        web: '#3B82F6',
        ai: '#8B5CF6',
        sec: '#EF4444',
        default: '#6B7280'
    }
};

export const darkTheme = {
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    primary: '#22A989',
    primaryLight: '#22A98915',
    accent: '#F59E0B',
    accentLight: '#F59E0B15',
    border: 'rgba(255, 255, 255, 0.12)',
    shadow: '#000000',
    categories: {
        web: '#60A5FA',
        ai: '#A78BFA',
        sec: '#F87171',
        default: '#9CA3AF'
    }
};

type Theme = typeof lightTheme;

interface ThemeContextType {
    theme: Theme;
    isDark: boolean;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemColorScheme = useColorScheme();
    const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

    useEffect(() => {
        setIsDark(systemColorScheme === 'dark');
    }, [systemColorScheme]);

    const theme = isDark ? darkTheme : lightTheme;

    const toggleTheme = () => {
        setIsDark(!isDark);
    };

    return (
        <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
} 