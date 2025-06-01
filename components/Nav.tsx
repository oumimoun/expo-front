import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';

type Route = '/home' | '/notifications' | '/Profile' | '/settings';

const NAV_ITEMS = [
  { name: 'Home', icon: 'home-outline' as const, activeIcon: 'home' as const, route: '/home' as Route },
  { name: 'Notifications', icon: 'notifications-outline' as const, activeIcon: 'notifications' as const, route: '/notifications' as Route },
  { name: 'Profile', icon: 'person-outline' as const, activeIcon: 'person' as const, route: '/Profile' as Route },
  { name: 'Settings', icon: 'settings-outline' as const, activeIcon: 'settings' as const, route: '/settings' as Route },
];

const Nav = () => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { isDarkMode, colors } = useTheme();

  return (
    <View style={[
      styles.container,
      {
        paddingBottom: Platform.OS === 'ios' ? insets.bottom : 10,
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
        borderTopWidth: isDarkMode ? 0 : 1,
      }
    ]}>
      <View style={styles.navBar}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.route;
          return (
            <Pressable
              key={item.route}
              style={({ pressed }) => [
                styles.navItem,
                { opacity: pressed ? 0.7 : 1 }
              ]}
              onPress={() => router.push(item.route)}
            >
              <Ionicons
                name={isActive ? item.activeIcon : item.icon}
                size={24}
                color={isActive ? colors.green : colors.greyText}
              />
              <Text style={[
                styles.navText,
                {
                  color: isActive ? colors.green : colors.greyText,
                  fontWeight: isActive ? '600' : '400'
                }
              ]}>
                {item.name}
              </Text>
              <Text></Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
  },
  navItem: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default Nav;
