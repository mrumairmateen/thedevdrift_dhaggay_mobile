import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ListRenderItem,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  useGetTailorOrderByIdQuery,
  useUpdateOrderMilestoneMutation,
} from '@services/tailorDashApi';
import type { TailorOrderItem, OrderStatus } from '@services/tailorDashApi';
import { useTheme } from '@shared/theme';
import { Badge, Button, ErrorBanner, Skeleton } from '@shared/components/ui';
import { IconSymbol } from '@shared/components/ui/icon-symbol';
import { formatPkr } from '@shared/utils';

// ─── Status helpers ───────────────────────────────────────────────────────────

function statusLabel(s: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    placed:                          'Placed',
    accepted_by_seller:              'Accepted by Seller',
    ready_to_dispatch_to_tailor:     'Ready to Dispatch',
    dispatching_to_tailor:           'In Transit to You',
    delivered_to_tailor:             'Fabric Arrived',
    tailor_working:                  'Stitching',
    ready_for_customer_delivery:     'Ready for Delivery',
    dispatching_to_customer:         'Out for Delivery',
    delivered_to_customer:           'Delivered',
    finding_replacement_tailor:      'Finding Replacement',
    disputed:                        'Disputed',
    cancelled_by_customer:           'Cancelled by Customer',
    cancelled_by_seller:             'Cancelled by Seller',
    cancelled_by_tailor:             'Cancelled by You',
    cancelled_by_admin:              'Cancelled by Admin',
    cancelled_post_dispute:          'Cancelled (Dispute)',
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

/**
 * The ONLY two transitions a tailor may trigger via PATCH /api/v1/orders/:id/milestone:
 *   delivered_to_tailor → tailor_working          ("Start Working")
 *   tailor_working      → ready_for_customer_delivery  ("Mark Ready")
 */
interface NextTransition {
  nextStatus: OrderStatus;
  ctaLabel: string;
}

function getNextTransition(current: OrderStatus): NextTransition | null {
  if (current === 'delivered_to_tailor') {
    return { nextStatus: 'tailor_working', ctaLabel: 'Start Working' };
  }
  if (current === 'tailor_working') {
    return { nextStatus: 'ready_for_customer_delivery', ctaLabel: 'Mark Ready' };
  }
  return null;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function OrderDetailSkeleton(): React.JSX.Element {
  const { sp, r } = useTheme();
  const styles = StyleSheet.create({
    content: { padding: sp.base, gap: sp.base },
  });
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Skeleton width="100%" height={80} radius={r.lg} />
        <Skeleton width="100%" height={110} radius={r.lg} />
        <Skeleton width="100%" height={80} radius={r.lg} />
        <Skeleton width="100%" height={120} radius={r.lg} />
        <Skeleton width="100%" height={80} radius={r.lg} />
      </View>
    </ScrollView>
  );
}

// ─── Section card wrapper ──────────────────────────────────────────────────────

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
}

const SectionCard = React.memo(function SectionCard({
  title,
  children,
}: SectionCardProps): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: sp.md,
      marginBottom: sp.md,
      ...elev.low,
    },
    title: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansBold,
      color: colors.textMid,
      marginBottom: sp.sm,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
  });

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
});

// ─── Status History Item ──────────────────────────────────────────────────────

interface HistoryItem {
  status: string;
  changedAt: string;
  note?: string;
}

interface StatusHistoryItemProps {
  item: HistoryItem;
}

const StatusHistoryItem = React.memo(function StatusHistoryItem({
  item,
}: StatusHistoryItemProps): React.JSX.Element {
  const { colors, sp, typo } = useTheme();

  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: sp.sm,
      paddingVertical: sp.xs,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.accent,
      marginTop: 4,
    },
    content: { flex: 1 },
    statusText: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansMed,
      color: colors.textHigh,
    },
    dateText: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textLow,
    },
    noteText: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
      marginTop: 2,
    },
  });

  return (
    <View style={styles.row}>
      <View style={styles.dot} />
      <View style={styles.content}>
        <Text style={styles.statusText}>{item.status.replace(/_/g, ' ')}</Text>
        <Text style={styles.dateText}>
          {new Date(item.changedAt).toLocaleString('en-PK')}
        </Text>
        {item.note !== undefined && item.note.length > 0 && (
          <Text style={styles.noteText}>{item.note}</Text>
        )}
      </View>
    </View>
  );
});

// ─── Detail body ──────────────────────────────────────────────────────────────

interface OrderDetailBodyProps {
  order: TailorOrderItem;
}

function OrderDetailBody({ order }: OrderDetailBodyProps): React.JSX.Element {
  const { colors, sp, r, typo } = useTheme();

  const [updateMilestone, { isLoading: isUpdating }] = useUpdateOrderMilestoneMutation();

  const nextTransition = getNextTransition(order.status);

  const handleStatusUpdate = useCallback(() => {
    if (nextTransition === null) return;
    Alert.alert(
      'Update Status',
      `Change order status to "${nextTransition.ctaLabel}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            void updateMilestone({ id: order._id, status: nextTransition.nextStatus });
          },
        },
      ],
    );
  }, [nextTransition, updateMilestone, order._id]);

  const measurementEntries = order.measurements !== null
    ? Object.entries(order.measurements)
    : [];

  const renderHistoryItem = useCallback<ListRenderItem<HistoryItem>>(
    ({ item }) => <StatusHistoryItem item={item} />,
    [],
  );

  const styles = StyleSheet.create({
    content: { padding: sp.base, paddingBottom: sp['4xl'] },
    statusCard: {
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: sp.md,
      marginBottom: sp.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    productRow: { flexDirection: 'row', gap: sp.md, alignItems: 'flex-start' },
    thumbnail: {
      width: 72,
      height: 72,
      borderRadius: r.sm,
      backgroundColor: colors.panel,
    },
    productInfo: { flex: 1 },
    productTitle: {
      ...typo.scale.body,
      fontFamily: typo.fonts.sansBold,
      color: colors.textHigh,
    },
    customerName: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
      marginTop: 2,
    },
    designTitle: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textLow,
      marginTop: 2,
    },
    statusLabel: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansMed,
      color: colors.textMid,
    },
    lastUpdated: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textLow,
      marginTop: 2,
    },
    rowItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: sp.xs,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    rowKey: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
      flex: 1,
    },
    rowValue: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansMed,
      color: colors.textHigh,
      flex: 1,
      textAlign: 'right',
    },
    feeText: {
      ...typo.scale.price,
      fontFamily: typo.fonts.sansBold,
      color: colors.accent,
    },
    noteText: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
    },
    ctaCard: {
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: sp.md,
      marginBottom: sp.md,
      alignItems: 'center',
      gap: sp.sm,
    },
    ctaTitle: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansMed,
      color: colors.textMid,
    },
    emptyMeasure: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textLow,
    },
  });

  const lastHistory = order.statusHistory[order.statusHistory.length - 1];
  const lastUpdated = lastHistory !== undefined
    ? new Date(lastHistory.changedAt).toLocaleString('en-PK')
    : null;

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.content}>

        {/* Status card */}
        <View style={styles.statusCard}>
          <View>
            <Text style={styles.statusLabel}>Current Status</Text>
            {lastUpdated !== null && (
              <Text style={styles.lastUpdated}>{lastUpdated}</Text>
            )}
          </View>
          <Badge
            label={statusLabel(order.status)}
            variant={statusVariant(order.status)}
          />
        </View>

        {/* Customer & product */}
        <SectionCard title="Order Info">
          <View style={styles.productRow}>
            {order.productImage !== null ? (
              <Image
                source={{ uri: order.productImage }}
                style={styles.thumbnail}
                contentFit="cover"
              />
            ) : (
              <View style={styles.thumbnail} />
            )}
            <View style={styles.productInfo}>
              <Text style={styles.productTitle}>{order.productTitle}</Text>
              <Text style={styles.customerName}>{order.customerName}</Text>
              {order.designTitle !== null && (
                <Text style={styles.designTitle}>{order.designTitle}</Text>
              )}
              <Text style={[styles.customerName, { marginTop: sp.sm }]}>
                Fee: <Text style={styles.feeText}>{formatPkr(order.stitchingFee)}</Text>
              </Text>
              {order.deadline !== null && (
                <Text style={styles.customerName}>
                  Due: {new Date(order.deadline).toLocaleDateString('en-PK')}
                </Text>
              )}
            </View>
          </View>
        </SectionCard>

        {/* Measurements */}
        <SectionCard title="Measurements">
          {measurementEntries.length === 0 ? (
            <Text style={styles.emptyMeasure}>No measurements recorded.</Text>
          ) : (
            measurementEntries.map(([key, value]) => (
              <View key={key} style={styles.rowItem}>
                <Text style={styles.rowKey}>{key.replace(/_/g, ' ')}</Text>
                <Text style={styles.rowValue}>{value} cm</Text>
              </View>
            ))
          )}
        </SectionCard>

        {/* Delivery address */}
        {order.deliveryAddress !== null && (
          <SectionCard title="Delivery Address">
            <View style={styles.rowItem}>
              <Text style={styles.rowKey}>Address</Text>
              <Text style={styles.rowValue}>{order.deliveryAddress.line1}</Text>
            </View>
            <View style={styles.rowItem}>
              <Text style={styles.rowKey}>City</Text>
              <Text style={styles.rowValue}>{order.deliveryAddress.city}</Text>
            </View>
            {order.deliveryAddress.area !== undefined && (
              <View style={styles.rowItem}>
                <Text style={styles.rowKey}>Area</Text>
                <Text style={styles.rowValue}>{order.deliveryAddress.area}</Text>
              </View>
            )}
            {order.deliveryAddress.phone !== undefined && (
              <View style={styles.rowItem}>
                <Text style={styles.rowKey}>Phone</Text>
                <Text style={styles.rowValue}>{order.deliveryAddress.phone}</Text>
              </View>
            )}
          </SectionCard>
        )}

        {/* Notes */}
        {order.notes !== null && order.notes.length > 0 && (
          <SectionCard title="Customer Notes">
            <Text style={styles.noteText}>{order.notes}</Text>
          </SectionCard>
        )}

        {/* Status history */}
        <SectionCard title="Status History">
          <FlatList
            data={order.statusHistory}
            keyExtractor={(item, idx) => `${item.changedAt}-${idx}`}
            renderItem={renderHistoryItem}
            scrollEnabled={false}
          />
        </SectionCard>

        {/* Update status CTA — only for the 2 tailor-driven transitions */}
        {nextTransition !== null && (
          <View style={styles.ctaCard}>
            <Text style={styles.ctaTitle}>Next Action</Text>
            {isUpdating ? (
              <ActivityIndicator color={colors.accent} />
            ) : (
              <Button
                label={nextTransition.ctaLabel}
                onPress={handleStatusUpdate}
                variant="primary"
                fullWidth
              />
            )}
          </View>
        )}

      </View>
    </ScrollView>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function TailorOrderDetailScreen(): React.JSX.Element {
  const { colors, sp, typo, elev } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const orderId = id ?? '';
  const { data: order, isLoading, isError, refetch } = useGetTailorOrderByIdQuery(orderId);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

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
    headerSide: {
      width: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      ...typo.scale.title3,
      fontFamily: typo.fonts.serifBold,
      color: colors.textHigh,
      flex: 1,
      textAlign: 'center',
    },
    errorContainer: {
      flex: 1,
      padding: sp.base,
      paddingTop: sp.lg,
    },
  });

  const headerTitle = order !== undefined ? `Order #${order.orderNumber}` : 'Order Detail';

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} hitSlop={8} style={styles.headerSide}>
          <IconSymbol name="chevron.left" size={22} color={colors.textHigh} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {headerTitle}
        </Text>
        <View style={styles.headerSide} />
      </View>

      {isLoading ? (
        <OrderDetailSkeleton />
      ) : isError || order === undefined ? (
        <View style={styles.errorContainer}>
          <ErrorBanner
            message="Could not load order details. Please try again."
            onRetry={refetch}
          />
        </View>
      ) : (
        <OrderDetailBody order={order} />
      )}
    </View>
  );
}
