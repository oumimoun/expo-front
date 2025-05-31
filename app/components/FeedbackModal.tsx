import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface FeedbackModalProps {
    isVisible: boolean;
    onClose: () => void;
    onSubmit: (rating: number, comment: string) => void;
    eventTitle: string;
}

export default function FeedbackModal({
    isVisible,
    onClose,
    onSubmit,
    eventTitle,
}: FeedbackModalProps) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const { theme } = useTheme();
    const styles = makeStyles(theme);

    const handleSubmit = () => {
        onSubmit(rating, comment);
        setRating(0);
        setComment('');
        onClose();
    };

    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={onClose}
                    >
                        <Ionicons name="close" size={24} color={theme.textSecondary} />
                    </TouchableOpacity>

                    <Text style={styles.title}>Event Feedback</Text>
                    <Text style={styles.eventTitle} numberOfLines={2}>
                        {eventTitle}
                    </Text>

                    <View style={styles.ratingContainer}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity
                                key={star}
                                onPress={() => setRating(star)}
                                style={styles.starButton}
                            >
                                <Ionicons
                                    name={star <= rating ? 'star' : 'star-outline'}
                                    size={32}
                                    color={star <= rating ? theme.accent : theme.textSecondary}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TextInput
                        style={styles.input}
                        placeholder="Share your thoughts about the event..."
                        placeholderTextColor={theme.textSecondary}
                        value={comment}
                        onChangeText={setComment}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />

                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            (!rating || !comment) && styles.submitButtonDisabled
                        ]}
                        onPress={handleSubmit}
                        disabled={!rating || !comment}
                    >
                        <Text style={styles.submitButtonText}>Submit Feedback</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const makeStyles = (theme: any) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        backgroundColor: theme.surface,
        borderRadius: 24,
        padding: 24,
        width: '90%',
        maxWidth: 400,
        shadowColor: theme.shadow,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    closeButton: {
        position: 'absolute',
        right: 16,
        top: 16,
        padding: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.text,
        marginBottom: 8,
    },
    eventTitle: {
        fontSize: 16,
        color: theme.textSecondary,
        marginBottom: 24,
    },
    ratingContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 24,
        gap: 8,
    },
    starButton: {
        padding: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 12,
        padding: 12,
        color: theme.text,
        backgroundColor: theme.background,
        height: 120,
        marginBottom: 24,
    },
    submitButton: {
        backgroundColor: theme.primary,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        backgroundColor: theme.disabled,
    },
    submitButtonText: {
        color: theme.surface,
        fontSize: 16,
        fontWeight: '600',
    },
}); 