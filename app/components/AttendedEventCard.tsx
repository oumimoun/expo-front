import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface AttendedEventCardProps {
    id: string;
    title: string;
    date: string;
    location: string;
    category: string;
    rating?: number;
    hasFeedback: boolean;
    onGiveFeedback?: () => void;
}

export default function AttendedEventCard({
    title,
    date,
    location,
    category,
    rating,
    hasFeedback,
    onGiveFeedback,
}: AttendedEventCardProps) {
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    const formattedDate = new Date(date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    const renderRating = () => {
        if (!rating) return null;
        return (
            <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                        key={star}
                        name={star <= rating ? 'star' : 'star-outline'}
                        size={16}
                        color={theme.accent}
                    />
                ))}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={2}>
                    {title}
                </Text>
                <View style={styles.details}>
                    <View style={styles.detailRow}>
                        <Ionicons name="calendar-outline" size={16} color={theme.textSecondary} />
                        <Text style={styles.detailText}>{formattedDate}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Ionicons name="location-outline" size={16} color={theme.textSecondary} />
                        <Text style={styles.detailText}>{location}</Text>
                    </View>
                </View>
                <View style={styles.footer}>
                    <View style={[styles.category, { backgroundColor: theme.categories[category.toLowerCase() as keyof typeof theme.categories] }]}>
                        <Text style={styles.categoryText}>{category}</Text>
                    </View>
                    {hasFeedback ? (
                        renderRating()
                    ) : (
                        <TouchableOpacity
                            style={styles.feedbackButton}
                            onPress={onGiveFeedback}
                            disabled={!onGiveFeedback}
                        >
                            <Ionicons name="star-outline" size={16} color={theme.accent} />
                            <Text style={styles.feedbackButtonText}>Give Feedback</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
}

const makeStyles = (theme: any) => StyleSheet.create({
    container: {
        backgroundColor: theme.surface,
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: theme.shadow,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    content: {
        padding: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.text,
        marginBottom: 12,
    },
    details: {
        marginBottom: 16,
        gap: 8,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailText: {
        fontSize: 14,
        color: theme.textSecondary,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    category: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '500',
        color: theme.surface,
    },
    ratingContainer: {
        flexDirection: 'row',
        gap: 2,
    },
    feedbackButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: `${theme.accent}15`,
        gap: 4,
    },
    feedbackButtonText: {
        fontSize: 12,
        fontWeight: '500',
        color: theme.accent,
    },
}); 