import React, { useCallback } from 'react';
import {
  FlatList,
  ListRenderItem,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useGetTailorDashboardQuery } from '@services/tailorDashApi';
import type { TailorOrderItem, OrderStatus } from '@services/tailorDashApi';
import { useAppSelector } from '@store/index';
import { useTheme } from '@shared/theme';
import {
  Avatar,
  Badge,
  EmptyState,
  ErrorBanner,
  SectionHeader,
  Skeleton,
  Tag,
} from '@shared/components/ui';
import { IconSymbol } from '@shared/components/ui/icon-symbol';
import { formatPkr } from '@shared/utils';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusLabel(s: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    placed:                          'Placed',
    accepted_by_seller:              'Accepted',
    ready_to_dispatch_to_tailor:     'Ready to Ship',
    dispatching_to_tailor:           'In Transit',
    delivered_to_tailor:             'Fabric Arrived',
    tailor_working:                  'Stitching',
    ready_for_customer_delivery:     'Ready',
    dispatching_to_customer:         'Out for Delivery',
    delivered_to_customer:           'Delivered',
    finding_replacement_tailor:      'Finding Tailor',
    disputed:                        'Disputed',
    cancelled_by_customer:           'Cancelled',
    cancelled_by_seller:             'Cancelled',
    cancelled_by_tailor:             'Cancelled',
    cancelled_by_admin:              'Cancelled',
    cancelled_post_dispute:          'Cancelled',
  };
  return map[s] ?? s.replace(/_/g, ' ');
}

function statusVariant(
  s: OrderStatus,
): 'info' | 'warning' | 'success' | 'error' | 'neutral' {
  if (s === 'delivered_to_customer') return 'success';
  if (s === 'ready_for_customer_delivery') return 'success';
  if (s === 'tailor_working' || s === 'delivered_to_tailor') return 'info';
  if (s.startsWith('cancelled') || s === 'disputed') return 'error';
  return 'warning';
}

function tierVariant(tier: 'standard' | 'premium' | 'master'): 'default' | 'accent' | 'warning' {
  if (tier === 'master') return 'warning';
  if (tier === 'premium') return 'accent';
  return 'default';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface RecentOrderCardProps {
  order: TailorOrderItem;
  onPress: (id: string) => void;
}

const RecentOrderCard = React.memo(function RecentOrderCard({
  order,
  onPress,
}: RecentOrderCardProps): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();

  const handlePress = useCallback(() => {
    onPress(order._id);
  }, [onPress, order._id]);

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: sp.md,
      marginBottom: sp.sm,
      ...elev.low,
    },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    orderNum: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansBold,
      color: colors.accent,
    },
    customer: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sans,
      color: colors.textHigh,
      marginTop: 2,
    },
    product: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
      marginTop: 2,
    },
    deadline: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textLow,
      marginTop: sp.xs,
    },
  });

  return (
    <Pressable onPress={handlePress} style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.orderNum}>#{order.orderNumber}</Text>
        <Badge
          label={statusLabel(order.status)}
          variant={statusVariant(order.status)}
          size="sm"
        />
      </View>
      <Text style={styles.customer}>{order.customerName}</Text>
      <Text style={styles.product}>{order.productTitle}</Text>
      {order.deadline !== null && (
        <Text style={styles.deadline}>
          Due: {new Date(order.deadline).toLocaleDateString('en-PK')}
        </Text>
      )}
    </Pressable>
  );
});

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TailorOverviewSkeleton(): React.JSX.Element {
  const { colors, sp, r } = useTheme();

  const styles = StyleSheet.create({
    kpiRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: sp.sm,
      paddingHorizontal: sp.base,
      marginTop: sp.lg,
    },
    kpiCard: {
      width: '47%',
      height: 80,
      backgroundColor: colors.elevated,
      borderRadius: r.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    section: { paddingHorizontal: sp.base, marginTop: sp.xl },
    orderCard: {
      height: 96,
      backgroundColor: colors.elevated,
      borderRadius: r.lg,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: sp.sm,
    },
  });

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.kpiRow}>
        {[0, 1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.kpiCard} />
        ))}
      </View>
      <View style={styles.section}>
        <Skeleton width={140} height={18} />
        <View style={{ marginTop: sp.md }}>
          <View style={styles.orderCard} />
          <View style={styles.orderCard} />
        </View>
      </View>
    </ScrollView>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function TailorOverviewScreen(): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const authUser = useAppSelector((s) => s.auth.user);

  const { data, isLoading, isError, refetch } = useGetTailorDashboardQuery();

  const firstName = (authUser?.name ?? '').split(' ')[0] ?? 'there';

  const handleOrderPress = useCallback(
    (id: string) => {
      router.push(`/(tailor-dash)/orders/${id}` as never);
    },
    [router],
  );

  const renderRecentOrder = useCallback<ListRenderItem<TailorOrderItem>>(
    ({ item }) => <RecentOrderCard order={item} onPress={handleOrderPress} />,
    [handleOrderPress],
  );

  const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg },
    header: {
      backgroundColor: colors.navSolid,
      paddingTop: insets.top + sp.sm,
      paddingHorizontal: sp.base,
      paddingBottom: sp.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      ...elev.high,
    },
    headerLeft: { flex: 1 },
    greeting: {
      ...typo.scale.title3,
      fontFamily: typo.fonts.serifBold,
      color: colors.textHigh,
    },
    subtitle: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
      marginTop: 2,
    },
    tierRow: { flexDirection: 'row', alignItems: 'center', marginTop: sp.xs, gap: sp.xs },
    banner: {
      marginHorizontal: sp.base,
      marginTop: sp.md,
      borderRadius: r.md,
      padding: sp.md,
    },
    bannerText: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansMed,
    },
    kpiGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: sp.sm,
      paddingHorizontal: sp.base,
      marginTop: sp.lg,
    },
    kpiCard: {
      width: '47%',
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      padding: sp.md,
      borderWidth: 1,
      borderColor: colors.border,
      gap: sp.xs,
      ...elev.low,
    },
    kpiValue: {
      ...typo.scale.title2,
      fontFamily: typo.fonts.display,
      color: colors.accent,
    },
    kpiLabel: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
    },
    section: { paddingHorizontal: sp.base, marginTop: sp.xl },
    content: { paddingBottom: sp['4xl'] },
    errorContainer: { padding: sp.base, marginTop: sp.lg },
  });

  const header = (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.greeting}>Hello, {firstName}</Text>
        <Text style={styles.subtitle}>Tailor Dashboard</Text>
        {data?.profile !== undefined && (
          <View style={styles.tierRow}>
            <Tag
              label={data.profile.tier.toUpperCase()}
              variant={tierVariant(data.profile.tier)}
            />
          </View>
        )}
      </View>
      <Avatar
        uri={data?.profile?.avatarUrl ?? undefined}
        name={data?.profile?.name ?? authUser?.name}
        size={40}
      />
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.screen}>
        {header}
        <TailorOverviewSkeleton />
      </View>
    );
  }

  if (isError || data === undefined || data.profile === undefined || data.stats === undefined || data.recentOrders === undefined) {
    return (
      <View style={styles.screen}>
        {header}
        <View style={styles.errorContainer}>
          <ErrorBanner
            message="Could not load your dashboard. Please try again."
            onRetry={refetch}
          />
        </View>
      </View>
    );
  }

  const profileStatus = data.profile.status;

  const kpiItems = [
    {
      icon: 'shippingbox.fill' as const,
      value: String(data.stats.activeOrders),
      label: 'Active Orders',
    },
    {
      icon: 'checkmark.seal.fill' as const,
      value: String(data.stats.completedThisMonth),
      label: 'Completed',
    },
    {
      icon: 'trophy.fill' as const,
      value: formatPkr(data.stats.earningsThisMonth),
      label: 'Earnings',
    },
    {
      icon: 'star.fill' as const,
      value: `${(data.stats.averageRating ?? 0).toFixed(1)} \u2605`,
      label: 'Rating',
    },
    {
      icon: 'clock.fill' as const,
      value: String(data.stats.pendingRequests),
      label: 'Pending',
    },
  ];

  return (
    <View style={styles.screen}>
      {header}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Status banner */}
        {profileStatus === 'pending' && (
          <View style={[styles.banner, { backgroundColor: colors.warningSubtle }]}>
            <Text style={[styles.bannerText, { color: colors.warning }]}>
              Your profile is under review. You will be notified once approved.
            </Text>
          </View>
        )}
        {profileStatus === 'suspended' && (
          <View style={[styles.banner, { backgroundColor: colors.errorSubtle }]}>
            <Text style={[styles.bannerText, { color: colors.error }]}>
              Account suspended. Contact support for assistance.
            </Text>
          </View>
        )}
        {profileStatus === 'in_review' && (
          <View style={[styles.banner, { backgroundColor: colors.infoSubtle }]}>
            <Text style={[styles.bannerText, { color: colors.info }]}>
              Profile being reviewed by admin.
            </Text>
          </View>
        )}

        {/* KPI grid */}
        <View style={styles.kpiGrid}>
          {kpiItems.map((item) => (
            <View key={item.label} style={styles.kpiCard}>
              <IconSymbol name={item.icon} size={20} color={colors.accent} />
              <Text style={styles.kpiValue}>{item.value}</Text>
              <Text style={styles.kpiLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Recent orders */}
        <View style={styles.section}>
          <SectionHeader
            title="Recent Orders"
            action={{ label: 'See all', onPress: () => router.push('/(tailor-dash)/orders' as never) }}
          />
          {data.recentOrders.length === 0 ? (
            <EmptyState
              icon={<IconSymbol name="shippingbox.fill" size={32} color={colors.textLow} />}
              title="No recent orders"
              message="Your assigned orders will appear here."
            />
          ) : (
            <FlatList
              data={data.recentOrders}
              keyExtractor={(item) => item._id}
              renderItem={renderRecentOrder}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}
