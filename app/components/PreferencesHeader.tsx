import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

const preferences = ['All', 'Web', 'AI', 'Sec'];

export default function PreferencesHeader() {
    const [selectedPreference, setSelectedPreference] = useState('All');
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    return (
        <View style={styles.container}>
            <Text style={styles.greeting}>Events</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContainer}
            >
                {preferences.map((pref) => (
                    <TouchableOpacity
                        key={pref}
                        style={[
                            styles.preferenceButton,
                            selectedPreference === pref && styles.selectedPreference
                        ]}
                        onPress={() => setSelectedPreference(pref)}
                    >
                        <Text style={[
                            styles.preferenceText,
                            selectedPreference === pref && styles.selectedPreferenceText
                        ]}>
                            {pref}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const makeStyles = (theme: any) => StyleSheet.create({
    container: {
        backgroundColor: theme.surface,
        paddingTop: 48,
        paddingBottom: 16,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: theme.shadow,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
    },
    greeting: {
        fontSize: 32,
        fontWeight: 'bold',
        color: theme.text,
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    scrollContainer: {
        paddingHorizontal: 16,
        gap: 8,
    },
    preferenceButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: theme.background,
    },
    selectedPreference: {
        backgroundColor: theme.primary,
    },
    preferenceText: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.textSecondary,
    },
    selectedPreferenceText: {
        color: theme.surface,
    },
}); 