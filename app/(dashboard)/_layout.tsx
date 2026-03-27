import { IconSymbol } from '@shared/components/ui/icon-symbol';
import { DashboardTabBar } from '@shared/components/DashboardTabBar';
import { useTheme } from '@shared/theme';
import { useAppSelector } from '@store/index';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DashboardLayout() {
  const { colors, sp, typo } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAppSelector((s) => s.auth.user);

  // Auth guard — render nothing if not logged in.
  // Navigation to this group only happens from index.tsx after login,
  // so an active redirect isn't needed and causes NavigationContainer race conditions.
  if (!user) return null;

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <DashboardTabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Overview',
          tabBarIcon: ({ color }) => (
            <IconSymbol name="chart.bar.fill" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color }) => (
            <IconSymbol name="shippingbox.fill" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="measurements"
        options={{
          title: 'Measures',
          tabBarIcon: ({ color }) => (
            <IconSymbol name="ruler" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: 'Wishlist',
          tabBarIcon: ({ color }) => (
            <IconSymbol name="bookmark.fill" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="loyalty"
        options={{
          title: 'Loyalty',
          tabBarIcon: ({ color }) => (
            <IconSymbol name="gift.fill" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => (
            <IconSymbol name="person.crop.circle" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
