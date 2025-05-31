import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Route = '/home' | '/notifications' | '/Profile' | '/settings';

const NAV_ITEMS = [
  { name: 'Home', icon: 'home-outline' as const, route: '/home' as Route },
  { name: 'Notifications', icon: 'notifications-outline' as const, route: '/notifications' as Route },
  { name: 'Profile', icon: 'person-outline' as const, route: '/Profile' as Route },
  { name: 'Settings', icon: 'settings-outline' as const, route: '/settings' as Route },
];

const Nav = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.navBar}>
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.route;
        return (
          <Pressable
            key={item.name}
            style={styles.navItem}
            onPress={() => {
              if (item.route === '/Profile') {
                router.push('/Profile' as any);
              } else {
                router.push(item.route as any);
              }
            }}
          >
            <Ionicons
              name={item.icon}
              size={24}
              color={isActive ? '#1b8456' : '#333'}
            />
            <Text style={[styles.navText, isActive && styles.activeText]}>
              {item.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  navBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
    color: '#333',
  },
  activeText: {
    color: '#1b8456',
    fontWeight: 'bold',
  },
});

export default Nav;
