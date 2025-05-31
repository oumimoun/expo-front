import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../theme/ThemeContext';

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const { theme } = useTheme();
    const { unreadCount } = useNotifications();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuAnimation = useRef(new Animated.Value(0)).current;

    const toggleMenu = () => {
        const toValue = isMenuOpen ? 0 : 1;
        setIsMenuOpen(!isMenuOpen);
        Animated.spring(menuAnimation, {
            toValue,
            useNativeDriver: true,
            friction: 7,
            tension: 40,
        }).start();
    };

    const firstIconStyle = {
        transform: [
            {
                translateY: menuAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -60]
                })
            }
        ],
        opacity: menuAnimation
    };

    const secondIconStyle = {
        transform: [
            {
                translateY: menuAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -120]
                })
            }
        ],
        opacity: menuAnimation
    };

    const styles = makeStyles(theme);

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.navItem, pathname === '/home' && styles.activeNavItem]}
                onPress={() => router.push('/home')}
            >
                <Ionicons
                    name="home"
                    size={24}
                    color={pathname === '/home' ? theme.primary : theme.textSecondary}
                />
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.navItem, pathname === '/notifications' && styles.activeNavItem]}
                onPress={() => router.push('/notifications')}
            >
                <View>
                    <Ionicons
                        name="notifications"
                        size={24}
                        color={pathname === '/notifications' ? theme.primary : theme.textSecondary}
                    />
                    {unreadCount > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>
                                {unreadCount}
                            </Text>
                        </View>
                    )}
                </View>
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
                        <Ionicons name="people" size={24} color={theme.surface} />
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
                        <Ionicons name="calendar" size={24} color={theme.surface} />
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
                        <Ionicons name="add" size={32} color={theme.surface} />
                    </Animated.View>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={[styles.navItem, pathname === '/profile' && styles.activeNavItem]}
                onPress={() => router.push('/profile')}
            >
                <Ionicons
                    name="person"
                    size={24}
                    color={pathname === '/profile' ? theme.primary : theme.textSecondary}
                />
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.navItem, pathname === '/settings' && styles.activeNavItem]}
                onPress={() => router.push('/settings')}
            >
                <Ionicons
                    name="settings"
                    size={24}
                    color={pathname === '/settings' ? theme.primary : theme.textSecondary}
                />
            </TouchableOpacity>
        </View>
    );
}

const makeStyles = (theme: any) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: theme.surface,
        paddingVertical: 12,
        paddingBottom: 28,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: theme.shadow,
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    activeNavItem: {
        backgroundColor: `${theme.primary}15`,
    },
    addButton: {
        position: 'relative',
    },
    addButtonContainer: {
        backgroundColor: theme.primary,
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -40,
        shadowColor: theme.shadow,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    addButtonActive: {
        backgroundColor: theme.accent,
    },
    menuIconContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        width: 48,
        height: 48,
        bottom: 60,
    },
    menuIcon: {
        backgroundColor: theme.primary,
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: theme.shadow,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    badge: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: theme.primary,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: theme.surface,
        fontSize: 12,
        fontWeight: 'bold',
    },
}); 