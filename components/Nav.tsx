import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';

type Route = '/home' | '/notifications' | '/Profile' | '/settings' | '/admin';
type IconName = 'home-outline' | 'home' | 'notifications-outline' | 'notifications' |
  'person-outline' | 'person' | 'settings-outline' | 'settings' |
  'shield-checkmark-outline' | 'shield-checkmark';

interface NavItem {
  name: string;
  icon: IconName;
  activeIcon: IconName;
  route: Route;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Home', icon: 'home-outline', activeIcon: 'home', route: '/home' },
  { name: 'Notifications', icon: 'notifications-outline', activeIcon: 'notifications', route: '/notifications' },
  { name: 'Profile', icon: 'person-outline', activeIcon: 'person', route: '/Profile' },
  {
    name: 'Admin',
    icon: 'shield-checkmark-outline',
    activeIcon: 'shield-checkmark',
    route: '/admin',
    adminOnly: true
  },
  { name: 'Settings', icon: 'settings-outline', activeIcon: 'settings', route: '/settings' },
];

const Nav = () => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { isDarkMode, colors } = useTheme();
  const { user } = useUser();


  // Filter out admin panel for non-admin users
  const visibleNavItems = NAV_ITEMS.filter(item => !item.adminOnly || user?.clubManager !== 'none');
  // console.log(user);
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
        {visibleNavItems.map((item) => {
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
