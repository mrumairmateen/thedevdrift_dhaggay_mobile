import React, { useCallback } from 'react';
import { FlatList, ListRenderItem, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useGetProductsQuery } from '@services/shopApi';
import { ProductCard } from '@features/shop/components/ProductCard';
import { useTheme } from '@shared/theme';
import type { ShopProduct } from '@features/shop/shop.types';

const CARD_WIDTH = 160;
const SKELETON_COUNT = 4;
const SKELETON_KEYS = ['sk0', 'sk1', 'sk2', 'sk3'] as const;

const QUERY_PARAMS = { sort: 'rating', limit: 8 } as const;

function SkeletonCard(): React.JSX.Element {
  const { colors, r, sp } = useTheme();

  const styles = StyleSheet.create({
    card: {
      width: CARD_WIDTH,
      borderRadius: r.md,
      backgroundColor: colors.panel,
      overflow: 'hidden',
    },
    imageArea: {
      height: Math.round(CARD_WIDTH * 1.15),
      backgroundColor: colors.panel,
    },
    body: {
      padding: sp.sm,
      gap: sp.xs,
    },
    line1: {
      height: 10,
      width: '40%',
      backgroundColor: colors.border,
      borderRadius: r.sharp,
    },
    line2: {
      height: 13,
      width: '85%',
      backgroundColor: colors.border,
      borderRadius: r.sharp,
    },
    line3: {
      height: 16,
      width: '50%',
      backgroundColor: colors.border,
      borderRadius: r.sharp,
    },
  });

  return (
    <View style={styles.card}>
      <View style={styles.imageArea} />
      <View style={styles.body}>
        <View style={styles.line1} />
        <View style={styles.line2} />
        <View style={styles.line3} />
      </View>
    </View>
  );
}

export const TrendingFabrics = React.memo(function TrendingFabrics(): React.JSX.Element {
  const { sp } = useTheme();
  const router = useRouter();
  const { data, isLoading, isError } = useGetProductsQuery(QUERY_PARAMS);

  const styles = StyleSheet.create({
    contentContainer: {
      paddingHorizontal: sp.base,
      gap: sp.md,
    },
    skeletonRow: {
      flexDirection: 'row',
      paddingHorizontal: sp.base,
      gap: sp.md,
    },
  });

  const handlePress = useCallback(
    (slug: string) => {
      router.push(`/shop/${slug}` as Parameters<typeof router.push>[0]);
    },
    [router],
  );

  const renderItem = useCallback<ListRenderItem<ShopProduct>>(
    ({ item }) => (
      <ProductCard product={item} width={CARD_WIDTH} onPress={handlePress} />
    ),
    [handlePress],
  );

  const keyExtractor = useCallback((item: ShopProduct) => item._id, []);

  if (isLoading) {
    return (
      <View style={styles.skeletonRow}>
        {SKELETON_KEYS.slice(0, SKELETON_COUNT).map(key => (
          <SkeletonCard key={key} />
        ))}
      </View>
    );
  }

  if (isError) {
    return <View />;
  }

  const products = data?.products ?? [];

  return (
    <FlatList
      data={products}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
      removeClippedSubviews={true}
    />
  );
});
