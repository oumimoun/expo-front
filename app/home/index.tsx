import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  ImageBackground,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import Nav from '@/components/Nav';


const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;

// Base colors will be overridden by theme colors
const COLORS = {
  background: '#FFFFFF',
  Green: '#1b8456',
  lightOrange: '#f5cbab',
  black: '#000000',
  greyText: '#555555',
  lightGreen: '#e0f0e9',
  lightGrey: '#f9f9f9',
  white: '#FFFFFF',
  red: '#ff4444',
};

type Category = {
  id: string;
  name: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
};

type Event = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  category: string;
  attendees: number;
  is_participant: boolean;
  description?: string;
  organizer?: string;
};

export default function Home() {

  const getAllEvents = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:3000/api/events', {
        withCredentials: true
      });
      console.log(response.data);
      if (response.data.success) {
        setEvents(response.data.events);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    getAllEvents();
  }, []);

  const { isDarkMode, colors } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>('All Events');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);

  const categories: Category[] = [
    { id: '1', name: 'All Events', color: COLORS.Green, icon: 'calendar' },
    { id: '2', name: 'Tech', color: '#3a7bd5', icon: 'laptop-outline' },
    { id: '3', name: 'Design', color: '#c471f5', icon: 'color-palette-outline' },
    { id: '4', name: 'Social', color: COLORS.lightOrange, icon: 'people-outline' },
    { id: '5', name: 'Business', color: '#4CAF50', icon: 'briefcase-outline' },
    { id: '6', name: 'Workshop', color: '#9C27B0', icon: 'construct-outline' },
  ];

  const featuredEvent = events[0] || null; // Assuming the first event is featured);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const expandAnim = useRef(new Animated.Value(0)).current;
  const [isAddEventModalVisible, setIsAddEventModalVisible] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: new Date(),
    time: new Date(),
    location: '',
    category: 'Tech',
    description: '',
    organizer: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [formErrors, setFormErrors] = useState({
    title: false,
    location: false,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState('');
  const loadingIconAnim = useRef(new Animated.Value(0)).current;

  const toggleEventExpansion = (eventId: string) => {
    setExpandedEventId(expandedEventId === eventId ? null : eventId);
    Animated.spring(expandAnim, {
      toValue: expandedEventId === eventId ? 0 : 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'Tech': return '#3a7bd5';
      case 'Design': return '#c471f5';
      case 'Social': return COLORS.lightOrange;
      default: return COLORS.Green;
    }
  };


  const handleEventPress = (event: Event) => {
    const currentEvent = events.find(e => e.id === event.id);
    if (currentEvent) {
      setSelectedEvent(currentEvent);
    }
  };

  const handleRegistration = async (eventId: string, e?: any) => {
    if (e) {
      e.stopPropagation();
    }

    const response = await axios.post(`http://localhost:3000/api/events/${eventId}/register`, {}, {
      withCredentials: true,
    });
    if (!response.data.success) {
      console.error('Failed to register for event:', response.data.message);
      return;
    }
    await getAllEvents();
    setSelectedEvent(null);
  };

  const handleFeaturedRegistration = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (featuredEvent) {
      handleRegistration(featuredEvent.id);
    }
  };

  const filteredEvents = events.filter(event =>
    selectedCategory === 'All Events' ? true : event.category === selectedCategory
  );

  const handleCategoryPress = (categoryName: string) => {
    setSelectedCategory(categoryName);
  };

  const handleAddEvent = async () => {
    // Validate form
    const errors = {
      title: !newEvent.title.trim(),
      location: !newEvent.location.trim(),
    };
    setFormErrors(errors);

    if (Object.values(errors).some(error => error)) {
      return;
    }
    const response = await axios.post('http://localhost:3000/api/events', {
      ...newEvent,
      date: newEvent.date.toISOString().split('T')[0],
      time: newEvent.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
      {
        withCredentials: true,
      }
    );
    if (response.data.success) {
      await getAllEvents();
      setIsAddEventModalVisible(false);
    } else {
      console.error('Failed to add event:', response.data.message);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setNewEvent({ ...newEvent, date: selectedDate });
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setNewEvent({ ...newEvent, time: selectedTime });
    }
  };

  const renderEventCard = (item: Event) => {
    return (
      <Animated.View
        key={item.id}
        style={[
          styles.eventCard,
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleEventPress(item)}
          style={styles.eventCardInner}
        >
          <View style={[
            styles.eventCircle,
            {
              backgroundColor: isDarkMode
                ? `${getCategoryColor(item.category)}30`
                : getCategoryColor(item.category),
              padding: 12,
              borderRadius: 12
            }
          ]}>
            <Ionicons
              name="calendar"
              size={24}
              color={isDarkMode ? getCategoryColor(item.category) : colors.white}
            />
          </View>

          <View style={styles.eventContent}>
            <View style={styles.eventHeader}>
              <Text style={[styles.eventTitle, { color: colors.text }]}>{item.title}</Text>
              <View style={[styles.categoryPill, { backgroundColor: `${getCategoryColor(item.category)}20` }]}>
                <Text style={[styles.categoryPillText, { color: getCategoryColor(item.category) }]}>
                  {item.category}
                </Text>
              </View>
            </View>

            <View style={styles.eventDetails}>
              <View style={styles.eventDetailRow}>
                <View style={styles.eventDetail}>
                  <Ionicons name="calendar-outline" size={16} color={colors.greyText} />
                  <Text style={[styles.eventDetailText, { color: colors.greyText }]}>{item.date}</Text>
                </View>
                <View style={styles.eventDetail}>
                  <Ionicons name="time-outline" size={16} color={colors.greyText} />
                  <Text style={[styles.eventDetailText, { color: colors.greyText }]}>{item.time}</Text>
                </View>
              </View>

              <View style={styles.eventDetailRow}>
                <View style={styles.eventDetail}>
                  <Ionicons name="location-outline" size={16} color={colors.greyText} />
                  <Text style={[styles.eventDetailText, { color: colors.greyText }]}>{item.location}</Text>
                </View>
                <View style={styles.eventDetail}>
                  <Ionicons name="people-outline" size={16} color={colors.greyText} />
                  <Text style={[styles.eventDetailText, { color: colors.greyText }]}>{item.attendees} attending</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.cardArrow}>
            <Ionicons name="chevron-forward" size={20} color={colors.greyText} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const refreshEvents = useCallback(() => {
    // Simulate fetching new events
    const newEvents = [
      ...events,
      {
        id: (events.length + 1).toString(),
        title: 'New Tech Meetup',
        date: '2024-08-01',
        time: '6:00 PM',
        location: 'Innovation Hub',
        category: 'Tech',
        attendees: 0,
        is_participant: false,
        description: 'Join us for an evening of networking and tech talks!',
        organizer: 'Tech Community'
      }
    ];
    return newEvents;
  }, [events]);

  const startLoadingAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(loadingIconAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(loadingIconAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setIsLoading(true);
    setRefreshMessage('Updating events...');

    // Simulate API call and data refresh
    setTimeout(async () => {
      try {
        const updatedEvents = [...events];
        setEvents(updatedEvents);
        setRefreshMessage('Events updated successfully!');

        // Show success message briefly
        setTimeout(() => {
          setRefreshMessage('');
        }, 2000);
      } catch (error) {
        setRefreshMessage('Failed to update events. Pull to try again.');
      } finally {
        setRefreshing(false);
        setIsLoading(false);
      }
    }, 1500);
  }, [events]);

  const spin = loadingIconAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
        translucent={true}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Events</Text>
        </View>

        {/* Refresh Message */}
        {refreshMessage ? (
          <Animated.View style={[styles.refreshMessageContainer, { backgroundColor: colors.lightGreen }]}>
            <Text style={[styles.refreshMessageText, { color: colors.green }]}>{refreshMessage}</Text>
          </Animated.View>
        ) : null}

        {/* Main Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.background }]}
          bounces={true}
          overScrollMode="never"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.green]}
              tintColor={colors.green}
            />
          }
        >
          {/* Featured Event */}
          {featuredEvent && (
            <View style={styles.featuredContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured Event</Text>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => handleEventPress(featuredEvent)}
              >
                <ImageBackground
                  source={require('../../assets/images/lamrabti.jpg')}
                  style={styles.featuredCard}
                  imageStyle={{ borderRadius: 16 }}
                >
                  <View style={[styles.overlay, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.4)' }]} />
                  <View style={styles.featuredContent}>
                    <View style={styles.featuredHeader}>
                      <View style={[styles.categoryPill, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                        <Text style={[styles.categoryPillText, { color: COLORS.white }]}>
                          {featuredEvent.category}
                        </Text>
                      </View>
                      {featuredEvent.is_participant && (
                        <View style={[styles.categoryPill, { backgroundColor: COLORS.Green }]}>
                          <Ionicons name="checkmark-circle" size={14} color={COLORS.white} />
                          <Text style={[styles.categoryPillText, { color: COLORS.white, marginLeft: 4 }]}>
                            Registered
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.featuredTitle}>{featuredEvent.title}</Text>

                    <View style={styles.featuredInfo}>
                      <View style={styles.featuredDetailRow}>
                        <Ionicons name="calendar-outline" size={16} color={COLORS.white} />
                        <Text style={styles.featuredDetailText}>{featuredEvent.date}</Text>
                      </View>
                      <View style={styles.featuredDetailRow}>
                        <Ionicons name="time-outline" size={16} color={COLORS.white} />
                        <Text style={styles.featuredDetailText}>{featuredEvent.date}</Text>
                      </View>
                      <View style={styles.featuredDetailRow}>
                        <Ionicons name="location-outline" size={16} color={COLORS.white} />
                        <Text style={styles.featuredDetailText}>{featuredEvent.location}</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.registerButton,
                        { backgroundColor: featuredEvent.is_participant ? COLORS.red : COLORS.Green }
                      ]}
                      onPress={handleFeaturedRegistration}
                    >
                      <Text style={styles.registerButtonText}>
                        {featuredEvent.is_participant ? 'Unregister' : 'Register Now'}
                      </Text>
                      <Ionicons
                        name={featuredEvent.is_participant ? 'close-circle' : 'arrow-forward'}
                        size={20}
                        color={COLORS.white}
                      />
                    </TouchableOpacity>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            </View>
          )}

          {/* Categories */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Categories</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
              decelerationRate="fast"
            >
              {categories.map((category) => {
                const isSelected = selectedCategory === category.name;
                const buttonScale = useRef(new Animated.Value(1)).current;

                return (
                  <Pressable
                    key={category.id}
                    style={styles.categoryButton}
                    onPressIn={() => handlePressIn()}
                    onPressOut={() => handlePressOut()}
                    onPress={() => handleCategoryPress(category.name)}
                  >
                    <Animated.View style={[
                      styles.categoryCard,
                      {
                        backgroundColor: isSelected
                          ? category.color
                          : isDarkMode
                            ? colors.surface
                            : `${category.color}10`,
                        borderWidth: 1.5,
                        borderColor: isSelected ? 'transparent' : category.color,
                        transform: [{ scale: buttonScale }]
                      }
                    ]}>
                      <View style={[
                        styles.categoryIcon,
                        {
                          backgroundColor: isSelected
                            ? 'rgba(255,255,255,0.2)'
                            : isDarkMode
                              ? `${category.color}30`
                              : `${category.color}15`,
                          padding: 12,
                          borderRadius: 12,
                        }
                      ]}>
                        <Ionicons
                          name={category.icon}
                          size={24}
                          color={isSelected ? colors.white : category.color}
                          style={{ opacity: isSelected ? 1 : isDarkMode ? 1 : 0.9 }}
                        />
                      </View>
                      <Text style={[
                        styles.categoryText,
                        {
                          color: isSelected
                            ? colors.white
                            : isDarkMode
                              ? category.color
                              : category.color,
                          fontWeight: isSelected ? '700' : '600',
                          marginTop: 8
                        }
                      ]}>
                        {category.name}
                      </Text>
                    </Animated.View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Events List */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Upcoming Events</Text>
              <Text style={[styles.eventCount, { color: colors.greyText }]}>{filteredEvents.length} events</Text>
            </View>
            <View style={styles.eventsContainer}>
              {filteredEvents.map(event => (
                <TouchableOpacity
                  key={event.id}
                  style={[styles.eventCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  activeOpacity={0.8}
                  onPress={() => handleEventPress(event)}
                >
                  <View style={styles.eventCardInner}>
                    <View style={[
                      styles.eventCircle,
                      {
                        backgroundColor: isDarkMode
                          ? `${getCategoryColor(event.category)}30`
                          : getCategoryColor(event.category),
                        padding: 12,
                        borderRadius: 12
                      }
                    ]}>
                      <Ionicons
                        name="calendar"
                        size={24}
                        color={isDarkMode ? getCategoryColor(event.category) : colors.white}
                      />
                    </View>

                    <View style={styles.eventContent}>
                      <View style={styles.eventHeader}>
                        <Text style={[styles.eventTitle, { color: colors.text }]}>{event.title}</Text>
                        <View style={[styles.categoryPill, { backgroundColor: `${getCategoryColor(event.category)}20` }]}>
                          <Text style={[styles.categoryPillText, { color: getCategoryColor(event.category) }]}>
                            {event.category}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.eventDetails}>
                        <View style={styles.eventDetailRow}>
                          <View style={styles.eventDetail}>
                            <Ionicons name="calendar-outline" size={16} color={colors.greyText} />
                            <Text style={[styles.eventDetailText, { color: colors.greyText }]}>{event.date}</Text>
                          </View>
                          <View style={styles.eventDetail}>
                            <Ionicons name="time-outline" size={16} color={colors.greyText} />
                            <Text style={[styles.eventDetailText, { color: colors.greyText }]}>{event.time}</Text>
                          </View>
                        </View>

                        <View style={styles.eventDetailRow}>
                          <View style={styles.eventDetail}>
                            <Ionicons name="location-outline" size={16} color={colors.greyText} />
                            <Text style={[styles.eventDetailText, { color: colors.greyText }]}>{event.location}</Text>
                          </View>
                          <View style={styles.eventDetail}>
                            <Ionicons name="people-outline" size={16} color={colors.greyText} />
                            <Text style={[styles.eventDetailText, { color: colors.greyText }]}>{event.attendees} attending</Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    <View style={styles.cardArrow}>
                      <Ionicons name="chevron-forward" size={20} color={colors.greyText} />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
              {filteredEvents.length === 0 && (
                <View style={[styles.noEventsContainer, { backgroundColor: colors.lightGrey }]}>
                  <Ionicons name="calendar-outline" size={48} color={colors.greyText} />
                  <Text style={[styles.noEventsText, { color: colors.greyText }]}>No events in this category</Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
      <View style={[styles.navContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <Nav />
      </View>

      {/* Event Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={selectedEvent !== null}
        onRequestClose={() => setSelectedEvent(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedEvent(null)}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>

              {selectedEvent && (
                <View style={styles.modalBody}>
                  <View style={[styles.modalEventCircle, {
                    backgroundColor: isDarkMode
                      ? `${getCategoryColor(selectedEvent.category)}30`
                      : getCategoryColor(selectedEvent.category),
                  }]}>
                    <Ionicons
                      name="calendar"
                      size={32}
                      color={isDarkMode ? getCategoryColor(selectedEvent.category) : colors.white}
                    />
                  </View>

                  <Text style={[styles.modalTitle, { color: colors.text }]}>{selectedEvent.title}</Text>

                  <View style={[styles.categoryPill, {
                    backgroundColor: `${getCategoryColor(selectedEvent.category)}20`,
                    alignSelf: 'center',
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                  }]}>
                    <Text style={[styles.categoryPillText, {
                      color: getCategoryColor(selectedEvent.category),
                      fontSize: 14,
                    }]}>
                      {selectedEvent.category}
                    </Text>
                  </View>

                  <View style={styles.registrationStatus}>
                    <Text style={[
                      styles.registrationStatusText,
                      { color: selectedEvent.is_participant ? colors.green : colors.greyText }
                    ]}>
                      {selectedEvent.is_participant ? '✓ You are registered' : 'Not registered yet'}
                    </Text>
                  </View>

                  <View style={[styles.modalDetailsSection, { backgroundColor: colors.lightGrey }]}>
                    <View style={styles.modalDetailRow}>
                      <Ionicons name="calendar-outline" size={22} color={colors.greyText} />
                      <Text style={[styles.modalDetailText, { color: colors.text }]}>{selectedEvent.date}</Text>
                    </View>
                    <View style={styles.modalDetailRow}>
                      <Ionicons name="time-outline" size={22} color={colors.greyText} />
                      <Text style={[styles.modalDetailText, { color: colors.text }]}>{selectedEvent.time}</Text>
                    </View>
                    <View style={styles.modalDetailRow}>
                      <Ionicons name="location-outline" size={22} color={colors.greyText} />
                      <Text style={[styles.modalDetailText, { color: colors.text }]}>{selectedEvent.location}</Text>
                    </View>
                    <View style={styles.modalDetailRow}>
                      <Ionicons name="people-outline" size={22} color={colors.greyText} />
                      <Text style={[styles.modalDetailText, { color: colors.text }]}>{selectedEvent.attendees} attending</Text>
                    </View>
                    {selectedEvent.organizer && (
                      <View style={styles.modalDetailRow}>
                        <Ionicons name="person-outline" size={22} color={colors.greyText} />
                        <Text style={[styles.modalDetailText, { color: colors.text }]}>Organized by {selectedEvent.organizer}</Text>
                      </View>
                    )}
                  </View>

                  {selectedEvent.description && (
                    <View style={[styles.descriptionSection, { backgroundColor: colors.surface }]}>
                      <Text style={[styles.descriptionTitle, { color: colors.text }]}>About Event</Text>
                      <Text style={[styles.descriptionText, { color: colors.greyText }]}>{selectedEvent.description}</Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={[
                      styles.registrationButton,
                      { backgroundColor: selectedEvent.is_participant ? colors.red : colors.green }
                    ]}
                    onPress={() => handleRegistration(selectedEvent.id)}
                  >
                    <Text style={[styles.registrationButtonText, { color: colors.white }]}>
                      {selectedEvent.is_participant ? 'Cancel Registration' : 'Register for Event'}
                    </Text>
                    <Ionicons
                      name={selectedEvent.is_participant ? 'close-circle' : 'checkmark-circle'}
                      size={24}
                      color={colors.white}
                    />
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add Event Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isAddEventModalVisible}
        onRequestClose={() => setIsAddEventModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.modalHeaderTitle, { color: colors.text }]}>Add New Event</Text>
                <TouchableOpacity
                  style={[styles.closeButton, { backgroundColor: colors.lightGrey }]}
                  onPress={() => setIsAddEventModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.formContainer}>
                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: colors.text }]}>Event Title *</Text>
                  <TextInput
                    style={[
                      styles.formInput,
                      {
                        backgroundColor: isDarkMode ? colors.surface : colors.lightGrey,
                        color: colors.text,
                        borderColor: formErrors.title ? colors.red : colors.border
                      },
                      formErrors.title && styles.formInputError
                    ]}
                    value={newEvent.title}
                    onChangeText={(text) => {
                      setNewEvent({ ...newEvent, title: text });
                      setFormErrors({ ...formErrors, title: false });
                    }}
                    placeholder="Enter event title"
                    placeholderTextColor={colors.greyText}
                  />
                  {formErrors.title && (
                    <Text style={[styles.errorText, { color: colors.red }]}>Title is required</Text>
                  )}
                </View>

                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: colors.text }]}>Category</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categorySelector}
                  >
                    {categories.slice(1).map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.categorySelectorItem,
                          {
                            backgroundColor: newEvent.category === category.name
                              ? category.color
                              : isDarkMode
                                ? `${category.color}30`
                                : `${category.color}20`
                          }
                        ]}
                        onPress={() => setNewEvent({ ...newEvent, category: category.name })}
                      >
                        <Ionicons
                          name={category.icon}
                          size={20}
                          color={newEvent.category === category.name ? colors.white : category.color}
                        />
                        <Text
                          style={[
                            styles.categorySelectorText,
                            { color: newEvent.category === category.name ? colors.white : category.color }
                          ]}
                        >
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.formRow}>
                  <TouchableOpacity
                    style={[styles.dateTimeButton, {
                      backgroundColor: isDarkMode ? colors.surface : colors.lightGrey,
                      borderColor: colors.border
                    }]}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Ionicons name="calendar-outline" size={22} color={colors.green} />
                    <Text style={[styles.dateTimeText, { color: colors.text }]}>
                      {newEvent.date.toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.dateTimeButton, {
                      backgroundColor: isDarkMode ? colors.surface : colors.lightGrey,
                      borderColor: colors.border
                    }]}
                    onPress={() => setShowTimePicker(true)}
                  >
                    <Ionicons name="time-outline" size={22} color={colors.green} />
                    <Text style={[styles.dateTimeText, { color: colors.text }]}>
                      {newEvent.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: colors.text }]}>Location *</Text>
                  <TextInput
                    style={[
                      styles.formInput,
                      {
                        backgroundColor: isDarkMode ? colors.surface : colors.lightGrey,
                        color: colors.text,
                        borderColor: formErrors.location ? colors.red : colors.border
                      },
                      formErrors.location && styles.formInputError
                    ]}
                    value={newEvent.location}
                    onChangeText={(text) => {
                      setNewEvent({ ...newEvent, location: text });
                      setFormErrors({ ...formErrors, location: false });
                    }}
                    placeholder="Enter event location"
                    placeholderTextColor={colors.greyText}
                  />
                  {formErrors.location && (
                    <Text style={[styles.errorText, { color: colors.red }]}>Location is required</Text>
                  )}
                </View>

                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: colors.text }]}>Organizer</Text>
                  <TextInput
                    style={[
                      styles.formInput,
                      {
                        backgroundColor: isDarkMode ? colors.surface : colors.lightGrey,
                        color: colors.text,
                        borderColor: colors.border
                      }
                    ]}
                    value={newEvent.organizer}
                    onChangeText={(text) => setNewEvent({ ...newEvent, organizer: text })}
                    placeholder="Enter organizer name"
                    placeholderTextColor={colors.greyText}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={[styles.formLabel, { color: colors.text }]}>Description</Text>
                  <TextInput
                    style={[
                      styles.formInput,
                      styles.textArea,
                      {
                        backgroundColor: isDarkMode ? colors.surface : colors.lightGrey,
                        color: colors.text,
                        borderColor: colors.border
                      }
                    ]}
                    value={newEvent.description}
                    onChangeText={(text) => setNewEvent({ ...newEvent, description: text })}
                    placeholder="Enter event description"
                    placeholderTextColor={colors.greyText}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                <TouchableOpacity
                  style={[styles.submitButton, { backgroundColor: colors.green }]}
                  onPress={handleAddEvent}
                >
                  <Text style={[styles.submitButtonText, { color: colors.white }]}>Create Event</Text>
                  <Ionicons name="arrow-forward" size={24} color={colors.white} />
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Date/Time Pickers */}
      {showDatePicker && (
        <DateTimePicker
          value={newEvent.date}
          mode="date"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={newEvent.time}
          mode="time"
          onChange={handleTimeChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  featuredContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  featuredCard: {
    width: '100%',
    height: CARD_WIDTH * 0.8,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 15,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  featuredContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-end',
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  featuredTitle: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 24,
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  featuredInfo: {
    marginBottom: 20,
    gap: 8,
  },
  featuredDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featuredDetailText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    gap: 8,
  },
  registerButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 15,
  },
  categoriesContainer: {
    paddingRight: 20,
    gap: 12,
  },
  categoryButton: {
    marginLeft: 20,
    marginVertical: 10,
  },
  categoryCard: {
    borderRadius: 16,
    padding: 16,
    minWidth: 100,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  categoryIcon: {
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  categoryText: {
    fontSize: 14,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  eventCount: {
    fontSize: 14,
    color: COLORS.greyText,
    fontWeight: '500',
  },
  noEventsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: COLORS.lightGrey,
    borderRadius: 16,
    gap: 12,
  },
  noEventsText: {
    fontSize: 16,
    color: COLORS.greyText,
    textAlign: 'center',
  },
  eventCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  eventCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
    position: 'relative',
  },
  eventCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventContent: {
    flex: 1,
    gap: 12,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    flex: 1,
  },
  eventDetails: {
    gap: 8,
  },
  eventDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  eventDetailText: {
    fontSize: 14,
    color: COLORS.greyText,
  },
  cardArrow: {
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 16,
    marginRight: -16,
  },
  modalBody: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 16,
    textAlign: 'center',
  },
  registrationStatus: {
    marginTop: 16,
    marginBottom: 8,
  },
  registrationStatusText: {
    fontSize: 15,
    fontWeight: '600',
  },
  modalDetailsSection: {
    width: '100%',
    backgroundColor: COLORS.lightGrey,
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    gap: 16,
  },
  modalDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  modalDetailText: {
    fontSize: 16,
    color: COLORS.black,
    flex: 1,
  },
  descriptionSection: {
    width: '100%',
    marginTop: 24,
    backgroundColor: COLORS.white,
    padding: 4,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    color: COLORS.greyText,
    lineHeight: 24,
  },
  registrationButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 32,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  registrationButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: 'bold',
  },
  modalEventCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  modalHeaderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  formContainer: {
    gap: 20,
    paddingBottom: 20,
  },
  formGroup: {
    gap: 8,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
  },
  formInput: {
    backgroundColor: COLORS.lightGrey,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.black,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  formInputError: {
    borderColor: COLORS.red,
  },
  errorText: {
    color: COLORS.red,
    fontSize: 14,
    marginTop: 4,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.lightGrey,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  dateTimeText: {
    fontSize: 16,
    color: COLORS.black,
  },
  categorySelector: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8,
  },
  categorySelectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  categorySelectorText: {
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: COLORS.Green,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  refreshMessageContainer: {
    backgroundColor: COLORS.lightGreen,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  refreshMessageText: {
    color: COLORS.Green,
    fontSize: 14,
    fontWeight: '600',
  },
  loadingIcon: {
    width: 18,
    height: 18,
  },
  navContainer: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  eventsContainer: {
    gap: 12,
  },
});