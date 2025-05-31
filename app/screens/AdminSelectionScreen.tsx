import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
                <Ionicons name="checkmark-circle" size={24} color="#1A866F" />
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1D1F" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Select Admins</Text>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search users..."
                    placeholderTextColor="#999"
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(26, 29, 31, 0.08)',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1A1D1F',
        marginLeft: 8,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        margin: 16,
        borderRadius: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: 'rgba(26, 29, 31, 0.12)',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        padding: 12,
        fontSize: 16,
        color: '#1A1D1F',
    },
    list: {
        padding: 16,
    },
    userCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: 'rgba(26, 29, 31, 0.08)',
    },
    selectedCard: {
        backgroundColor: 'rgba(26, 134, 111, 0.08)',
        borderColor: '#1A866F',
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
        backgroundColor: '#1A866F',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#FFFFFF',
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
        color: '#1A1D1F',
    },
    userEmail: {
        fontSize: 14,
        color: '#999',
        marginTop: 2,
    },
    footer: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: 'rgba(26, 29, 31, 0.08)',
    },
    submitButton: {
        backgroundColor: '#1A866F',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#CCCCCC',
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
}); 