import React, { useCallback } from 'react';
import {
  FlatList,
  Image,
  ListRenderItem,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  useGetSellerDashboardQuery,
  useAcceptOrderMutation,
  useRejectOrderMutation,
} from '@services/sellerApi';
import type { SellerOrder, SellerProduct } from '@services/sellerApi';
import { useAppSelector } from '@store/index';
import { useTheme } from '@shared/theme';
import {
  Avatar,
  Badge,
  Button,
  EmptyState,
  ErrorBanner,
  SectionHeader,
  Skeleton,
} from '@shared/components/ui';
import { IconSymbol } from '@shared/components/ui/icon-symbol';
import { formatPkr } from '@shared/utils';

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SellerOverviewSkeleton(): React.JSX.Element {
  const { colors, sp, r } = useTheme();

  const styles = StyleSheet.create({
    statsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: sp.sm,
      paddingHorizontal: sp.base,
      marginTop: sp.lg,
    },
    statCard: {
      width: '47%',
      height: 88,
      backgroundColor: colors.elevated,
      borderRadius: r.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    section: { paddingHorizontal: sp.base, marginTop: sp.xl },
    orderCard: {
      height: 110,
      backgroundColor: colors.elevated,
      borderRadius: r.lg,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: sp.sm,
    },
  });

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.statsRow}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={styles.statCard} />
        ))}
      </View>
      <View style={styles.section}>
        <Skeleton width={140} height={18} />
        <View style={{ marginTop: sp.md }}>
          <View style={styles.orderCard} />
          <View style={styles.orderCard} />
        </View>
      </View>
      <View style={styles.section}>
        <Skeleton width={120} height={18} />
        <View style={{ marginTop: sp.md }}>
          <View style={[styles.orderCard, { height: 64 }]} />
          <View style={[styles.orderCard, { height: 64 }]} />
        </View>
      </View>
    </ScrollView>
  );
}

// ─── Pending Order Card ────────────────────────────────────────────────────────

export interface SellerOrderCardProps {
  order: SellerOrder;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  isAccepting: boolean;
  isRejecting: boolean;
}

export const SellerOrderCard = React.memo(function SellerOrderCard({
  order,
  onAccept,
  onReject,
  isAccepting,
  isRejecting,
}: SellerOrderCardProps): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();

  const handleAccept = useCallback(() => onAccept(order._id), [onAccept, order._id]);
  const handleReject = useCallback(() => onReject(order._id), [onReject, order._id]);

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
    orderNum: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansMed,
      color: colors.textLow,
      textTransform: 'uppercase',
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
    <View style={styles.card}>
      <View style={styles.row}>
        {order.productImage !== null ? (
          <Image source={{ uri: order.productImage }} style={styles.thumbnail} />
        ) : (
          <View style={styles.thumbnail} />
        )}
        <View style={styles.meta}>
          <Text style={styles.orderNum}>#{order.orderNumber}</Text>
          <Text style={styles.productTitle} numberOfLines={1}>
            {order.productTitle}
          </Text>
          <Text style={styles.customer}>{order.customerName}</Text>
        </View>
        <Text style={styles.amount}>{formatPkr(order.totalAmount)}</Text>
      </View>

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
    </View>
  );
});

// ─── Low Stock Row ─────────────────────────────────────────────────────────────

export interface LowStockRowProps {
  product: SellerProduct;
}

export const LowStockRow = React.memo(function LowStockRow({
  product,
}: LowStockRowProps): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();

  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: sp.sm,
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: sp.md,
      marginBottom: sp.xs,
      ...elev.low,
    },
    thumbnail: {
      width: 44,
      height: 44,
      borderRadius: r.sm,
      backgroundColor: colors.panel,
    },
    meta: { flex: 1 },
    title: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.textHigh,
    },
    category: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
    },
    stockText: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.warning,
    },
  });

  return (
    <View style={styles.row}>
      {product.imageUrl !== null ? (
        <Image source={{ uri: product.imageUrl }} style={styles.thumbnail} />
      ) : (
        <View style={styles.thumbnail} />
      )}
      <View style={styles.meta}>
        <Text style={styles.title} numberOfLines={1}>{product.title}</Text>
        <Text style={styles.category}>{product.category}</Text>
      </View>
      <Text style={styles.stockText}>{product.stock} left</Text>
    </View>
  );
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SellerOverviewScreen(): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();
  const insets = useSafeAreaInsets();
  const authUser = useAppSelector((s) => s.auth.user);

  const { data, isLoading, isError, refetch } = useGetSellerDashboardQuery();
  const [acceptOrder, { isLoading: isAccepting }] = useAcceptOrderMutation();
  const [rejectOrder, { isLoading: isRejecting }] = useRejectOrderMutation();

  const firstName = (authUser?.name ?? '').split(' ')[0] ?? 'Seller';

  const handleAccept = useCallback(
    (id: string) => {
      void acceptOrder(id);
    },
    [acceptOrder],
  );

  const handleReject = useCallback(
    (id: string) => {
      void rejectOrder({ id, reason: 'Rejected by seller' });
    },
    [rejectOrder],
  );

  const renderPendingOrder = useCallback<ListRenderItem<SellerOrder>>(
    ({ item }) => (
      <SellerOrderCard
        order={item}
        onAccept={handleAccept}
        onReject={handleReject}
        isAccepting={isAccepting}
        isRejecting={isRejecting}
      />
    ),
    [handleAccept, handleReject, isAccepting, isRejecting],
  );

  const renderLowStock = useCallback<ListRenderItem<SellerProduct>>(
    ({ item }) => <LowStockRow product={item} />,
    [],
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
    banner: {
      marginHorizontal: sp.base,
      marginTop: sp.md,
      borderRadius: r.md,
      padding: sp.md,
      gap: sp.xs,
    },
    bannerTitle: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
    },
    bannerMsg: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: sp.sm,
      paddingHorizontal: sp.base,
      marginTop: sp.lg,
    },
    statCard: {
      width: '47%',
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

  const header = (
    <View style={styles.header}>
      <View style={{ flex: 1 }}>
        <Text style={styles.greeting}>Hello, {firstName}</Text>
        <Text style={styles.subtitle}>Seller Dashboard</Text>
      </View>
      <Avatar
        uri={authUser?.avatarUrl ?? undefined}
        name={authUser?.name}
        size={40}
      />
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.screen}>
        {header}
        <SellerOverviewSkeleton />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.screen}>
        {header}
        <View style={{ padding: sp.base, marginTop: sp.lg }}>
          <ErrorBanner
            message="Could not load your seller dashboard. Please try again."
            onRetry={refetch}
          />
        </View>
      </View>
    );
  }

  const { store, stats, pendingOrders, lowStockProducts } = data;

  const statItems = [
    {
      icon: 'tag.fill' as const,
      value: stats.totalProducts.toLocaleString(),
      label: 'Total Products',
    },
    {
      icon: 'shippingbox.fill' as const,
      value: stats.pendingOrders.toLocaleString(),
      label: 'Pending Orders',
    },
    {
      icon: 'chart.bar.fill' as const,
      value: formatPkr(stats.revenueThisMonth),
      label: 'Revenue This Month',
    },
    {
      icon: 'star.fill' as const,
      value: stats.storeRating > 0 ? `${stats.storeRating.toFixed(1)} \u2605` : '–',
      label: 'Store Rating',
    },
  ];

  return (
    <View style={styles.screen}>
      {header}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Store status banners */}
        {store.status === 'pending' && (
          <View
            style={[
              styles.banner,
              { backgroundColor: colors.warningSubtle, borderWidth: 1, borderColor: colors.warning },
            ]}
          >
            <Text style={[styles.bannerTitle, { color: colors.warning }]}>
              Store Under Review
            </Text>
            <Text style={[styles.bannerMsg, { color: colors.textMid }]}>
              Your store is under review. You can set up products while we verify your account.
            </Text>
          </View>
        )}

        {store.status === 'suspended' && (
          <View
            style={[
              styles.banner,
              { backgroundColor: colors.errorSubtle, borderWidth: 1, borderColor: colors.error },
            ]}
          >
            <Text style={[styles.bannerTitle, { color: colors.error }]}>
              Store Suspended
            </Text>
            <Text style={[styles.bannerMsg, { color: colors.textMid }]}>
              Your store has been suspended. Contact support.
            </Text>
          </View>
        )}

        {/* KPI Grid */}
        <View style={styles.statsGrid}>
          {statItems.map((item) => (
            <View key={item.label} style={styles.statCard}>
              <IconSymbol name={item.icon} size={20} color={colors.accent} />
              <Text style={styles.statValue} numberOfLines={1}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Pending Orders */}
        <View style={styles.section}>
          <SectionHeader
            title="Pending Orders"
            subtitle={`${pendingOrders.length} awaiting action`}
          />
          {pendingOrders.length === 0 ? (
            <EmptyState
              icon={<IconSymbol name="shippingbox.fill" size={32} color={colors.textLow} />}
              title="No pending orders"
              message="New orders will appear here for your review."
            />
          ) : (
            <FlatList
              data={pendingOrders}
              keyExtractor={(item) => item._id}
              renderItem={renderPendingOrder}
              scrollEnabled={false}
            />
          )}
        </View>

        {/* Low Stock */}
        <View style={styles.section}>
          <SectionHeader
            title="Low Stock Alert"
            subtitle="Products with fewer than 5 units"
          />
          {lowStockProducts.length === 0 ? (
            <EmptyState
              icon={<IconSymbol name="tag.fill" size={32} color={colors.textLow} />}
              title="Stock levels look good"
              message="Products running low will appear here."
            />
          ) : (
            <FlatList
              data={lowStockProducts}
              keyExtractor={(item) => item._id}
              renderItem={renderLowStock}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}
