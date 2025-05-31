import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const preferences = ['All', 'Web', 'AI', 'Sec'];

export default function PreferencesHeader() {
    const [selectedPreference, setSelectedPreference] = useState('All');

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

const styles = StyleSheet.create({
    container: {
        paddingTop: 50,
        paddingBottom: 16,
        backgroundColor: '#F5F7FA',
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1D1F',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    scrollContainer: {
        paddingHorizontal: 12,
        gap: 8,
    },
    preferenceButton: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#E8ECF4',
    },
    selectedPreference: {
        backgroundColor: '#1A866F',
    },
    preferenceText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1D1F',
    },
    selectedPreferenceText: {
        color: '#FFFFFF',
    },
}); 