import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

// Define theme types
type ThemeType = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    isDark: boolean;
    toggleTheme: () => void;
    setTheme: (theme: ThemeType) => void;
}

interface Theme {
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    primary: string;
    primaryLight: string;
    accent: string;
    accentLight: string;
    border: string;
    shadow: string;
    disabled: string;
    categories: {
        web: string;
        ai: string;
        sec: string;
        default: string;
    };
}

// Define themes
const lightTheme: Theme = {
    background: '#F5F7FA',
    surface: '#FFFFFF',
    text: '#1A1D1F',
    textSecondary: '#6B7280',
    primary: '#1A866F',
    primaryLight: '#E8F5F1',
    accent: '#F59E0B',
    accentLight: '#FEF3C7',
    border: '#E5E7EB',
    shadow: '#000000',
    disabled: '#D1D5DB',
    categories: {
        web: '#3B82F6',
        ai: '#8B5CF6',
        sec: '#EF4444',
        default: '#6B7280',
    },
};

const darkTheme: Theme = {
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#9CA3AF',
    primary: '#22A989',
    primaryLight: '#1A2F2B',
    accent: '#F59E0B',
    accentLight: '#2F2516',
    border: '#374151',
    shadow: '#000000',
    disabled: '#4B5563',
    categories: {
        web: '#60A5FA',
        ai: '#A78BFA',
        sec: '#F87171',
        default: '#9CA3AF',
    },
};

// Create context
const ThemeContext = createContext<ThemeContextType>({
    theme: lightTheme,
    isDark: false,
    toggleTheme: () => { },
    setTheme: () => { },
});

// Create provider
export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemColorScheme = useColorScheme();
    const [themeType, setThemeType] = useState<ThemeType>(systemColorScheme || 'light');

    useEffect(() => {
        if (systemColorScheme) {
            setThemeType(systemColorScheme);
        }
    }, [systemColorScheme]);

    const toggleTheme = () => {
        setThemeType(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    const theme = themeType === 'dark' ? darkTheme : lightTheme;

    return (
        <ThemeContext.Provider
            value={{
                theme,
                isDark: themeType === 'dark',
                toggleTheme,
                setTheme: setThemeType,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

// Create hook
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}; 