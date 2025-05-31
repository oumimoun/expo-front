import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Navbar from './components/Navbar';

export default function Notifications() {
    return (
        <View style={styles.container}>
            <ScrollView style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Notifications</Text>
                </View>
                <View style={styles.notificationsList}>
                    <Text style={styles.emptyText}>No notifications yet</Text>
                </View>
            </ScrollView>
            <Navbar />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    content: {
        flex: 1,
    },
    header: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1D1F',
    },
    notificationsList: {
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        marginTop: 32,
    },
    emptyText: {
        fontSize: 16,
        color: '#1A1D1F',
        opacity: 0.6,
    },
}); 