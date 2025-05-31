import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  ImageBackground,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Nav from '../../components/Nav';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;
const CIRCLE_SIZE = width * 0.6;

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
  isRegistered: boolean;
  description?: string;
  organizer?: string;
};

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Events');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Tech Innovation Summit 2024',
      date: '2024-07-15',
      time: '10:00 AM',
      location: 'Convention Center',
      category: 'Tech',
      attendees: 500,
      isRegistered: false,
      description: 'Join us for the biggest tech event of the year. Experience the future of technology.',
      organizer: 'Tech Community',
    },
    {
      id: '2',
      title: 'Expo Routing Deep Dive',
      date: '2025-06-15',
      time: '2:00 PM',
      location: 'Developer Space',
      category: 'Tech',
      attendees: 30,
      isRegistered: false,
    },
    {
      id: '3',
      title: 'UI Design Inspiration',
      date: '2025-06-20',
      time: '11:00 AM',
      location: 'Design Studio',
      category: 'Design',
      attendees: 25,
      isRegistered: true,
    },
    {
      id: '4',
      title: 'Team Building Day',
      date: '2025-06-25',
      time: '3:00 PM',
      location: 'Central Park',
      category: 'Social',
      attendees: 50,
      isRegistered: false,
    },
  ]);

  const categories: Category[] = [
    { id: '1', name: 'All Events', color: COLORS.Green, icon: 'calendar' },
    { id: '2', name: 'Tech', color: '#3a7bd5', icon: 'laptop-outline' },
    { id: '3', name: 'Design', color: '#c471f5', icon: 'color-palette-outline' },
    { id: '4', name: 'Social', color: COLORS.lightOrange, icon: 'people-outline' },
    { id: '5', name: 'Business', color: '#4CAF50', icon: 'briefcase-outline' },
    { id: '6', name: 'Workshop', color: '#9C27B0', icon: 'construct-outline' },
  ];

  const featuredEvent = events.find(event => event.id === '1');
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const expandAnim = useRef(new Animated.Value(0)).current;
  const [pressedButton, setPressedButton] = useState<string | null>(null);
  const [pressedDetails, setPressedDetails] = useState<string | null>(null);
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

  const formatDate = (dateString: string) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const handleEventPress = (event: Event) => {
    const currentEvent = events.find(e => e.id === event.id);
    if (currentEvent) {
      setSelectedEvent(currentEvent);
    }
  };

  const handleRegistration = (eventId: string, e?: any) => {
    if (e) {
      e.stopPropagation();
    }

    const updatedEvents = events.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          isRegistered: !event.isRegistered,
          attendees: event.isRegistered ? event.attendees - 1 : event.attendees + 1
        };
      }
      return event;
    });

    setEvents(updatedEvents);

    if (selectedEvent?.id === eventId) {
      const updatedEvent = updatedEvents.find(e => e.id === eventId);
      if (updatedEvent) {
        setSelectedEvent(updatedEvent);
      }
    }
  };

  const handleFeaturedRegistration = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    handleRegistration(featuredEvent.id);
  };

  const filteredEvents = events.filter(event =>
    selectedCategory === 'All Events' ? true : event.category === selectedCategory
  );

  const handleCategoryPress = (categoryName: string) => {
    setSelectedCategory(categoryName);
  };

  const handleAddEvent = () => {
    // Validate form
    const errors = {
      title: !newEvent.title.trim(),
      location: !newEvent.location.trim(),
    };
    setFormErrors(errors);

    if (Object.values(errors).some(error => error)) {
      return;
    }

    // Create new event
    const eventId = (events.length + 1).toString();
    const newEventData = {
      id: eventId,
      ...newEvent,
      date: newEvent.date.toISOString().split('T')[0],
      time: newEvent.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attendees: 0,
      isRegistered: false,
    };

    setEvents([...events, newEventData]);
    setIsAddEventModalVisible(false);
    // Reset form
    setNewEvent({
      title: '',
      date: new Date(),
      time: new Date(),
      location: '',
      category: 'Tech',
      description: '',
      organizer: '',
    });
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
          <View style={[styles.eventCircle, { backgroundColor: getCategoryColor(item.category) }]}>
            <Ionicons name="calendar" size={24} color={COLORS.white} />
          </View>

          <View style={styles.eventContent}>
            <View style={styles.eventHeader}>
              <Text style={styles.eventTitle}>{item.title}</Text>
              <View style={[styles.categoryPill, { backgroundColor: `${getCategoryColor(item.category)}20` }]}>
                <Text style={[styles.categoryPillText, { color: getCategoryColor(item.category) }]}>
                  {item.category}
                </Text>
              </View>
            </View>

            <View style={styles.eventDetails}>
              <View style={styles.eventDetailRow}>
                <View style={styles.eventDetail}>
                  <Ionicons name="calendar-outline" size={16} color={COLORS.greyText} />
                  <Text style={styles.eventDetailText}>{formatDate(item.date)}</Text>
                </View>
                <View style={styles.eventDetail}>
                  <Ionicons name="time-outline" size={16} color={COLORS.greyText} />
                  <Text style={styles.eventDetailText}>{item.time}</Text>
                </View>
              </View>

              <View style={styles.eventDetailRow}>
                <View style={styles.eventDetail}>
                  <Ionicons name="location-outline" size={16} color={COLORS.greyText} />
                  <Text style={styles.eventDetailText}>{item.location}</Text>
                </View>
                <View style={styles.eventDetail}>
                  <Ionicons name="people-outline" size={16} color={COLORS.greyText} />
                  <Text style={styles.eventDetailText}>{item.attendees} attending</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.cardArrow}>
            <Ionicons name="chevron-forward" size={20} color={COLORS.greyText} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.background}
        />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Events</Text>
          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.7}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={() => setIsAddEventModalVisible(true)}
          >
            <Animated.View style={[styles.addButtonInner, { transform: [{ scale: scaleAnim }] }]}>
              <Ionicons name="add" size={24} color={COLORS.white} />
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          bounces={true}
          overScrollMode="never"
        >
          {/* Featured Event */}
          {featuredEvent && (
            <View style={styles.featuredContainer}>
              <Text style={styles.sectionTitle}>Featured Event</Text>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => handleEventPress(featuredEvent)}
              >
                <ImageBackground
                  source={require('../../assets/images/lamrabti.jpg')}
                  style={styles.featuredCard}
                  imageStyle={{ borderRadius: 16 }}
                >
                  <View style={styles.overlay} />
                  <View style={styles.featuredContent}>
                    <View style={styles.featuredHeader}>
                      <View style={[styles.categoryPill, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                        <Text style={[styles.categoryPillText, { color: COLORS.white }]}>
                          {featuredEvent.category}
                        </Text>
                      </View>
                      {featuredEvent.isRegistered && (
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
                        <Text style={styles.featuredDetailText}>{formatDate(featuredEvent.date)}</Text>
                      </View>
                      <View style={styles.featuredDetailRow}>
                        <Ionicons name="time-outline" size={16} color={COLORS.white} />
                        <Text style={styles.featuredDetailText}>{featuredEvent.time}</Text>
                      </View>
                      <View style={styles.featuredDetailRow}>
                        <Ionicons name="location-outline" size={16} color={COLORS.white} />
                        <Text style={styles.featuredDetailText}>{featuredEvent.location}</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.registerButton,
                        { backgroundColor: featuredEvent.isRegistered ? COLORS.red : COLORS.Green }
                      ]}
                      onPress={handleFeaturedRegistration}
                    >
                      <Text style={styles.registerButtonText}>
                        {featuredEvent.isRegistered ? 'Unregister' : 'Register Now'}
                      </Text>
                      <Ionicons
                        name={featuredEvent.isRegistered ? 'close-circle' : 'arrow-forward'}
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
            <Text style={styles.sectionTitle}>Categories</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
              decelerationRate="fast"
            >
              {categories.map((category) => {
                const isSelected = selectedCategory === category.name;
                const buttonScale = useRef(new Animated.Value(1)).current;

                const handlePressIn = () => {
                  Animated.spring(buttonScale, {
                    toValue: 0.95,
                    useNativeDriver: true,
                  }).start();
                };

                const handlePressOut = () => {
                  Animated.spring(buttonScale, {
                    toValue: 1,
                    friction: 3,
                    tension: 40,
                    useNativeDriver: true,
                  }).start();
                };

                return (
                  <Pressable
                    key={category.id}
                    style={styles.categoryButton}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    onPress={() => handleCategoryPress(category.name)}
                  >
                    <Animated.View style={[
                      styles.categoryCard,
                      {
                        backgroundColor: isSelected
                          ? category.color
                          : COLORS.white,
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
                            : `${category.color}15`,
                          width: 44,
                          height: 44,
                          borderRadius: 22,
                        }
                      ]}>
                        <Ionicons
                          name={category.icon}
                          size={24}
                          color={isSelected ? COLORS.white : category.color}
                          style={{ opacity: isSelected ? 1 : 0.9 }}
                        />
                      </View>
                      <Text style={[
                        styles.categoryText,
                        {
                          color: isSelected ? COLORS.white : category.color,
                          fontWeight: isSelected ? '700' : '600',
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
              <Text style={styles.sectionTitle}>Upcoming Events</Text>
              <Text style={styles.eventCount}>{filteredEvents.length} events</Text>
            </View>
            <View style={styles.eventsListContainer}>
              {filteredEvents.map(renderEventCard)}
              {filteredEvents.length === 0 && (
                <View style={styles.noEventsContainer}>
                  <Ionicons name="calendar-outline" size={48} color={COLORS.greyText} />
                  <Text style={styles.noEventsText}>No events in this category</Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
      <Nav />

      {/* Event Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={selectedEvent !== null}
        onRequestClose={() => setSelectedEvent(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedEvent(null)}
              >
                <Ionicons name="close" size={24} color={COLORS.black} />
              </TouchableOpacity>

              {selectedEvent && (
                <View style={styles.modalBody}>
                  <View style={[styles.modalEventCircle, {
                    backgroundColor: getCategoryColor(selectedEvent.category),
                  }]}>
                    <Ionicons name="calendar" size={32} color={COLORS.white} />
                  </View>

                  <Text style={styles.modalTitle}>{selectedEvent.title}</Text>

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
                      { color: selectedEvent.isRegistered ? COLORS.Green : COLORS.greyText }
                    ]}>
                      {selectedEvent.isRegistered ? '✓ You are registered' : 'Not registered yet'}
                    </Text>
                  </View>

                  <View style={styles.modalDetailsSection}>
                    <View style={styles.modalDetailRow}>
                      <Ionicons name="calendar-outline" size={22} color={COLORS.greyText} />
                      <Text style={styles.modalDetailText}>{formatDate(selectedEvent.date)}</Text>
                    </View>
                    <View style={styles.modalDetailRow}>
                      <Ionicons name="time-outline" size={22} color={COLORS.greyText} />
                      <Text style={styles.modalDetailText}>{selectedEvent.time}</Text>
                    </View>
                    <View style={styles.modalDetailRow}>
                      <Ionicons name="location-outline" size={22} color={COLORS.greyText} />
                      <Text style={styles.modalDetailText}>{selectedEvent.location}</Text>
                    </View>
                    <View style={styles.modalDetailRow}>
                      <Ionicons name="people-outline" size={22} color={COLORS.greyText} />
                      <Text style={styles.modalDetailText}>{selectedEvent.attendees} attending</Text>
                    </View>
                    {selectedEvent.organizer && (
                      <View style={styles.modalDetailRow}>
                        <Ionicons name="person-outline" size={22} color={COLORS.greyText} />
                        <Text style={styles.modalDetailText}>Organized by {selectedEvent.organizer}</Text>
                      </View>
                    )}
                  </View>

                  {selectedEvent.description && (
                    <View style={styles.descriptionSection}>
                      <Text style={styles.descriptionTitle}>About Event</Text>
                      <Text style={styles.descriptionText}>{selectedEvent.description}</Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={[
                      styles.registrationButton,
                      { backgroundColor: selectedEvent.isRegistered ? COLORS.red : COLORS.Green }
                    ]}
                    onPress={() => handleRegistration(selectedEvent.id)}
                  >
                    <Text style={styles.registrationButtonText}>
                      {selectedEvent.isRegistered ? 'Cancel Registration' : 'Register for Event'}
                    </Text>
                    <Ionicons
                      name={selectedEvent.isRegistered ? 'close-circle' : 'checkmark-circle'}
                      size={24}
                      color={COLORS.white}
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
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalHeaderTitle}>Add New Event</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setIsAddEventModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color={COLORS.black} />
                </TouchableOpacity>
              </View>

              <View style={styles.formContainer}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Event Title *</Text>
                  <TextInput
                    style={[
                      styles.formInput,
                      formErrors.title && styles.formInputError
                    ]}
                    value={newEvent.title}
                    onChangeText={(text) => {
                      setNewEvent({ ...newEvent, title: text });
                      setFormErrors({ ...formErrors, title: false });
                    }}
                    placeholder="Enter event title"
                    placeholderTextColor={COLORS.greyText}
                  />
                  {formErrors.title && (
                    <Text style={styles.errorText}>Title is required</Text>
                  )}
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Category</Text>
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
                              : `${category.color}20`
                          }
                        ]}
                        onPress={() => setNewEvent({ ...newEvent, category: category.name })}
                      >
                        <Ionicons
                          name={category.icon}
                          size={20}
                          color={newEvent.category === category.name ? COLORS.white : category.color}
                        />
                        <Text
                          style={[
                            styles.categorySelectorText,
                            { color: newEvent.category === category.name ? COLORS.white : category.color }
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
                    style={styles.dateTimeButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Ionicons name="calendar-outline" size={22} color={COLORS.Green} />
                    <Text style={styles.dateTimeText}>
                      {newEvent.date.toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.dateTimeButton}
                    onPress={() => setShowTimePicker(true)}
                  >
                    <Ionicons name="time-outline" size={22} color={COLORS.Green} />
                    <Text style={styles.dateTimeText}>
                      {newEvent.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Location *</Text>
                  <TextInput
                    style={[
                      styles.formInput,
                      formErrors.location && styles.formInputError
                    ]}
                    value={newEvent.location}
                    onChangeText={(text) => {
                      setNewEvent({ ...newEvent, location: text });
                      setFormErrors({ ...formErrors, location: false });
                    }}
                    placeholder="Enter event location"
                    placeholderTextColor={COLORS.greyText}
                  />
                  {formErrors.location && (
                    <Text style={styles.errorText}>Location is required</Text>
                  )}
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Organizer</Text>
                  <TextInput
                    style={styles.formInput}
                    value={newEvent.organizer}
                    onChangeText={(text) => setNewEvent({ ...newEvent, organizer: text })}
                    placeholder="Enter organizer name"
                    placeholderTextColor={COLORS.greyText}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Description</Text>
                  <TextInput
                    style={[styles.formInput, styles.textArea]}
                    value={newEvent.description}
                    onChangeText={(text) => setNewEvent({ ...newEvent, description: text })}
                    placeholder="Enter event description"
                    placeholderTextColor={COLORS.greyText}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleAddEvent}
                >
                  <Text style={styles.submitButtonText}>Create Event</Text>
                  <Ionicons name="arrow-forward" size={24} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

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
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80, // Add padding for the nav bar
  },
  eventsListContainer: {
    paddingTop: 10,
  },
  header: {
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  addButton: {
    backgroundColor: COLORS.Green,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.Green,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  addButtonInner: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryIcon: {
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
});