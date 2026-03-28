import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Image,
  ListRenderItem,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import {
  useGetSellerOrdersQuery,
  useAcceptOrderMutation,
  useRejectOrderMutation,
  useMarkReadyToDispatchMutation,
  useMarkDispatchedMutation,
} from '@services/sellerApi';
import type { SellerOrder, SellerOrderApiStatus } from '@services/sellerApi';
import { useTheme } from '@shared/theme';
import {
  Badge,
  Button,
  EmptyState,
  ErrorBanner,
  Skeleton,
} from '@shared/components/ui';
import { IconSymbol } from '@shared/components/ui/icon-symbol';
import { formatPkr } from '@shared/utils';
import { DashHeader } from '@shared/components/DashHeader';

// ─── Filter config ─────────────────────────────────────────────────────────────
//
// Tab → API status mapping (from orders.md):
//   "new"        → placed
//   "processing" → accepted_by_seller
//   "dispatched" → ready_to_dispatch_to_tailor | dispatching_to_tailor
//   "at_tailor"  → delivered_to_tailor
//   "completed"  → delivered_to_customer | cancelled_*
//
// We pass a single status per tab; the backend handles all-orders via no status param.
// For tabs that map to multiple statuses we use the primary/first status and let the
// backend's role-scoped filtering show the relevant set.

type FilterTab = 'all' | 'new' | 'processing' | 'dispatched' | 'at_tailor' | 'completed';

interface FilterConfig {
  label: string;
  tab: FilterTab;
  /** The API status to filter by; undefined = no filter (show all) */
  apiStatus?: SellerOrderApiStatus;
}

const FILTER_TABS: FilterConfig[] = [
  { label: 'All',        tab: 'all'        },
  { label: 'New',        tab: 'new',        apiStatus: 'placed'                    },
  { label: 'Processing', tab: 'processing', apiStatus: 'accepted_by_seller'        },
  { label: 'Dispatched', tab: 'dispatched', apiStatus: 'ready_to_dispatch_to_tailor' },
  { label: 'At Tailor',  tab: 'at_tailor',  apiStatus: 'delivered_to_tailor'        },
  { label: 'Completed',  tab: 'completed',  apiStatus: 'delivered_to_customer'     },
];

// ─── Status badge helper ───────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  SellerOrderApiStatus,
  { label: string; variant: 'success' | 'error' | 'warning' | 'info' | 'neutral' }
> = {
  placed:                       { label: 'New',              variant: 'info'    },
  accepted_by_seller:           { label: 'Accepted',         variant: 'warning' },
  ready_to_dispatch_to_tailor:  { label: 'Ready to Dispatch', variant: 'warning' },
  dispatching_to_tailor:        { label: 'Dispatching',      variant: 'warning' },
  delivered_to_tailor:          { label: 'At Tailor',        variant: 'warning' },
  tailor_working:               { label: 'Tailoring',        variant: 'warning' },
  ready_for_customer_delivery:  { label: 'Ready',            variant: 'warning' },
  dispatching_to_customer:      { label: 'On the Way',       variant: 'warning' },
  delivered_to_customer:        { label: 'Delivered',        variant: 'success' },
  cancelled_by_customer:        { label: 'Cancelled',        variant: 'error'   },
  cancelled_by_seller:          { label: 'Cancelled',        variant: 'error'   },
  cancelled_by_tailor:          { label: 'Cancelled',        variant: 'error'   },
  cancelled_by_admin:           { label: 'Cancelled',        variant: 'error'   },
  cancelled_post_dispute:       { label: 'Cancelled',        variant: 'error'   },
  finding_replacement_tailor:   { label: 'Finding Tailor',   variant: 'neutral' },
  disputed:                     { label: 'Disputed',         variant: 'error'   },
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function OrdersSkeletonList(): React.JSX.Element {
  const { sp, r } = useTheme();
  return (
    <View style={{ padding: sp.base, gap: sp.sm }}>
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} width="100%" height={110} radius={r.lg} />
      ))}
    </View>
  );
}

// ─── Order list item ──────────────────────────────────────────────────────────

export interface SellerOrderListItemProps {
  order: SellerOrder;
  onPress: (id: string) => void;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onMarkReadyToDispatch: (id: string) => void;
  onMarkDispatched: (id: string) => void;
  isAccepting: boolean;
  isRejecting: boolean;
  isMarkingReady: boolean;
  isDispatching: boolean;
}

export const SellerOrderListItem = React.memo(function SellerOrderListItem({
  order,
  onPress,
  onAccept,
  onReject,
  onMarkReadyToDispatch,
  onMarkDispatched,
  isAccepting,
  isRejecting,
  isMarkingReady,
  isDispatching,
}: SellerOrderListItemProps): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();

  const handlePress              = useCallback(() => onPress(order._id),              [onPress, order._id]);
  const handleAccept             = useCallback(() => onAccept(order._id),             [onAccept, order._id]);
  const handleReject             = useCallback(() => onReject(order._id),             [onReject, order._id]);
  const handleMarkReadyToDispatch = useCallback(() => onMarkReadyToDispatch(order._id), [onMarkReadyToDispatch, order._id]);
  const handleMarkDispatched     = useCallback(() => onMarkDispatched(order._id),     [onMarkDispatched, order._id]);

  const statusCfg = STATUS_CONFIG[order.status];

  const placedDate = new Date(order.placedAt).toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.elevated,
      borderRadius: r.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: sp.md,
      marginBottom: sp.sm,
      gap: sp.sm,
      ...elev.low,
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: sp.sm },
    thumbnail: {
      width: 52,
      height: 52,
      borderRadius: r.sm,
      backgroundColor: colors.panel,
    },
    meta: { flex: 1 },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    orderNum: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansMed,
      color: colors.textLow,
      textTransform: 'uppercase',
    },
    date: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textLow,
    },
    productTitle: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.textHigh,
    },
    customer: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
    },
    amount: {
      ...typo.scale.price,
      fontFamily: typo.fonts.sansBold,
      color: colors.accent,
    },
    actions: { flexDirection: 'row', gap: sp.sm },
  });

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
    >
      {/* Top row: order number + date */}
      <View style={styles.topRow}>
        <Text style={styles.orderNum}>#{order.orderNumber}</Text>
        <Text style={styles.date}>{placedDate}</Text>
      </View>

      {/* Product row */}
      <View style={styles.row}>
        {order.productImage !== null ? (
          <Image source={{ uri: order.productImage }} style={styles.thumbnail} />
        ) : (
          <View style={styles.thumbnail} />
        )}
        <View style={styles.meta}>
          <Text style={styles.productTitle} numberOfLines={1}>
            {order.productTitle}
          </Text>
          <Text style={styles.customer}>{order.customerName}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: sp.xs }}>
          <Text style={styles.amount}>{formatPkr(order.totalAmount)}</Text>
          <Badge label={statusCfg.label} variant={statusCfg.variant} size="sm" />
        </View>
      </View>

      {/* Action: placed → Accept + Reject */}
      {order.status === 'placed' && (
        <View style={styles.actions}>
          <Button
            label="Accept"
            variant="primary"
            size="sm"
            onPress={handleAccept}
            loading={isAccepting}
            disabled={isRejecting}
          />
          <Button
            label="Reject"
            variant="danger"
            size="sm"
            onPress={handleReject}
            loading={isRejecting}
            disabled={isAccepting}
          />
        </View>
      )}

      {/* Action: accepted_by_seller → Mark Ready to Dispatch */}
      {order.status === 'accepted_by_seller' && (
        <View style={styles.actions}>
          <Button
            label="Mark Ready to Dispatch"
            variant="secondary"
            size="sm"
            onPress={handleMarkReadyToDispatch}
            loading={isMarkingReady}
          />
        </View>
      )}

      {/* Action: ready_to_dispatch_to_tailor → Mark Dispatched */}
      {order.status === 'ready_to_dispatch_to_tailor' && (
        <View style={styles.actions}>
          <Button
            label="Mark Dispatched"
            variant="secondary"
            size="sm"
            onPress={handleMarkDispatched}
            loading={isDispatching}
          />
        </View>
      )}
    </Pressable>
  );
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SellerOrdersScreen(): React.JSX.Element {
  const { colors, sp, r, typo } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const activeConfig = FILTER_TABS.find((f) => f.tab === activeTab) ?? FILTER_TABS[0];
  const queryStatus = activeConfig?.apiStatus;

  const { data, isLoading, isError, refetch } = useGetSellerOrdersQuery({
    status: queryStatus,
    page: 1,
    limit: 20,
  });

  const [acceptOrder,          { isLoading: isAccepting    }] = useAcceptOrderMutation();
  const [rejectOrder,          { isLoading: isRejecting    }] = useRejectOrderMutation();
  const [markReadyToDispatch,  { isLoading: isMarkingReady }] = useMarkReadyToDispatchMutation();
  const [markDispatched,       { isLoading: isDispatching  }] = useMarkDispatchedMutation();

  const handleTabChange = useCallback((tab: FilterTab) => {
    setActiveTab(tab);
  }, []);

  const handleOrderPress = useCallback(
    (id: string) => {
      router.push(`/(dashboard)/orders/${id}` as never);
    },
    [router],
  );

  const handleAccept = useCallback(
    (id: string) => { void acceptOrder(id); },
    [acceptOrder],
  );

  const handleReject = useCallback(
    (id: string) => { void rejectOrder({ id, reason: 'Rejected by seller' }); },
    [rejectOrder],
  );

  const handleMarkReadyToDispatch = useCallback(
    (id: string) => { void markReadyToDispatch(id); },
    [markReadyToDispatch],
  );

  const handleMarkDispatched = useCallback(
    (id: string) => { void markDispatched(id); },
    [markDispatched],
  );

  const renderItem = useCallback<ListRenderItem<SellerOrder>>(
    ({ item }) => (
      <SellerOrderListItem
        order={item}
        onPress={handleOrderPress}
        onAccept={handleAccept}
        onReject={handleReject}
        onMarkReadyToDispatch={handleMarkReadyToDispatch}
        onMarkDispatched={handleMarkDispatched}
        isAccepting={isAccepting}
        isRejecting={isRejecting}
        isMarkingReady={isMarkingReady}
        isDispatching={isDispatching}
      />
    ),
    [
      handleOrderPress,
      handleAccept,
      handleReject,
      handleMarkReadyToDispatch,
      handleMarkDispatched,
      isAccepting,
      isRejecting,
      isMarkingReady,
      isDispatching,
    ],
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
  });

  const emptyMessages: Record<FilterTab, string> = {
    all:         'You have no orders yet.',
    new:         'No new orders awaiting your action.',
    processing:  'No orders in processing.',
    dispatched:  'No orders dispatched to tailor.',
    at_tailor:   'No orders currently at the tailor.',
    completed:   'No completed orders yet.',
  };

  return (
    <View style={styles.screen}>
      <DashHeader title="Orders" subtitle="Seller Dashboard" />

      {/* Filter tabs */}
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

      {isLoading ? (
        <OrdersSkeletonList />
      ) : isError ? (
        <View style={{ padding: sp.base }}>
          <ErrorBanner
            message="Could not load orders. Please try again."
            onRetry={refetch}
          />
        </View>
      ) : !data || data.orders.length === 0 ? (
        <EmptyState
          icon={
            <IconSymbol name="shippingbox.fill" size={32} color={colors.textLow} />
          }
          title="No orders"
          message={emptyMessages[activeTab]}
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
