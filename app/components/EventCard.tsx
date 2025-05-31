import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface EventCardProps {
    title: string;
    date: string;
    location: string;
    category: string;
    isSubscribed?: boolean;
    buttonType?: 'subscribe' | 'feedback';
    onPress?: () => void;
}

export default function EventCard({
    title,
    date,
    location,
    category,
    isSubscribed = false,
    buttonType = 'subscribe',
    onPress
}: EventCardProps) {
    const [isEventSubscribed, setIsEventSubscribed] = useState(isSubscribed);

    const handleButtonPress = (e: any) => {
        e.stopPropagation();
        if (buttonType === 'subscribe') {
            setIsEventSubscribed(!isEventSubscribed);
        } else {
            // Handle feedback action
            console.log('Open feedback form');
        }
    };

    const renderButton = () => {
        if (buttonType === 'feedback') {
            return (
                <TouchableOpacity
                    style={[styles.subscribeButton, styles.feedbackButton]}
                    onPress={handleButtonPress}
                >
                    <Ionicons
                        name="star-outline"
                        size={20}
                        color="#FFFFFF"
                    />
                    <Text style={[styles.subscribeText, styles.feedbackText]}>
                        Give Feedback
                    </Text>
                </TouchableOpacity>
            );
        }

        return (
            <TouchableOpacity
                style={[
                    styles.subscribeButton,
                    isEventSubscribed && styles.subscribedButton
                ]}
                onPress={handleButtonPress}
            >
                <Ionicons
                    name={isEventSubscribed ? "checkmark" : "add"}
                    size={20}
                    color={isEventSubscribed ? "#FFFFFF" : "#1A866F"}
                />
                <Text style={[
                    styles.subscribeText,
                    isEventSubscribed && styles.subscribedText
                ]}>
                    {isEventSubscribed ? 'Subscribed' : 'Subscribe'}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{category}</Text>
            </View>

            <Text style={styles.title} numberOfLines={2}>{title}</Text>

            <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={16} color="#1A1D1F" />
                    <Text style={styles.detailText}>{date}</Text>
                </View>

                <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={16} color="#1A1D1F" />
                    <Text style={styles.detailText}>{location}</Text>
                </View>
            </View>

            {renderButton()}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#1A866F',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 12,
    },
    categoryText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1A1D1F',
        marginBottom: 16,
        lineHeight: 24,
    },
    detailsContainer: {
        gap: 8,
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailText: {
        fontSize: 14,
        color: '#1A1D1F',
        opacity: 0.8,
    },
    subscribeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: '#F5F7FA',
        gap: 6,
        marginTop: 4,
    },
    subscribedButton: {
        backgroundColor: '#1A866F',
    },
    feedbackButton: {
        backgroundColor: '#FF6B4A',
    },
    subscribeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A866F',
    },
    subscribedText: {
        color: '#FFFFFF',
    },
    feedbackText: {
        color: '#FFFFFF',
    },
}); 