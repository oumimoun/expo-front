import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface EventFormData {
    title: string;
    description: string;
    location: string;
    date: string;
    time: string;
    capacity: string;
    price: string;
    category: string;
}

interface ValidationErrors {
    [key: string]: string;
}

interface FormField {
    key: keyof EventFormData;
    label: string;
    placeholder: string;
    icon: string;
    multiline: boolean;
    keyboardType: 'default' | 'numeric';
}

const FORM_FIELDS: FormField[] = [
    { key: 'title', label: 'Event Title', placeholder: 'Enter event title', icon: 'bookmark-outline', multiline: false, keyboardType: 'default' },
    { key: 'description', label: 'Description', placeholder: 'Enter event description', icon: 'document-text-outline', multiline: true, keyboardType: 'default' },
    { key: 'location', label: 'Location', placeholder: 'Enter event location', icon: 'location-outline', multiline: false, keyboardType: 'default' },
    { key: 'date', label: 'Date', placeholder: 'DD/MM/YYYY', icon: 'calendar-outline', multiline: false, keyboardType: 'default' },
    { key: 'time', label: 'Time', placeholder: 'HH:MM', icon: 'time-outline', multiline: false, keyboardType: 'default' },
    { key: 'category', label: 'Category', placeholder: 'Enter event category', icon: 'pricetag-outline', multiline: false, keyboardType: 'default' },
    { key: 'capacity', label: 'Capacity', placeholder: 'Enter maximum capacity', icon: 'people-outline', multiline: false, keyboardType: 'numeric' },
    { key: 'price', label: 'Price', placeholder: 'Enter ticket price', icon: 'cash-outline', multiline: false, keyboardType: 'numeric' },
];

export default function CreateEventScreen() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [eventData, setEventData] = useState<EventFormData>({
        title: '',
        description: '',
        location: '',
        date: '',
        time: '',
        capacity: '',
        price: '',
        category: ''
    });
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const slideAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(1)).current;

    const validateField = (field: keyof EventFormData): boolean => {
        const value = eventData[field];
        const newErrors: ValidationErrors = {};

        if (!value.trim()) {
            newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        } else if ((field === 'capacity' || field === 'price') && isNaN(Number(value))) {
            newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} must be a number`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const animateTransition = (direction: 'forward' | 'backward') => {
        const toValue = direction === 'forward' ? -1 : 1;

        Animated.sequence([
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]),
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    };

    const handleNext = () => {
        const currentField = FORM_FIELDS[currentStep].key;
        if (validateField(currentField)) {
            if (currentStep < FORM_FIELDS.length - 1) {
                animateTransition('forward');
                setCurrentStep(prev => prev + 1);
            } else {
                handleSubmit();
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            animateTransition('backward');
            setCurrentStep(prev => prev - 1);
        } else {
            handleCancel();
        }
    };

    const handleCancel = () => {
        // Check if any field has been filled
        const hasChanges = Object.values(eventData).some(value => value.trim() !== '');

        if (hasChanges) {
            Alert.alert(
                'Discard Changes?',
                'Are you sure you want to discard your event creation progress?',
                [
                    {
                        text: 'Keep Editing',
                        style: 'cancel'
                    },
                    {
                        text: 'Discard',
                        style: 'destructive',
                        onPress: () => router.back()
                    }
                ]
            );
        } else {
            router.back();
        }
    };

    const handleSubmit = async () => {
        Keyboard.dismiss();
        setIsSubmitting(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            console.log('Event Data:', eventData);
            router.back();
        } catch (error) {
            console.error('Error creating event:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const currentField = FORM_FIELDS[currentStep];

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={handleBack}
                    style={styles.backButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="arrow-back" size={24} color="#1A1D1F" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Create Event</Text>
                <TouchableOpacity
                    onPress={handleCancel}
                    style={styles.cancelButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                    <View
                        style={[
                            styles.progressFill,
                            { width: `${((currentStep + 1) / FORM_FIELDS.length) * 100}%` }
                        ]}
                    />
                </View>
                <Text style={styles.progressText}>
                    Step {currentStep + 1} of {FORM_FIELDS.length}
                </Text>
            </View>

            <View style={styles.formContainer}>
                <Animated.View
                    style={[
                        styles.inputContainer,
                        {
                            opacity: fadeAnim,
                            transform: [
                                {
                                    translateX: slideAnim.interpolate({
                                        inputRange: [-1, 0, 1],
                                        outputRange: [-300, 0, 300]
                                    })
                                }
                            ]
                        }
                    ]}
                >
                    <View style={styles.fieldIcon}>
                        <Ionicons name={currentField.icon as any} size={32} color="#1A866F" />
                    </View>

                    <Text style={styles.label}>{currentField.label}</Text>

                    <View style={[
                        styles.inputWrapper,
                        errors[currentField.key] && styles.inputWrapperError
                    ]}>
                        <TextInput
                            style={[
                                styles.input,
                                currentField.multiline && styles.textArea
                            ]}
                            value={eventData[currentField.key]}
                            onChangeText={(text) => {
                                setEventData({ ...eventData, [currentField.key]: text });
                                if (errors[currentField.key]) {
                                    setErrors({ ...errors, [currentField.key]: '' });
                                }
                            }}
                            placeholder={currentField.placeholder}
                            placeholderTextColor="#999"
                            multiline={currentField.multiline}
                            numberOfLines={currentField.multiline ? 4 : 1}
                            keyboardType={currentField.keyboardType}
                            autoFocus
                        />
                    </View>

                    {errors[currentField.key] && (
                        <Text style={styles.errorText}>{errors[currentField.key]}</Text>
                    )}
                </Animated.View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                    onPress={handleNext}
                    activeOpacity={0.8}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <>
                            <Text style={styles.submitButtonText}>
                                {currentStep === FORM_FIELDS.length - 1 ? 'Create Event' : 'Next'}
                            </Text>
                            {currentStep < FORM_FIELDS.length - 1 && (
                                <Ionicons name="arrow-forward" size={24} color="#FFFFFF" style={styles.nextIcon} />
                            )}
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
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
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: '600',
        color: '#1A1D1F',
        textAlign: 'center',
    },
    cancelButton: {
        padding: 8,
        marginLeft: 8,
    },
    cancelText: {
        fontSize: 16,
        color: '#EF4444',
        fontWeight: '500',
    },
    progressContainer: {
        padding: 16,
        backgroundColor: '#FFFFFF',
    },
    progressBar: {
        height: 4,
        backgroundColor: 'rgba(26, 134, 111, 0.2)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#1A866F',
        borderRadius: 2,
    },
    progressText: {
        marginTop: 8,
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    formContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    inputContainer: {
        alignItems: 'center',
    },
    fieldIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(26, 134, 111, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    label: {
        fontSize: 24,
        fontWeight: '600',
        color: '#1A1D1F',
        marginBottom: 16,
        textAlign: 'center',
    },
    inputWrapper: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'rgba(26, 29, 31, 0.12)',
        overflow: 'hidden',
    },
    inputWrapperError: {
        borderColor: '#FF4D4F',
    },
    input: {
        width: '100%',
        padding: 16,
        fontSize: 18,
        color: '#1A1D1F',
        textAlign: 'center',
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
        textAlign: 'left',
    },
    errorText: {
        color: '#FF4D4F',
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
    footer: {
        padding: 24,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: 'rgba(26, 29, 31, 0.08)',
    },
    submitButton: {
        backgroundColor: '#1A866F',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    submitButtonDisabled: {
        backgroundColor: '#1A866F80',
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    nextIcon: {
        marginLeft: 8,
    },
}); 