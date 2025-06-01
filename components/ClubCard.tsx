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
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const elevationAnim = useRef(new Animated.Value(2)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, []);

    useEffect(() => {
        if (isSelected) {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1.05,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(elevationAnim, {
                    toValue: 8,
                    friction: 8,
                    useNativeDriver: false,
                })
            ]).start();
        } else {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.timing(rotateAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(elevationAnim, {
                    toValue: 2,
                    friction: 8,
                    useNativeDriver: false,
                })
            ]).start();
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

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '2deg']
    });

    return (
        <Animated.View
            style={[
                styles.cardContainer,
                {
                    opacity: fadeAnim,
                    transform: [
                        { scale: scaleAnim },
                        { rotate }
                    ],
                    elevation: elevationAnim,
                    shadowOpacity: elevationAnim.interpolate({
                        inputRange: [2, 8],
                        outputRange: [0.1, 0.3]
                    })
                }
            ]}
        >
            <TouchableOpacity
                style={[
                    styles.card,
                    isSelected && { backgroundColor: colors.green }
                ]}
                onPress={handlePress}
                activeOpacity={0.9}
            >
                <View style={styles.cardHeader}>
                    <Animated.View style={[
                        styles.iconContainer,
                        isSelected && styles.selectedIconContainer,
                        {
                            transform: [{
                                rotate: rotateAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['0deg', '360deg']
                                })
                            }]
                        }
                    ]}>
                        <Ionicons
                            name="business"
                            size={24}
                            color={isSelected ? '#fff' : colors.green}
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
                    <Animated.View style={[
                        styles.statItem,
                        { transform: [{ scale: isSelected ? 1.1 : 1 }] }
                    ]}>
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
                    </Animated.View>
                    <Animated.View style={[
                        styles.statItem,
                        { transform: [{ scale: isSelected ? 1.1 : 1 }] }
                    ]}>
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
                    </Animated.View>
                </View>

                {isSelected && (
                    <Animated.View
                        style={[
                            styles.selectedIndicator,
                            {
                                transform: [{
                                    translateY: rotateAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [20, 0]
                                    })
                                }],
                                opacity: rotateAnim
                            }
                        ]}
                    >
                        <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    </Animated.View>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        width: 200,
        marginRight: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowRadius: 8,
    },
    card: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 16,
        height: 140,
        position: 'relative',
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(58, 123, 213, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedIconContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    clubName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2d3436',
        flex: 1,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 8,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 8,
        borderRadius: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.03)',
    },
    statText: {
        fontSize: 14,
        color: COLORS.greyText,
        fontWeight: '600',
    },
    selectedText: {
        color: '#fff',
    },
    selectedIndicator: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
});

export default ClubCard;
