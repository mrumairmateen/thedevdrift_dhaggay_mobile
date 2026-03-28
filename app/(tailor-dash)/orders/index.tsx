import React, { useCallback, useState } from 'react';
import {
  FlatList,
  ListRenderItem,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import {
  useGetTailorOrdersQuery,
} from '@services/tailorDashApi';
import type { TailorOrderItem, TailorOrderTab, OrderStatus } from '@services/tailorDashApi';
import { useTheme } from '@shared/theme';
import { Badge, EmptyState, ErrorBanner, Skeleton } from '@shared/components/ui';
import { DashHeader } from '@shared/components/DashHeader';
import { IconSymbol } from '@shared/components/ui/icon-symbol';
import { formatPkr } from '@shared/utils';

// ─── Filter config ────────────────────────────────────────────────────────────

/**
 * Tab groupings per docs:
 *  New       → delivered_to_tailor (fabric physically arrived, tailor should start)
 *  Pipeline  → placed | accepted_by_seller | ready_to_dispatch_to_tailor | dispatching_to_tailor
 *  Progress  → tailor_working (actively stitching)
 *  Ready     → ready_for_customer_delivery (outfit complete)
 *  Completed → delivered_to_customer | cancelled_* | disputed
 */
interface FilterConfig {
  label: string;
  tab: TailorOrderTab;
}

const FILTER_TABS: FilterConfig[] = [
  { label: 'All',      tab: 'all'      },
  { label: 'New',      tab: 'new'      },
  { label: 'Pipeline', tab: 'pipeline' },
  { label: 'Progress', tab: 'progress' },
  { label: 'Ready',    tab: 'ready'    },
  { label: 'Done',     tab: 'completed'},
];

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
  if (s === 'tailor_working') return 'info';
  if (s === 'delivered_to_tailor') return 'info';
  if (s.startsWith('cancelled') || s === 'disputed') return 'error';
  return 'warning';
}

// ─── Order Card ───────────────────────────────────────────────────────────────

export interface TailorOrderCardProps {
  order: TailorOrderItem;
  onPress: (id: string) => void;
}

export const TailorOrderCard = React.memo(function TailorOrderCard({
  order,
  onPress,
}: TailorOrderCardProps): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();

  const handlePress = useCallback(() => {
    onPress(order._id);
  }, [onPress, order._id]);

  const deadlineDate = order.deadline !== null ? new Date(order.deadline) : null;
  const isUrgent =
    deadlineDate !== null &&
    deadlineDate.getTime() - Date.now() < 2 * 24 * 60 * 60 * 1000 &&
    deadlineDate.getTime() > Date.now();

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
    topRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: sp.sm,
    },
    thumbnail: {
      width: 56,
      height: 56,
      borderRadius: r.sm,
      backgroundColor: colors.panel,
    },
    info: { flex: 1 },
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
    design: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textLow,
      marginTop: 2,
    },
    bottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: sp.sm,
    },
    deadline: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sansMed,
    },
    fee: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sansBold,
      color: colors.textHigh,
    },
    placedDate: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textLow,
      marginTop: 2,
    },
  });

  return (
    <Pressable onPress={handlePress} style={styles.card}>
      <View style={styles.topRow}>
        {order.productImage !== null ? (
          <Image
            source={{ uri: order.productImage }}
            style={styles.thumbnail}
            contentFit="cover"
          />
        ) : (
          <View style={styles.thumbnail} />
        )}
        <View style={styles.info}>
          <Text style={styles.orderNum}>#{order.orderNumber}</Text>
          <Text style={styles.customer}>{order.customerName}</Text>
          <Text style={styles.product} numberOfLines={1}>{order.productTitle}</Text>
          {order.designTitle !== null && (
            <Text style={styles.design} numberOfLines={1}>{order.designTitle}</Text>
          )}
          <Text style={styles.placedDate}>
            {new Date(order.placedAt).toLocaleDateString('en-PK')}
          </Text>
        </View>
        <Badge
          label={statusLabel(order.status)}
          variant={statusVariant(order.status)}
          size="sm"
        />
      </View>
      <View style={styles.bottomRow}>
        {deadlineDate !== null ? (
          <Text style={[styles.deadline, { color: isUrgent ? colors.error : colors.textMid }]}>
            Due: {deadlineDate.toLocaleDateString('en-PK')}
            {isUrgent ? ' (!!)' : ''}
          </Text>
        ) : (
          <Text style={[styles.deadline, { color: colors.textLow }]}>No deadline</Text>
        )}
        <Text style={styles.fee}>{formatPkr(order.stitchingFee)}</Text>
      </View>
    </Pressable>
  );
});

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function OrdersListSkeleton(): React.JSX.Element {
  const { sp, r } = useTheme();
  return (
    <View style={{ padding: sp.base, gap: sp.sm }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Skeleton key={i} width="100%" height={100} radius={r.lg} />
      ))}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function TailorOrdersScreen(): React.JSX.Element {
  const { colors, sp, r, typo } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TailorOrderTab>('all');

  const { data, isLoading, isError, refetch } = useGetTailorOrdersQuery({
    tab: activeTab,
  });

  const handleTabChange = useCallback((tab: TailorOrderTab) => {
    setActiveTab(tab);
  }, []);

  const handleOrderPress = useCallback(
    (id: string) => {
      router.push(`/(tailor-dash)/orders/${id}` as never);
    },
    [router],
  );

  const renderItem = useCallback<ListRenderItem<TailorOrderItem>>(
    ({ item }) => <TailorOrderCard order={item} onPress={handleOrderPress} />,
    [handleOrderPress],
  );

  const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg },
    filterBar: {
      flexGrow: 0,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    filterContent: {
      paddingHorizontal: sp.base,
      paddingVertical: sp.sm,
      gap: sp.sm,
    },
    pill: {
      borderWidth: 1,
      borderRadius: r.pill,
      paddingHorizontal: sp.md,
      paddingVertical: sp.xs,
    },
    listContent: { padding: sp.base, paddingBottom: sp['2xl'] },
    errorContainer: { padding: sp.base },
  });

  return (
    <View style={styles.screen}>
      <DashHeader title="My Orders" subtitle="Tailor Dashboard" />

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterContent}
      >
        {FILTER_TABS.map((f) => {
          const isActive = activeTab === f.tab;
          return (
            <Pressable
              key={f.tab}
              onPress={() => handleTabChange(f.tab)}
              style={[
                styles.pill,
                {
                  backgroundColor: isActive ? colors.accentSubtle : colors.chipBg,
                  borderColor: isActive ? colors.accent : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  typo.scale.caption,
                  {
                    fontFamily: isActive ? typo.fonts.sansBold : typo.fonts.sans,
                    color: isActive ? colors.accent : colors.textMid,
                  },
                ]}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Content */}
      {isLoading ? (
        <OrdersListSkeleton />
      ) : isError ? (
        <View style={styles.errorContainer}>
          <ErrorBanner
            message="Could not load orders. Please try again."
            onRetry={refetch}
          />
        </View>
      ) : data === undefined || data.orders.length === 0 ? (
        <EmptyState
          icon={<IconSymbol name="shippingbox.fill" size={32} color={colors.textLow} />}
          title="No orders"
          message="Orders assigned to you will appear here."
        />
      ) : (
        <FlatList
          data={data.orders}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
        />
      )}
    </View>
  );
}
