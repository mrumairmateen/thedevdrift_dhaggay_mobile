import React, { useCallback } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { useGetCustomerDashboardQuery } from '@services/dashboardApi';
import { useAppSelector } from '@store/index';
import { useTheme } from '@shared/theme';
import {
  EmptyState,
  ErrorBanner,
  SectionHeader,
  Skeleton,
} from '@shared/components/ui';
import { DashHeader } from '@shared/components/DashHeader';
import { IconSymbol } from '@shared/components/ui/icon-symbol';

import { ActiveOrderCard } from '@features/dashboard/components/overview/ActiveOrderCard';
import { QuickActions } from '@features/dashboard/components/overview/QuickActions';
import type { ActiveOrder } from '@features/dashboard/dashboard.types';

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DashboardSkeleton(): React.JSX.Element {
  const { colors, sp, r } = useTheme();
  const styles = StyleSheet.create({
    statsRow: {
      flexDirection: 'row',
      gap: sp.sm,
      paddingHorizontal: sp.base,
      marginTop: sp.lg,
    },
    statCard: {
      flex: 1,
      height: 80,
      backgroundColor: colors.elevated,
      borderRadius: r.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    section: { paddingHorizontal: sp.base, marginTop: sp.xl },
    orderCard: {
      height: 120,
      backgroundColor: colors.elevated,
      borderRadius: r.lg,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: sp.sm,
    },
    quickRow: {
      flexDirection: 'row',
      gap: sp.sm,
      paddingHorizontal: sp.base,
      marginTop: sp.lg,
    },
    quickCard: {
      flex: 1,
      height: 72,
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
  });

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Stats row */}
      <View style={styles.statsRow}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={styles.statCard} />
        ))}
      </View>

      {/* Active orders skeleton */}
      <View style={styles.section}>
        <Skeleton width={120} height={18} />
        <View style={{ marginTop: sp.md }}>
          <View style={styles.orderCard} />
          <View style={styles.orderCard} />
        </View>
      </View>

      {/* Quick links skeleton */}
      <View style={styles.section}>
        <Skeleton width={100} height={18} />
        <View style={[styles.quickRow, { marginTop: sp.sm }]}>
          <View style={styles.quickCard} />
          <View style={styles.quickCard} />
        </View>
        <View style={[styles.quickRow, { marginTop: sp.sm, paddingHorizontal: 0 }]}>
          <View style={styles.quickCard} />
          <View style={styles.quickCard} />
        </View>
      </View>
    </ScrollView>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function DashboardOverviewScreen(): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();
  const router = useRouter();
  const authUser = useAppSelector((s) => s.auth.user);

  const { data, isLoading, isError, refetch } = useGetCustomerDashboardQuery();

  const firstName =
    (authUser?.name ?? '').split(' ')[0] ?? 'there';

  const handleViewOrders = useCallback(() => {
    router.push('/(dashboard)/orders' as never);
  }, [router]);

  const handleGoWishlist = useCallback(() => {
    router.push('/(dashboard)/wishlist' as never);
  }, [router]);

  const handleGoLoyalty = useCallback(() => {
    router.push('/(dashboard)/loyalty' as never);
  }, [router]);

  const handleGoSettings = useCallback(() => {
    router.push('/(dashboard)/settings' as never);
  }, [router]);

  const quickActions = React.useMemo(
    () => [
      { icon: 'shippingbox.fill', label: 'My Orders', onPress: handleViewOrders },
      { icon: 'heart.fill', label: 'Wishlist', onPress: handleGoWishlist },
      { icon: 'gift.fill', label: 'Loyalty', onPress: handleGoLoyalty },
      { icon: 'gearshape.fill', label: 'Settings', onPress: handleGoSettings },
    ],
    [handleViewOrders, handleGoWishlist, handleGoLoyalty, handleGoSettings],
  );

  const renderActiveOrder = useCallback(
    ({ item }: { item: ActiveOrder }) => <ActiveOrderCard order={item} />,
    [],
  );

  const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg },
    statsRow: {
      flexDirection: 'row',
      gap: sp.sm,
      paddingHorizontal: sp.base,
      marginTop: sp.lg,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      padding: sp.md,
      borderWidth: 1,
      borderColor: colors.border,
      gap: sp.xs,
      ...elev.low,
    },
    statValue: {
      ...typo.scale.title2,
      fontFamily: typo.fonts.display,
      color: colors.accent,
    },
    statLabel: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
    },
    section: { paddingHorizontal: sp.base, marginTop: sp.xl },
    content: { paddingBottom: sp['4xl'] },
  });

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <DashHeader title={`Hello, ${firstName}`} subtitle="Customer Dashboard" />
        <DashboardSkeleton />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.screen}>
        <DashHeader title={`Hello, ${firstName}`} subtitle="Customer Dashboard" />
        <View style={{ padding: sp.base, marginTop: sp.lg }}>
          <ErrorBanner
            message="Could not load your dashboard. Please try again."
            onRetry={refetch}
          />
        </View>
      </View>
    );
  }

  const statItems = [
    {
      icon: 'shippingbox.fill' as const,
      value: data.stats.totalOrders,
      label: 'Total Orders',
    },
    {
      icon: 'bag.fill' as const,
      value: data.stats.activeOrders,
      label: 'Active',
    },
    {
      icon: 'gift.fill' as const,
      value: data.stats.loyaltyPoints,
      label: 'Points',
    },
    {
      icon: 'person.fill' as const,
      value: data.stats.referrals,
      label: 'Referrals',
    },
  ];

  return (
    <View style={styles.screen}>
      <DashHeader title={`Hello, ${firstName}`} subtitle="Customer Dashboard" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* 2×2 Stats grid */}
        <View style={styles.statsRow}>
          {statItems.map((item) => (
            <View key={item.label} style={styles.statCard}>
              <IconSymbol name={item.icon} size={20} color={colors.accent} />
              <Text style={styles.statValue}>{(item.value ?? 0).toLocaleString()}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Active orders */}
        <View style={styles.section}>
          <SectionHeader
            title="Active Orders"
            action={{ label: 'See all', onPress: handleViewOrders }}
          />
          {data.activeOrders.length === 0 ? (
            <EmptyState
              icon={
                <IconSymbol name="shippingbox.fill" size={32} color={colors.textLow} />
              }
              title="No active orders"
              message="Your confirmed orders will appear here."
            />
          ) : (
            <FlatList
              data={data.activeOrders}
              keyExtractor={(item) => item._id}
              renderItem={renderActiveOrder}
              scrollEnabled={false}
            />
          )}
        </View>

        {/* Quick links */}
        <View style={styles.section}>
          <SectionHeader title="Quick Links" />
          <QuickActions actions={quickActions} />
        </View>
      </ScrollView>
    </View>
  );
}
