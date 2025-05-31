import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Navbar() {
    const router = useRouter();
    const currentPath = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuAnimation = useRef(new Animated.Value(0)).current;

    const isActive = (path: string) => currentPath === path;

    const toggleMenu = () => {
        const toValue = isMenuOpen ? 0 : 1;
        setIsMenuOpen(!isMenuOpen);
        Animated.spring(menuAnimation, {
            toValue,
            useNativeDriver: true,
            tension: 40,
            friction: 7,
        }).start();
    };

    const firstIconStyle = {
        transform: [
            {
                translateY: menuAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, -60],
                }),
            },
        ],
        opacity: menuAnimation,
        zIndex: menuAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [-1, 1],
        }),
    };

    const secondIconStyle = {
        transform: [
            {
                translateY: menuAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, -120],
                }),
            },
        ],
        opacity: menuAnimation,
        zIndex: menuAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [-1, 1],
        }),
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.navItem}
                onPress={() => router.replace('/home')}
            >
                <Ionicons
                    name={isActive('/home') ? "home" : "home-outline"}
                    size={24}
                    color={isActive('/home') ? "#1A866F" : "#1A1D1F"}
                />
                <Text style={[styles.navText, isActive('/home') && styles.activeText]}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.navItem}
                onPress={() => router.replace('/notifications')}
            >
                <Ionicons
                    name={isActive('/notifications') ? "notifications" : "notifications-outline"}
                    size={24}
                    color={isActive('/notifications') ? "#1A866F" : "#1A1D1F"}
                />
                <Text style={[styles.navText, isActive('/notifications') && styles.activeText]}>Notifications</Text>
            </TouchableOpacity>

            <View style={[styles.navItem, styles.addButton]}>
                <Animated.View style={[styles.menuIconContainer, secondIconStyle]}>
                    <TouchableOpacity
                        style={styles.menuIcon}
                        onPress={() => {
                            router.push('/screens/AdminSelectionScreen');
                            toggleMenu();
                        }}
                    >
                        <Ionicons name="people" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </Animated.View>
                <Animated.View style={[styles.menuIconContainer, firstIconStyle]}>
                    <TouchableOpacity
                        style={styles.menuIcon}
                        onPress={() => {
                            router.push('/screens/CreateEventScreen');
                            toggleMenu();
                        }}
                    >
                        <Ionicons name="calendar" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </Animated.View>
                <TouchableOpacity
                    style={[
                        styles.addButtonContainer,
                        isMenuOpen && styles.addButtonActive
                    ]}
                    onPress={toggleMenu}
                    activeOpacity={0.9}
                >
                    <Animated.View
                        style={{
                            transform: [{
                                rotate: menuAnimation.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['0deg', '45deg']
                                })
                            }]
                        }}
                    >
                        <Ionicons name="add" size={32} color="#FFFFFF" />
                    </Animated.View>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.navItem}
                onPress={() => router.replace('/profile')}
            >
                <Ionicons
                    name={isActive('/profile') ? "person" : "person-outline"}
                    size={24}
                    color={isActive('/profile') ? "#1A866F" : "#1A1D1F"}
                />
                <Text style={[styles.navText, isActive('/profile') && styles.activeText]}>Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.navItem}
                onPress={() => router.replace('/settings')}
            >
                <Ionicons
                    name={isActive('/settings') ? "settings" : "settings-outline"}
                    size={24}
                    color={isActive('/settings') ? "#1A866F" : "#1A1D1F"}
                />
                <Text style={[styles.navText, isActive('/settings') && styles.activeText]}>Settings</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        height: 80,
        backgroundColor: '#FFFFFF',
        paddingBottom: 20,
        alignItems: 'center',
        justifyContent: 'space-around',
        borderTopWidth: 1,
        borderTopColor: 'rgba(26, 29, 31, 0.08)',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -4,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 5,
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    navText: {
        fontSize: 12,
        marginTop: 4,
        color: '#1A1D1F',
        fontWeight: '500',
    },
    activeText: {
        color: '#1A866F',
        fontWeight: '600',
    },
    addButton: {
        marginTop: -30,
        alignItems: 'center',
        justifyContent: 'center',
        height: 120,
    },
    addButtonContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#1A866F',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 1,
    },
    addButtonActive: {
        transform: [{ rotate: '45deg' }],
    },
    menuIconContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
    },
    menuIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1A866F',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
}); 