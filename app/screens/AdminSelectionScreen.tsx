import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

// Mock data - replace with actual API call
const MOCK_USERS = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com' },
    { id: '4', name: 'Sarah Williams', email: 'sarah@example.com' },
    { id: '5', name: 'Alex Brown', email: 'alex@example.com' },
];

export default function AdminSelectionScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

    const filteredUsers = MOCK_USERS.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleUserSelection = (userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSubmit = () => {
        console.log('Selected Users:', selectedUsers);
        // Here you would typically send the data to your backend
        router.back();
    };

    const styles = makeStyles(theme);

    const renderUser = ({ item }: { item: typeof MOCK_USERS[0] }) => (
        <TouchableOpacity
            style={[
                styles.userCard,
                selectedUsers.includes(item.id) && styles.selectedCard
            ]}
            onPress={() => toggleUserSelection(item.id)}
        >
            <View style={styles.userInfo}>
                <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                        {item.name.split(' ').map(n => n[0]).join('')}
                    </Text>
                </View>
                <View style={styles.userDetails}>
                    <Text style={styles.userName}>{item.name}</Text>
                    <Text style={styles.userEmail}>{item.email}</Text>
                </View>
            </View>
            {selectedUsers.includes(item.id) && (
                <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Select Admins</Text>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={theme.textSecondary} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search users..."
                    placeholderTextColor={theme.textSecondary}
                />
            </View>

            <FlatList
                data={filteredUsers}
                renderItem={renderUser}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
            />

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.submitButton,
                        selectedUsers.length === 0 && styles.disabledButton
                    ]}
                    onPress={handleSubmit}
                    disabled={selectedUsers.length === 0}
                >
                    <Text style={styles.submitButtonText}>
                        Make Admin ({selectedUsers.length} selected)
                    </Text>
                </TouchableOpacity>
            </View>
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
        borderBottomWidth: 1,
        borderBottomColor: `${theme.border}20`,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: theme.text,
        marginLeft: 8,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.surface,
        margin: 16,
        borderRadius: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: `${theme.border}30`,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        padding: 12,
        fontSize: 16,
        color: theme.text,
    },
    list: {
        padding: 16,
    },
    userCard: {
        backgroundColor: theme.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: `${theme.border}20`,
    },
    selectedCard: {
        backgroundColor: `${theme.primary}15`,
        borderColor: theme.primary,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: theme.surface,
        fontSize: 16,
        fontWeight: '600',
    },
    userDetails: {
        marginLeft: 12,
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: '500',
        color: theme.text,
    },
    userEmail: {
        fontSize: 14,
        color: theme.textSecondary,
        marginTop: 2,
    },
    footer: {
        padding: 16,
        backgroundColor: theme.surface,
        borderTopWidth: 1,
        borderTopColor: `${theme.border}20`,
    },
    submitButton: {
        backgroundColor: theme.primary,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: theme.disabled,
    },
    submitButtonText: {
        color: theme.surface,
        fontSize: 16,
        fontWeight: '600',
    },
}); 