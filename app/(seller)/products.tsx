import React, { useCallback } from 'react';
import {
  FlatList,
  Image,
  ListRenderItem,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import {
  useGetSellerProductsQuery,
  useToggleProductStatusMutation,
} from '@services/sellerApi';
import type { SellerProduct } from '@services/sellerApi';
import { useTheme } from '@shared/theme';
import {
  Badge,
  EmptyState,
  ErrorBanner,
  Skeleton,
} from '@shared/components/ui';
import { IconSymbol } from '@shared/components/ui/icon-symbol';
import { formatPkr } from '@shared/utils';
import { DashboardHeader } from '@features/dashboard/components/shared/DashboardHeader';

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ProductsSkeletonList(): React.JSX.Element {
  const { sp, r } = useTheme();
  return (
    <View style={{ padding: sp.base, gap: sp.sm }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Skeleton key={i} width="100%" height={80} radius={r.lg} />
      ))}
    </View>
  );
}

// ─── Product Row ──────────────────────────────────────────────────────────────

export interface ProductRowProps {
  product: SellerProduct;
  onToggle: (id: string, nextStatus: 'active' | 'inactive') => void;
  isToggling: boolean;
}

export const ProductRow = React.memo(function ProductRow({
  product,
  onToggle,
  isToggling,
}: ProductRowProps): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();

  const handleToggle = useCallback(
    (value: boolean) => {
      onToggle(product._id, value ? 'active' : 'inactive');
    },
    [onToggle, product._id],
  );

  const statusConfig: Record<
    SellerProduct['status'],
    { label: string; variant: 'success' | 'warning' | 'error' | 'neutral' | 'info' }
  > = {
    active:      { label: 'Active',       variant: 'success' },
    inactive:    { label: 'Inactive',     variant: 'warning' },
    out_of_stock:{ label: 'Out of Stock', variant: 'error'   },
  };

  const { label, variant } = statusConfig[product.status];
  const isActive = product.status === 'active';
  const canToggle = product.status !== 'out_of_stock';

  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: sp.sm,
      backgroundColor: colors.elevated,
      borderRadius: r.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: sp.md,
      marginBottom: sp.sm,
      ...elev.low,
    },
    thumbnail: {
      width: 52,
      height: 52,
      borderRadius: r.sm,
      backgroundColor: colors.panel,
    },
    meta: { flex: 1 },
    title: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.textHigh,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: sp.xs,
      marginTop: sp.xs,
      flexWrap: 'wrap',
    },
    category: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
    },
    dot: {
      width: 3,
      height: 3,
      borderRadius: 2,
      backgroundColor: colors.border,
    },
    price: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sansBold,
      color: colors.textHigh,
    },
    stock: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textLow,
    },
    right: { alignItems: 'flex-end', gap: sp.sm },
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
        <View style={styles.detailRow}>
          <Text style={styles.category}>{product.category}</Text>
          <View style={styles.dot} />
          <Text style={styles.price}>{formatPkr(product.pricePerSuit)}</Text>
          <View style={styles.dot} />
          <Text style={styles.stock}>{product.stock} in stock</Text>
        </View>
      </View>

      <View style={styles.right}>
        <Badge label={label} variant={variant} size="sm" />
        {canToggle && (
          <Switch
            value={isActive}
            onValueChange={handleToggle}
            disabled={isToggling}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor={colors.textOnAccent}
          />
        )}
      </View>
    </View>
  );
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SellerProductsScreen(): React.JSX.Element {
  const { colors, sp } = useTheme();

  const { data, isLoading, isError, refetch } = useGetSellerProductsQuery({
    page: 1,
    limit: 20,
  });

  const [toggleProductStatus, { isLoading: isToggling }] = useToggleProductStatusMutation();

  const handleToggle = useCallback(
    (id: string, nextStatus: 'active' | 'inactive') => {
      void toggleProductStatus({ id, status: nextStatus });
    },
    [toggleProductStatus],
  );

  const renderItem = useCallback<ListRenderItem<SellerProduct>>(
    ({ item }) => (
      <ProductRow product={item} onToggle={handleToggle} isToggling={isToggling} />
    ),
    [handleToggle, isToggling],
  );

  const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg },
    listContent: { padding: sp.base, paddingBottom: sp['2xl'] },
  });

  return (
    <View style={styles.screen}>
      <DashboardHeader title="My Products" showBack={false} />

      {isLoading ? (
        <ProductsSkeletonList />
      ) : isError ? (
        <View style={{ padding: sp.base }}>
          <ErrorBanner
            message="Could not load your products. Please try again."
            onRetry={refetch}
          />
        </View>
      ) : !data || data.products.length === 0 ? (
        <EmptyState
          icon={<IconSymbol name="tag.fill" size={32} color={colors.textLow} />}
          title="No products yet"
          message="Add products via your web dashboard."
        />
      ) : (
        <FlatList
          data={data.products}
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
