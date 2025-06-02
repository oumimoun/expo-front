import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import type { Club } from '../app/types/club';
import { useTheme } from '../contexts/ThemeContext';

const COLORS = {
    background: '#f8f9fa',
    card: '#ffffff',
    greyText: '#666666',
    border: '#e1e1e1',
};

interface ClubCardProps {
    club: Club;
    isSelected: boolean;
    onSelect: (clubId: string) => void;
}

const ClubCard: React.FC<ClubCardProps> = ({ club, isSelected, onSelect }) => {
    const { colors } = useTheme();
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, []);

    useEffect(() => {
        if (isSelected) {
            Animated.spring(scaleAnim, {
                toValue: 1.05,
                friction: 8,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                useNativeDriver: true,
            }).start();
        }
    }, [isSelected]);

    const handlePress = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: isSelected ? 1.05 : 1,
                friction: 8,
                useNativeDriver: true,
            })
        ]).start();
        onSelect(club.id);
    };

    return (
        <View style={[
            styles.shadowContainer,
            { elevation: isSelected ? 8 : 2 }
        ]}>
            <Animated.View
                style={[
                    styles.cardContainer,
                    {
                        opacity: fadeAnim,
                        transform: [
                            { scale: scaleAnim }
                        ]
                    }
                ]}
            >
                <TouchableOpacity
                    style={[
                        styles.card,
                        isSelected && { backgroundColor: club.color || colors.green }
                    ]}
                    onPress={handlePress}
                    activeOpacity={0.9}
                >
                    <View style={styles.cardHeader}>
                        <Animated.View style={[
                            styles.iconContainer,
                            isSelected && styles.selectedIconContainer,
                            {
                                backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.2)' : `${club.color}20` || 'rgba(58, 123, 213, 0.1)'
                            }
                        ]}>
                            <Ionicons
                                name="business"
                                size={24}
                                color={isSelected ? '#fff' : club.color || colors.green}
                            />
                        </Animated.View>
                        <Text
                            style={[
                                styles.clubName,
                                isSelected && styles.selectedText
                            ]}
                            numberOfLines={1}
                        >
                            {club.name}
                        </Text>
                    </View>

                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Ionicons
                                name="people"
                                size={20}
                                color={isSelected ? '#fff' : COLORS.greyText}
                            />
                            <Text
                                style={[
                                    styles.statText,
                                    isSelected && styles.selectedText
                                ]}
                            >
                                {club.admins.length}
                            </Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons
                                name="calendar"
                                size={20}
                                color={isSelected ? '#fff' : COLORS.greyText}
                            />
                            <Text
                                style={[
                                    styles.statText,
                                    isSelected && styles.selectedText
                                ]}
                            >
                                {club.eventCount}
                            </Text>
                        </View>
                    </View>

                    {isSelected && (
                        <Animated.View
                            style={[
                                styles.selectedIndicator,
                                {
                                    opacity: fadeAnim
                                }
                            ]}
                        >
                            <Ionicons name="checkmark-circle" size={24} color="#fff" />
                        </Animated.View>
                    )}
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    shadowContainer: {
        margin: 8,
        borderRadius: 16,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    cardContainer: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    card: {
        backgroundColor: COLORS.card,
        padding: 16,
        borderRadius: 16,
        minWidth: 200,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    selectedIconContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    clubName: {
        fontSize: 18,
        fontWeight: '600',
        flex: 1,
    },
    selectedText: {
        color: '#fff',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 8,
    },
    statItem: {
        alignItems: 'center',
    },
    statText: {
        marginTop: 4,
        color: COLORS.greyText,
    },
    selectedIndicator: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
});

export default ClubCard;
