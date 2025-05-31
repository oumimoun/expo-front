import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
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

export default function CreateEventScreen() {
    const router = useRouter();
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
    const [activeField, setActiveField] = useState<keyof EventFormData | null>(null);
    const submitButtonAnimation = new Animated.Value(1);

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};

        if (!eventData.title.trim()) {
            newErrors.title = 'Title is required';
        }
        if (!eventData.description.trim()) {
            newErrors.description = 'Description is required';
        }
        if (!eventData.location.trim()) {
            newErrors.location = 'Location is required';
        }
        if (!eventData.date.trim()) {
            newErrors.date = 'Date is required';
        }
        if (!eventData.time.trim()) {
            newErrors.time = 'Time is required';
        }
        if (!eventData.capacity.trim()) {
            newErrors.capacity = 'Capacity is required';
        } else if (isNaN(Number(eventData.capacity))) {
            newErrors.capacity = 'Capacity must be a number';
        }
        if (!eventData.price.trim()) {
            newErrors.price = 'Price is required';
        } else if (isNaN(Number(eventData.price))) {
            newErrors.price = 'Price must be a number';
        }
        if (!eventData.category.trim()) {
            newErrors.category = 'Category is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        Keyboard.dismiss();

        if (!validateForm()) {
            // Animate button shake for invalid form
            Animated.sequence([
                Animated.timing(submitButtonAnimation, {
                    toValue: 1.1,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(submitButtonAnimation, {
                    toValue: 0.9,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(submitButtonAnimation, {
                    toValue: 1,
                    duration: 100,
                    useNativeDriver: true,
                }),
            ]).start();
            return;
        }

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

    const renderInput = (
        label: string,
        field: keyof EventFormData,
        placeholder: string,
        multiline: boolean = false,
        keyboardType: 'default' | 'numeric' = 'default',
        icon?: string
    ) => (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <View style={[
                styles.inputWrapper,
                activeField === field && styles.inputWrapperFocused,
                errors[field] && styles.inputWrapperError
            ]}>
                {icon && (
                    <Ionicons
                        name={icon as any}
                        size={20}
                        color={activeField === field ? '#1A866F' : '#999'}
                        style={styles.inputIcon}
                    />
                )}
                <TextInput
                    style={[
                        styles.input,
                        multiline && styles.textArea,
                        icon && styles.inputWithIcon
                    ]}
                    value={eventData[field]}
                    onChangeText={(text) => {
                        setEventData({ ...eventData, [field]: text });
                        if (errors[field]) {
                            setErrors({ ...errors, [field]: '' });
                        }
                    }}
                    onFocus={() => setActiveField(field)}
                    onBlur={() => setActiveField(null)}
                    placeholder={placeholder}
                    placeholderTextColor="#999"
                    multiline={multiline}
                    numberOfLines={multiline ? 4 : 1}
                    keyboardType={keyboardType}
                />
            </View>
            {errors[field] && (
                <Text style={styles.errorText}>{errors[field]}</Text>
            )}
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="arrow-back" size={24} color="#1A1D1F" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Create Event</Text>
            </View>

            <ScrollView
                style={styles.form}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {renderInput('Event Title', 'title', 'Enter event title', false, 'default', 'bookmark-outline')}
                {renderInput('Description', 'description', 'Enter event description', true, 'default', 'document-text-outline')}
                {renderInput('Location', 'location', 'Enter event location', false, 'default', 'location-outline')}
                {renderInput('Date', 'date', 'DD/MM/YYYY', false, 'default', 'calendar-outline')}
                {renderInput('Time', 'time', 'HH:MM', false, 'default', 'time-outline')}
                {renderInput('Category', 'category', 'Enter event category', false, 'default', 'pricetag-outline')}
                {renderInput('Capacity', 'capacity', 'Enter maximum capacity', false, 'numeric', 'people-outline')}
                {renderInput('Price', 'price', 'Enter ticket price', false, 'numeric', 'cash-outline')}

                <Animated.View style={{ transform: [{ scale: submitButtonAnimation }] }}>
                    <TouchableOpacity
                        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        activeOpacity={0.8}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.submitButtonText}>Create Event</Text>
                        )}
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
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
        fontSize: 20,
        fontWeight: '600',
        color: '#1A1D1F',
    },
    form: {
        padding: 16,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1A1D1F',
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(26, 29, 31, 0.12)',
        overflow: 'hidden',
    },
    inputWrapperFocused: {
        borderColor: '#1A866F',
        borderWidth: 2,
    },
    inputWrapperError: {
        borderColor: '#FF4D4F',
    },
    inputIcon: {
        padding: 12,
    },
    input: {
        flex: 1,
        padding: 12,
        fontSize: 16,
        color: '#1A1D1F',
    },
    inputWithIcon: {
        paddingLeft: 0,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    errorText: {
        color: '#FF4D4F',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
    submitButton: {
        backgroundColor: '#1A866F',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
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
        fontSize: 16,
        fontWeight: '600',
    },
}); 