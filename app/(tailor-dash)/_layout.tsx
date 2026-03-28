import React from 'react';
import { IconSymbol } from '@shared/components/ui/icon-symbol';
import { DashboardTabBar } from '@shared/components/DashboardTabBar';
import { useAppSelector } from '@store/index';
import { Tabs } from 'expo-router';

export default function TailorDashLayout(): React.JSX.Element | null {
  const user = useAppSelector((s) => s.auth.user);

  if (!user || user.role !== 'tailor') return null;

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
        name="earnings"
        options={{
          title: 'Earnings',
          tabBarIcon: ({ color }) => (
            <IconSymbol name="trophy.fill" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color }) => (
            <IconSymbol name="calendar" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          title: 'Portfolio',
          tabBarIcon: ({ color }) => (
            <IconSymbol name="photo.on.rectangle" size={22} color={color} />
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
