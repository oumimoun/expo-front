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
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useTheme } from '../theme/ThemeContext';

interface EventFormData {
    title: string;
    description: string;
    location: string;
    date: string;
    time: string;
    capacity: string;
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
];

export default function CreateEventScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const [currentStep, setCurrentStep] = useState(0);
    const [eventData, setEventData] = useState<EventFormData>({
        title: '',
        description: '',
        location: '',
        date: '',
        time: '',
        capacity: '',
        category: ''
    });
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const slideAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(1)).current;

    const showErrorToast = (message: string) => {
        Toast.show({
            type: 'error',
            text1: 'Validation Error',
            text2: message,
            position: 'top',
            visibilityTime: 3000,
            topOffset: 56,
            props: {
                style: {
                    backgroundColor: '#FF4444',
                    borderRadius: 8,
                    marginHorizontal: 16,
                },
                textStyle: {
                    color: '#FFFFFF',
                    fontSize: 14,
                },
            },
        });
    };

    const validateField = (field: keyof EventFormData): boolean => {
        const value = eventData[field];
        const newErrors: ValidationErrors = {};

        if (!value.trim()) {
            newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
            showErrorToast(newErrors[field]);
        } else if (field === 'capacity' && isNaN(Number(value))) {
            newErrors[field] = 'Capacity must be a number';
            showErrorToast(newErrors[field]);
        } else if (field === 'date') {
            const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
            if (!dateRegex.test(value)) {
                newErrors[field] = 'Date must be in DD/MM/YYYY format';
                showErrorToast(newErrors[field]);
            } else {
                const [day, month, year] = value.split('/').map(Number);
                const date = new Date(year, month - 1, day);
                if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
                    newErrors[field] = 'Please enter a valid date';
                    showErrorToast(newErrors[field]);
                } else if (date < new Date(new Date().setHours(0, 0, 0, 0))) {
                    newErrors[field] = 'Date cannot be in the past';
                    showErrorToast(newErrors[field]);
                }
            }
        } else if (field === 'time') {
            const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
            if (!timeRegex.test(value)) {
                newErrors[field] = 'Time must be in HH:MM format (24h)';
                showErrorToast(newErrors[field]);
            }
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
                        onPress: () => {
                            Toast.show({
                                type: 'info',
                                text1: 'Changes Discarded',
                                text2: 'Your event creation has been cancelled',
                                position: 'top',
                                topOffset: 56,
                                visibilityTime: 2000,
                                props: {
                                    style: {
                                        backgroundColor: '#FF4444',
                                        borderRadius: 8,
                                        marginHorizontal: 16,
                                    },
                                    textStyle: {
                                        color: '#FFFFFF',
                                        fontSize: 14,
                                    },
                                },
                            });
                            router.back();
                        }
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
    const styles = makeStyles(theme);

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
        >
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={handleBack}
                    style={styles.backButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
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

            <View style={styles.content}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Animated.View
                        style={[
                            styles.formContainer,
                            {
                                opacity: fadeAnim,
                                transform: [
                                    {
                                        translateX: slideAnim.interpolate({
                                            inputRange: [-1, 0, 1],
                                            outputRange: ['-100%', '0%', '100%']
                                        })
                                    }
                                ]
                            }
                        ]}
                    >
                        <View style={styles.fieldContainer}>
                            <Text style={styles.label}>{currentField.label}</Text>
                            <View style={[
                                styles.inputContainer,
                                currentField.multiline && styles.multilineContainer,
                                errors[currentField.key] && styles.inputError
                            ]}>
                                <Ionicons name={currentField.icon as any} size={20} color={theme.textSecondary} style={styles.inputIcon} />
                                <TextInput
                                    style={[
                                        styles.input,
                                        currentField.multiline && styles.multilineInput,
                                    ]}
                                    placeholder={currentField.placeholder}
                                    placeholderTextColor={theme.textSecondary}
                                    value={eventData[currentField.key]}
                                    onChangeText={(text) => {
                                        setEventData(prev => ({ ...prev, [currentField.key]: text }));
                                        if (errors[currentField.key]) {
                                            setErrors(prev => ({ ...prev, [currentField.key]: '' }));
                                        }
                                    }}
                                    multiline={currentField.multiline}
                                    keyboardType={currentField.keyboardType}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>
                            {errors[currentField.key] && (
                                <Text style={styles.errorText}>{errors[currentField.key]}</Text>
                            )}
                        </View>
                    </Animated.View>
                </ScrollView>

                <View style={styles.footer}>
                    <View style={styles.progressContainer}>
                        {FORM_FIELDS.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.progressDot,
                                    index === currentStep && styles.progressDotActive,
                                    index < currentStep && styles.progressDotCompleted
                                ]}
                            />
                        ))}
                    </View>

                    <View style={styles.buttonContainer}>
                        {currentStep > 0 && (
                            <TouchableOpacity
                                style={[styles.button, styles.prevButton]}
                                onPress={handleBack}
                            >
                                <Text style={[styles.buttonText, styles.prevButtonText]}>Previous</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={[
                                styles.button,
                                styles.nextButton,
                                currentStep === 0 && styles.fullWidthButton,
                                isSubmitting && styles.buttonDisabled
                            ]}
                            onPress={handleNext}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color={theme.surface} />
                            ) : (
                                <Text style={styles.buttonText}>
                                    {currentStep === FORM_FIELDS.length - 1 ? 'Create Event' : 'Next'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            <Toast />
        </KeyboardAvoidingView>
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
        justifyContent: 'space-between',
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
    },
    cancelButton: {
        padding: 8,
        backgroundColor: theme.mode === 'dark' ? '#661A1A' : '#FFE5E5',
        borderRadius: 8,
    },
    cancelText: {
        fontSize: 16,
        color: theme.mode === 'dark' ? '#FF6666' : '#FF4444',
        fontWeight: '500',
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
    },
    scrollContent: {
        flexGrow: 1,
    },
    formContainer: {
        flex: 1,
        padding: 24,
        paddingBottom: 48,
    },
    fieldContainer: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: theme.text,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: theme.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: `${theme.border}30`,
        paddingHorizontal: 16,
        minHeight: 48,
    },
    inputIcon: {
        marginRight: 12,
        marginTop: 14,
    },
    input: {
        flex: 1,
        minHeight: 48,
        fontSize: 16,
        color: theme.text,
        paddingVertical: 12,
    },
    multilineContainer: {
        minHeight: 120,
    },
    multilineInput: {
        height: 120,
        textAlignVertical: 'top',
    },
    inputError: {
        borderColor: theme.error,
    },
    errorText: {
        color: '#FFFFFF',
        fontSize: 14,
        marginTop: 4,
        backgroundColor: '#FF4444',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 6,
        overflow: 'hidden',
        opacity: 0.9,
    },
    footer: {
        padding: 24,
        backgroundColor: theme.surface,
        borderTopWidth: 1,
        borderTopColor: `${theme.border}20`,
    },
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 24,
    },
    progressDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: `${theme.border}30`,
        marginHorizontal: 4,
    },
    progressDotActive: {
        backgroundColor: theme.primary,
        transform: [{ scale: 1.5 }],
    },
    progressDotCompleted: {
        backgroundColor: theme.primary,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        height: 56,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    prevButton: {
        backgroundColor: `${theme.border}20`,
    },
    nextButton: {
        backgroundColor: theme.primary,
    },
    fullWidthButton: {
        flex: 2,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.surface,
    },
    prevButtonText: {
        color: theme.text,
    },
    buttonDisabled: {
        backgroundColor: theme.disabled,
    },
}); 