import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  useGetAdminOrdersQuery,
  useForceCancelMutation,
} from '@services/adminApi';
import type { AdminOrder } from '@services/adminApi';
import { useTheme } from '@shared/theme';
import {
  Badge,
  Button,
  Chip,
  EmptyState,
  ErrorBanner,
} from '@shared/components/ui';
import { IconSymbol } from '@shared/components/ui/icon-symbol';
import { formatPkr } from '@shared/utils/pkr';
import type { BadgeVariant } from '@shared/components/ui';

// ─── Constants ────────────────────────────────────────────────────────────────

type StatusFilter = 'all' | 'pending' | 'active' | 'completed' | 'cancelled';

const STATUS_FILTERS: Array<{ label: string; value: StatusFilter }> = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function orderStatusVariant(status: string): BadgeVariant {
  if (status === 'delivered_to_customer') return 'success';
  if (status.startsWith('cancelled')) return 'error';
  if (status === 'disputed') return 'error';
  if (status === 'placed' || status === 'accepted_by_seller') return 'info';
  return 'warning';
}

function isFinalStatus(status: string): boolean {
  return (
    status === 'delivered_to_customer' ||
    status.startsWith('cancelled')
  );
}

// ─── Order Row ────────────────────────────────────────────────────────────────

interface AdminOrderRowProps {
  order: AdminOrder;
}

const AdminOrderRow = React.memo(function AdminOrderRow({
  order,
}: AdminOrderRowProps): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();
  const [forceCancel, { isLoading: isCancelling }] = useForceCancelMutation();

  const handleCancel = useCallback(() => {
    Alert.alert(
      'Cancel Order',
      `Are you sure you want to cancel order #${order.orderNumber}? This cannot be undone.`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            void forceCancel({ id: order._id, reason: 'Cancelled by admin' });
          },
        },
      ],
    );
  }, [forceCancel, order._id, order.orderNumber]);

  const placedDate = new Date(order.placedAt).toLocaleDateString('en-PK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      padding: sp.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: sp.sm,
      gap: sp.sm,
      ...elev.low,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    orderNumber: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.textHigh,
    },
    date: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
    },
    chain: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
    },
    product: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
    },
    bottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    amount: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.accent,
    },
  });

  const tailorPart =
    order.tailorName !== null ? ` → ${order.tailorName}` : '';
  const chainText = `${order.customerName} → ${order.sellerName}${tailorPart}`;
  const productText = order.city !== null
    ? `${order.productTitle} · ${order.city}`
    : order.productTitle;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
        <Text style={styles.date}>{placedDate}</Text>
      </View>
      <Text style={styles.chain} numberOfLines={1}>{chainText}</Text>
      <Text style={styles.product} numberOfLines={1}>{productText}</Text>
      <View style={styles.bottomRow}>
        <Text style={styles.amount}>{formatPkr(order.totalAmount)}</Text>
        <Badge
          label={order.status.replace(/_/g, ' ')}
          variant={orderStatusVariant(order.status)}
          size="sm"
        />
      </View>
      {!isFinalStatus(order.status) && (
        <Button
          label="Cancel Order"
          onPress={handleCancel}
          variant="danger"
          size="sm"
          loading={isCancelling}
        />
      )}
    </View>
  );
});

// ─── Row Skeleton ─────────────────────────────────────────────────────────────

function OrderRowSkeleton(): React.JSX.Element {
  const { colors, sp, r } = useTheme();

  const styles = StyleSheet.create({
    card: {
      height: 140,
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: sp.sm,
    },
  });

  return <View style={styles.card} />;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AdminOrdersScreen(): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();
  const insets = useSafeAreaInsets();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchText, setSearchText] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  // Debounce — 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchText]);

  const queryStatus = statusFilter === 'all' ? undefined : statusFilter;

  const { data, isLoading, isError, refetch } = useGetAdminOrdersQuery({
    status: queryStatus,
    search: debouncedSearch.length > 0 ? debouncedSearch : undefined,
    page: 1,
    limit: 20,
  });

  const renderOrder = useCallback(
    ({ item }: { item: AdminOrder }) => <AdminOrderRow order={item} />,
    [],
  );

  const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg },
    header: {
      backgroundColor: colors.navSolid,
      paddingTop: insets.top + sp.sm,
      paddingHorizontal: sp.base,
      paddingBottom: sp.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      ...elev.high,
    },
    title: {
      ...typo.scale.title3,
      fontFamily: typo.fonts.serifBold,
      color: colors.textHigh,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBg,
      borderRadius: r.sm,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: sp.md,
      marginTop: sp.md,
      height: 44,
      gap: sp.sm,
    },
    searchInput: {
      flex: 1,
      ...typo.scale.body,
      fontFamily: typo.fonts.sans,
      color: colors.textHigh,
    },
    filtersWrap: {
      paddingHorizontal: sp.base,
      paddingVertical: sp.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.navSolid,
    },
    list: { flex: 1 },
    listContent: {
      padding: sp.base,
      paddingBottom: sp['4xl'],
    },
    errorWrap: { padding: sp.base },
    skeletonWrap: { padding: sp.base },
  });

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>All Orders</Text>
        <View style={styles.searchBar}>
          <IconSymbol name="magnifyingglass" size={18} color={colors.textLow} />
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search order number or customer..."
            placeholderTextColor={colors.textLow}
            autoCapitalize="none"
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Filter chips */}
      <View style={styles.filtersWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: sp.xs }}>
            {STATUS_FILTERS.map((f) => (
              <Chip
                key={f.value}
                label={f.label}
                active={statusFilter === f.value}
                onPress={() => setStatusFilter(f.value)}
                size="sm"
              />
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.skeletonWrap}>
          {[0, 1, 2, 3].map((i) => (
            <OrderRowSkeleton key={i} />
          ))}
        </View>
      ) : isError ? (
        <View style={styles.errorWrap}>
          <ErrorBanner
            message="Could not load orders. Please try again."
            onRetry={refetch}
          />
        </View>
      ) : (
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={data?.orders ?? []}
          keyExtractor={(item) => item._id}
          renderItem={renderOrder}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon={<IconSymbol name="shippingbox.fill" size={32} color={colors.textLow} />}
              title="No orders found"
              message="Try adjusting your search or status filter."
            />
          }
        />
      )}
    </View>
  );
}
