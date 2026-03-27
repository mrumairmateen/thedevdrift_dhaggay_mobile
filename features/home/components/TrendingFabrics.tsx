import { ProductCard } from '@features/shop/components/ProductCard';
import { DUMMY_FABRICS } from '@features/home/home.fixtures';
import { useTheme } from '@shared/theme';
import { useGetProductsQuery } from '@services/shopApi';
import { ScrollView, StyleSheet, View } from 'react-native';

const CARD_WIDTH = 160;

function FabricSkeleton() {
  const { colors, r, sp } = useTheme();
  const imageHeight = Math.round(CARD_WIDTH * 1.25);
  return (
    <View
      style={[
        styles.skeleton,
        {
          width: CARD_WIDTH,
          borderRadius: r.md,
          backgroundColor: colors.panel,
          overflow: 'hidden',
        },
      ]}
    >
      <View style={{ height: imageHeight, backgroundColor: colors.panel }} />
      <View style={{ padding: sp.sm, gap: sp.xs }}>
        <View style={{ height: 10, width: '40%', backgroundColor: colors.border, borderRadius: r.sharp }} />
        <View style={{ height: 13, width: '85%', backgroundColor: colors.border, borderRadius: r.sharp }} />
        <View style={{ height: 16, width: '50%', backgroundColor: colors.border, borderRadius: r.sharp }} />
      </View>
    </View>
  );
}

export function TrendingFabrics() {
  const { sp } = useTheme();
  const { data, isLoading } = useGetProductsQuery({ sort: 'rating', limit: 8 });
  const products = data?.products?.length ? data.products : DUMMY_FABRICS;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.container, { paddingHorizontal: sp.base, gap: sp.md }]}
    >
      {isLoading
        ? Array.from({ length: 5 }).map((_, i) => <FabricSkeleton key={i} />)
        : products.map((product) => (
            <ProductCard key={product._id} product={product} width={CARD_WIDTH} />
          ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  skeleton: {},
});
