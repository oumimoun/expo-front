import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

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
    const [error, setError] = useState('');

    // Reset state when modal closes
    useEffect(() => {
        if (!isVisible) {
            setRating(0);
            setComment('');
            setError('');
        }
    }, [isVisible]);

    const handleSubmit = () => {
        if (rating === 0) {
            setError('Please select a rating');
            return;
        }
        onSubmit(rating, comment);
    };

    const handleClose = () => {
        Keyboard.dismiss();
        onClose();
    };

    const renderStars = () => {
        return Array(5).fill(0).map((_, index) => (
            <TouchableOpacity
                key={index}
                onPress={() => {
                    setRating(index + 1);
                    setError('');
                }}
                style={styles.starContainer}
            >
                <Ionicons
                    name={index < rating ? 'star' : 'star-outline'}
                    size={32}
                    color="#F59E0B"
                />
            </TouchableOpacity>
        ));
    };

    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.modalContainer}
                >
                    <View style={styles.modalContent}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={handleClose}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name="close" size={24} color="#6B7280" />
                        </TouchableOpacity>

                        <Text style={styles.title}>Event Feedback</Text>
                        <Text style={styles.eventTitle}>{eventTitle}</Text>

                        <Text style={styles.ratingLabel}>How would you rate this event?</Text>
                        <View style={styles.starsContainer}>
                            {renderStars()}
                        </View>
                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        <Text style={styles.commentLabel}>Share your thoughts (optional)</Text>
                        <TextInput
                            style={styles.commentInput}
                            placeholder="What did you think about the event?"
                            placeholderTextColor="#9CA3AF"
                            multiline
                            textAlignVertical="top"
                            returnKeyType="done"
                            blurOnSubmit={true}
                            maxLength={500}
                            value={comment}
                            onChangeText={setComment}
                            onSubmitEditing={Keyboard.dismiss}
                        />

                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleSubmit}
                        >
                            <Text style={styles.submitButtonText}>Submit Feedback</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        padding: 16,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        paddingTop: 32,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    closeButton: {
        position: 'absolute',
        right: 12,
        top: 12,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F5F7FA',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: '#1A1D1F',
        marginBottom: 8,
        textAlign: 'center',
    },
    eventTitle: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 24,
        textAlign: 'center',
    },
    ratingLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1A1D1F',
        marginBottom: 12,
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 24,
    },
    starContainer: {
        padding: 4,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 14,
        marginBottom: 16,
        textAlign: 'center',
    },
    commentLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1A1D1F',
        marginBottom: 12,
    },
    commentInput: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        padding: 12,
        paddingTop: 12,
        fontSize: 16,
        color: '#1A1D1F',
        minHeight: 120,
        maxHeight: 200,
        textAlignVertical: 'top',
        marginBottom: 24,
    },
    submitButton: {
        backgroundColor: '#1A866F',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
}); 