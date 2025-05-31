import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import AttendedEventCard from '../components/AttendedEventCard';
import FeedbackModal from '../components/FeedbackModal';
import { useTheme } from '../theme/ThemeContext';

// Example data - replace with actual data from your backend
const initialEvents = [
    {
        id: '1',
        title: 'Advanced React Patterns Workshop',
        date: '2024-03-10T14:00:00',
        location: 'Room A1',
        category: 'Web',
        hasFeedback: false,
    },
    {
        id: '2',
        title: 'Machine Learning Fundamentals',
        date: '2024-03-08T15:30:00',
        location: 'Room B2',
        category: 'AI',
        hasFeedback: true,
        rating: 5,
    },
    {
        id: '3',
        title: 'Cybersecurity Best Practices',
        date: '2024-03-05T13:00:00',
        location: 'Room C3',
        category: 'Sec',
        hasFeedback: true,
        rating: 4,
    },
    {
        id: '4',
        title: 'Web Accessibility Workshop',
        date: '2024-03-03T10:00:00',
        location: 'Room A2',
        category: 'Web',
        hasFeedback: true,
        rating: 5,
    },
    {
        id: '5',
        title: 'AI Ethics Seminar',
        date: '2024-03-01T16:00:00',
        location: 'Room B1',
        category: 'AI',
        hasFeedback: false,
    },
];

const categories = ['All', 'Web', 'AI', 'Sec'];

export default function AttendedEvents() {
    const router = useRouter();
    const { theme } = useTheme();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
    const [isFeedbackModalVisible, setIsFeedbackModalVisible] = useState(false);

    const filteredEvents = initialEvents.filter(event => {
        const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
        const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleGiveFeedback = (eventId: string) => {
        setSelectedEvent(eventId);
        setIsFeedbackModalVisible(true);
    };

    const handleSubmitFeedback = (rating: number, comment: string) => {
        console.log('Feedback submitted:', { eventId: selectedEvent, rating, comment });
        // Here you would typically send this to your backend
    };

    const styles = makeStyles(theme);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Attended Events</Text>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                    <Ionicons name="search" size={20} color={theme.textSecondary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search events..."
                        placeholderTextColor={theme.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery !== '' && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoriesContainer}
                contentContainerStyle={styles.categoriesContent}
            >
                {categories.map((category) => (
                    <TouchableOpacity
                        key={category}
                        style={[
                            styles.categoryButton,
                            selectedCategory === category && styles.selectedCategory
                        ]}
                        onPress={() => setSelectedCategory(category)}
                    >
                        <Text
                            style={[
                                styles.categoryText,
                                selectedCategory === category && styles.selectedCategoryText
                            ]}
                        >
                            {category}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <ScrollView
                style={styles.eventsList}
                contentContainerStyle={styles.eventsListContent}
                showsVerticalScrollIndicator={false}
            >
                {filteredEvents.map((event) => (
                    <AttendedEventCard
                        key={event.id}
                        {...event}
                        onGiveFeedback={
                            !event.hasFeedback
                                ? () => handleGiveFeedback(event.id)
                                : undefined
                        }
                    />
                ))}
                {filteredEvents.length === 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons name="calendar-outline" size={48} color={theme.textSecondary} />
                        <Text style={styles.emptyStateText}>No events found</Text>
                    </View>
                )}
            </ScrollView>

            <FeedbackModal
                isVisible={isFeedbackModalVisible}
                onClose={() => setIsFeedbackModalVisible(false)}
                onSubmit={handleSubmitFeedback}
                eventTitle={
                    initialEvents.find(event => event.id === selectedEvent)?.title || ''
                }
            />
        </View>
    );
}

const makeStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: theme.surface,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: theme.shadow,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    backButton: {
        marginRight: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.text,
    },
    searchContainer: {
        padding: 16,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.surface,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
        color: theme.text,
    },
    categoriesContainer: {
        maxHeight: 48,
    },
    categoriesContent: {
        paddingHorizontal: 16,
        gap: 8,
    },
    categoryButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: theme.surface,
    },
    selectedCategory: {
        backgroundColor: theme.primary,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.textSecondary,
    },
    selectedCategoryText: {
        color: theme.surface,
    },
    eventsList: {
        flex: 1,
    },
    eventsListContent: {
        padding: 16,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
    },
    emptyStateText: {
        fontSize: 16,
        color: theme.textSecondary,
        marginTop: 16,
    },
}); 