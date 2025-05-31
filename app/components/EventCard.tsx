import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

export interface EventCardProps {
    id: string;
    title: string;
    date: string;
    location: string;
    category: string;
    isSubscribed?: boolean;
    buttonType?: 'subscribe' | 'feedback';
    onAction?: () => void;
    onPress?: () => void;
}

interface CategoryColors {
    web: ViewStyle;
    ai: ViewStyle;
    sec: ViewStyle;
    default: ViewStyle;
}

export default function EventCard({
    title,
    date,
    location,
    category,
    buttonType,
    isSubscribed,
    onAction,
    onPress
}: EventCardProps) {
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    const getButtonStyle = () => {
        switch (buttonType) {
            case 'subscribe':
                return {
                    backgroundColor: isSubscribed ? '#1A866F' : '#1A866F15',
                    text: isSubscribed ? 'Subscribed' : 'Subscribe',
                    textColor: isSubscribed ? '#FFFFFF' : '#1A866F',
                    icon: isSubscribed ? 'checkmark-circle' : 'add-circle-outline'
                };
            case 'feedback':
                return {
                    backgroundColor: '#F59E0B15',
                    text: 'Give Feedback',
                    textColor: '#F59E0B',
                    icon: 'star-outline'
                };
            default:
                return null;
        }
    };

    const buttonStyle = getButtonStyle();
    const categoryKey = (category.toLowerCase() as keyof CategoryColors) || 'default';

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            disabled={!onPress}
        >
            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={2}>
                    {title}
                </Text>
                <View style={styles.details}>
                    <View style={styles.detailRow}>
                        <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                        <Text style={styles.detailText}>{formattedDate}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Ionicons name="location-outline" size={16} color="#6B7280" />
                        <Text style={styles.detailText}>{location}</Text>
                    </View>
                </View>
                <View style={styles.footer}>
                    <View style={[styles.category, categoryColors[categoryKey]]}>
                        <Text style={styles.categoryText}>{category}</Text>
                    </View>
                    {buttonStyle && (
                        <TouchableOpacity
                            style={[
                                styles.button,
                                { backgroundColor: buttonStyle.backgroundColor }
                            ]}
                            onPress={onAction}
                            activeOpacity={0.8}
                        >
                            <Ionicons
                                name={buttonStyle.icon as any}
                                size={16}
                                color={buttonStyle.textColor}
                                style={styles.buttonIcon}
                            />
                            <Text style={[styles.buttonText, { color: buttonStyle.textColor }]}>
                                {buttonStyle.text}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

const categoryColors: CategoryColors = {
    web: {
        backgroundColor: '#3B82F6',
    },
    ai: {
        backgroundColor: '#8B5CF6',
    },
    sec: {
        backgroundColor: '#EF4444',
    },
    default: {
        backgroundColor: '#6B7280',
    },
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
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
        color: '#1A1D1F',
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
        color: '#6B7280',
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
        color: '#FFFFFF',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 4,
    },
    buttonIcon: {
        marginRight: 4,
    },
    buttonText: {
        fontSize: 12,
        fontWeight: '500',
    },
}); 