import React from 'react';
import { IconSymbol } from '@shared/components/ui/icon-symbol';
import { DashboardTabBar } from '@shared/components/DashboardTabBar';
import { useAppSelector } from '@store/index';
import { Tabs } from 'expo-router';

export default function AdminLayout(): React.JSX.Element | null {
  const user = useAppSelector((s) => s.auth.user);

  // Auth guard — only admins may access this group.
  if (!user || user.role !== 'admin') return null;

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
        name="users"
        options={{
          title: 'Users',
          tabBarIcon: ({ color }) => (
            <IconSymbol name="person.fill" size={22} color={color} />
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
        name="disputes"
        options={{
          title: 'Disputes',
          tabBarIcon: ({ color }) => (
            <IconSymbol name="exclamationmark.triangle" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="finance"
        options={{
          title: 'Finance',
          tabBarIcon: ({ color }) => (
            <IconSymbol name="trophy.fill" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="account" options={{ href: null }} />
      <Tabs.Screen name="reviews" options={{ href: null }} />
      <Tabs.Screen name="designs" options={{ href: null }} />
      <Tabs.Screen name="categories" options={{ href: null }} />
      <Tabs.Screen name="promotions" options={{ href: null }} />
      <Tabs.Screen name="banners" options={{ href: null }} />
      <Tabs.Screen name="platform-settings" options={{ href: null }} />
      <Tabs.Screen name="broadcast" options={{ href: null }} />
    </Tabs>
  );
}
