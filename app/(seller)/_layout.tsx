import React from 'react';
import { IconSymbol } from '@shared/components/ui/icon-symbol';
import { DashboardTabBar } from '@shared/components/DashboardTabBar';
import { useAppSelector } from '@store/index';
import { Tabs } from 'expo-router';

export default function SellerLayout(): React.JSX.Element | null {
  const user = useAppSelector((s) => s.auth.user);

  // Auth guard — render nothing if not a seller.
  if (!user || user.role !== 'seller') return null;

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
        name="products"
        options={{
          title: 'Products',
          tabBarIcon: ({ color }) => (
            <IconSymbol name="tag.fill" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color }) => (
            <IconSymbol name="chart.line.uptrend.xyaxis" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="promotions" options={{ href: null }} />
      <Tabs.Screen name="reviews" options={{ href: null }} />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => (
            <IconSymbol name="gearshape.fill" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
