import React from 'react';
import { IconSymbol } from '@shared/components/ui/icon-symbol';
import { DashboardTabBar } from '@shared/components/DashboardTabBar';
import { useTheme } from '@shared/theme';
import { useAppSelector } from '@store/index';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DeliveryLayout(): React.JSX.Element | null {
  const { colors, sp, typo } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAppSelector((s) => s.auth.user);

  if (!user || user.role !== 'delivery') return null;

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <DashboardTabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color }) => (
            <IconSymbol name="shippingbox.fill" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: 'Earnings',
          tabBarIcon: ({ color }) => (
            <IconSymbol name="trophy.fill" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <IconSymbol name="person.crop.circle" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
