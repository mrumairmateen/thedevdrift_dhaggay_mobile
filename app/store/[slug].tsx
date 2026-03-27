import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { CategoryPills } from '@features/shop/components/CategoryPills';
import { ProductCard } from '@features/shop/components/ProductCard';
import type { FabricCategory, ShopProduct, SortOption } from '@features/shop/shop.types';
import { useGetShopBySlugQuery, useGetShopProductsQuery } from '@services/shopApi';
import { useTheme } from '@shared/theme';

const { width: SW } = Dimensions.get('window');
const H_PAD = 16;
const CARD_GAP = 12;
const CARD_WIDTH = (SW - H_PAD * 2 - CARD_GAP) / 2;
const BANNER_H = 210;

const SORT_OPTIONS: Array<{ label: string; value: SortOption }> = [
  { label: 'Top Rated', value: 'rating' },
  { label: 'Price ↑',   value: 'price_asc' },
  { label: 'Price ↓',   value: 'price_desc' },
  { label: 'Newest',    value: 'newest' },
];

// ── Skeleton row ──────────────────────────────────────────────────────────────

function SkeletonCard({ width }: { width: number }) {
  const { colors, r, sp } = useTheme();
  const h = Math.round(width * 1.25);
  return (
    <View style={{ width, borderRadius: r.md, overflow: 'hidden', backgroundColor: colors.panel }}>
      <View style={{ height: h, backgroundColor: colors.panel }} />
      <View style={{ padding: sp.sm, gap: sp.xs }}>
        <View style={{ height: 10, width: '40%', backgroundColor: colors.border, borderRadius: r.sharp }} />
        <View style={{ height: 14, width: '80%', backgroundColor: colors.border, borderRadius: r.sharp }} />
        <View style={{ height: 16, width: '50%', backgroundColor: colors.border, borderRadius: r.sharp }} />
      </View>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function StorefrontScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { colors, sp, r, typo, elev } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [category, setCategory] = useState<FabricCategory | null>(null);
  const [sort, setSort]         = useState<SortOption>('rating');
  const [page, setPage]         = useState(1);
  const debounceRef             = useRef<ReturnType<typeof setTimeout>>();

  // ── Data ─────────────────────────────────────────────────────────────────

  const {
    data: shop,
    isLoading: shopLoading,
    isError: shopError,
    refetch: refetchShop,
  } = useGetShopBySlugQuery(slug ?? '');

  const productQuery = useMemo(
    () => ({
      slug: slug ?? '',
      ...(category ? { category } : {}),
      sort,
      page,
      limit: 20,
    }),
    [slug, category, sort, page],
  );

  const {
    data: productsData,
    isLoading: productsLoading,
    isFetching: productsFetching,
    refetch: refetchProducts,
  } = useGetShopProductsQuery(productQuery, { skip: !slug || shopError });

  const products    = productsData?.products ?? [];
  const totalPages  = productsData?.pages ?? 1;

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleCategoryChange = useCallback((cat: FabricCategory | null) => {
    setCategory(cat);
    setPage(1);
  }, []);

  const handleSort = useCallback((s: SortOption) => {
    setSort(s);
    setPage(1);
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: ShopProduct; index: number }) => (
      <View style={{ marginLeft: index % 2 === 1 ? CARD_GAP : 0 }}>
        <ProductCard product={item} width={CARD_WIDTH} />
      </View>
    ),
    [],
  );

  // ── Loading / Error ───────────────────────────────────────────────────────

  if (shopLoading) {
    return (
      <View style={[s.centered, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (shopError || !shop) {
    return (
      <View style={[s.centered, { backgroundColor: colors.bg, paddingHorizontal: sp['2xl'] }]}>
        <IconSymbol name="exclamationmark.triangle" size={40} color={colors.textLow} />
        <Text style={[typo.scale.body, { color: colors.textMid, fontFamily: typo.fonts.sans, marginTop: sp.md, textAlign: 'center' }]}>
          {shopError
            ? "Couldn't load this store.\nCheck your connection and try again."
            : 'Store not found.'}
        </Text>
        {shopError && (
          <Pressable
            onPress={() => refetchShop()}
            style={{ marginTop: sp.lg, backgroundColor: colors.accent, borderRadius: r.pill, paddingHorizontal: sp.xl, paddingVertical: sp.sm }}
          >
            <Text style={[typo.scale.label, { color: colors.textOnAccent, fontFamily: typo.fonts.sansBold }]}>
              RETRY
            </Text>
          </Pressable>
        )}
        <Pressable onPress={() => router.back()} style={{ marginTop: sp.md }}>
          <Text style={[typo.scale.bodySmall, { color: colors.textLow, fontFamily: typo.fonts.sans }]}>
            ← Go back
          </Text>
        </Pressable>
      </View>
    );
  }

  // ── List header (shop info + filters) ────────────────────────────────────

  const ListHeader = (
    <View>
      {/* ── Banner ────────────────────────────────────────────────────── */}
      <View style={{ height: BANNER_H, backgroundColor: colors.panel }}>
        {shop.banner?.url ? (
          <Image
            source={{ uri: shop.banner.url }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.accentSubtle }]} />
        )}

        {/* Gradient dim so back button is always visible */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.18)' }]} />

        {/* Back button */}
        <Pressable
          onPress={() => router.back()}
          style={[s.overlayBtn, { top: insets.top + sp.sm, left: sp.base }]}
        >
          <IconSymbol name="chevron.left" size={20} color="#fff" />
        </Pressable>

        {/* Logo — overlaps banner bottom */}
        <View
          style={[
            s.logoWrap,
            {
              bottom: -32,
              left: sp.base,
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: r.md,
            },
          ]}
        >
          {shop.logo?.url ? (
            <Image source={{ uri: shop.logo.url }} style={s.logoImg} contentFit="contain" />
          ) : (
            <View style={[s.logoImg, { backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }]}>
              <Text style={{ color: colors.textOnAccent, fontFamily: typo.fonts.sansBold, fontSize: 24 }}>
                {shop.name[0]?.toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* ── Shop Info ─────────────────────────────────────────────────── */}
      <View style={{ paddingHorizontal: sp.base, paddingTop: sp['4xl'] + sp.md, paddingBottom: sp.base }}>

        {/* Name + verified */}
        <View style={[s.row, { gap: sp.sm }]}>
          <Text
            style={[typo.scale.title2, { color: colors.textHigh, fontFamily: typo.fonts.serifBold, flex: 1 }]}
            numberOfLines={2}
          >
            {shop.name}
          </Text>
          {shop.isVerified && (
            <IconSymbol name="checkmark.seal.fill" size={20} color={colors.accent} />
          )}
        </View>

        {/* Category + location */}
        <View style={[s.row, { marginTop: sp.xs, gap: sp.sm, flexWrap: 'wrap' }]}>
          <View style={[s.chip, { backgroundColor: colors.accentSubtle, borderRadius: r.sharp }]}>
            <Text style={[typo.scale.label, { color: colors.accent, fontFamily: typo.fonts.sansMed }]}>
              {shop.category.toUpperCase()}
            </Text>
          </View>
          {shop.address?.city && (
            <View style={[s.row, { gap: 4 }]}>
              <IconSymbol name="mappin" size={12} color={colors.textLow} />
              <Text style={[typo.scale.caption, { color: colors.textMid, fontFamily: typo.fonts.sans }]}>
                {[shop.address.area, shop.address.city].filter(Boolean).join(', ')}
              </Text>
            </View>
          )}
        </View>

        {/* Stats strip */}
        <View
          style={[
            s.statsStrip,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: r.md,
              marginTop: sp.md,
            },
          ]}
        >
          <View style={s.statItem}>
            <IconSymbol name="star.fill" size={13} color="#F59E0B" />
            <Text style={[typo.scale.bodySmall, { color: colors.textHigh, fontFamily: typo.fonts.sansBold, marginLeft: 4 }]}>
              {shop.rating.toFixed(1)}
            </Text>
            <Text style={[typo.scale.caption, { color: colors.textLow, fontFamily: typo.fonts.sans, marginLeft: 3 }]}>
              ({shop.reviewCount})
            </Text>
          </View>
          <View style={[s.statDivider, { backgroundColor: colors.border }]} />
          <View style={s.statItem}>
            <IconSymbol name="bag" size={13} color={colors.textLow} />
            <Text style={[typo.scale.bodySmall, { color: colors.textHigh, fontFamily: typo.fonts.sansMed, marginLeft: 4 }]}>
              {shop.productCount}
            </Text>
            <Text style={[typo.scale.caption, { color: colors.textLow, fontFamily: typo.fonts.sans, marginLeft: 3 }]}>
              products
            </Text>
          </View>
          <View style={[s.statDivider, { backgroundColor: colors.border }]} />
          <View style={s.statItem}>
            <IconSymbol name="checkmark.circle" size={13} color={colors.textLow} />
            <Text style={[typo.scale.bodySmall, { color: colors.textHigh, fontFamily: typo.fonts.sansMed, marginLeft: 4 }]}>
              {shop.totalSales}
            </Text>
            <Text style={[typo.scale.caption, { color: colors.textLow, fontFamily: typo.fonts.sans, marginLeft: 3 }]}>
              sold
            </Text>
          </View>
        </View>

        {/* Description */}
        {shop.description ? (
          <Text
            style={[typo.scale.bodySmall, { color: colors.textMid, fontFamily: typo.fonts.sans, marginTop: sp.md, lineHeight: 20 }]}
          >
            {shop.description}
          </Text>
        ) : null}

        {/* Return policy */}
        {shop.policies?.returns ? (
          <View
            style={[
              s.policyRow,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: r.md,
                marginTop: sp.md,
              },
            ]}
          >
            <IconSymbol name="arrow.up.arrow.down" size={14} color={colors.accent} />
            <Text style={[typo.scale.caption, { color: colors.textMid, fontFamily: typo.fonts.sans, flex: 1, marginLeft: sp.sm }]}>
              {shop.policies.noReturnPolicy ? 'No returns accepted' : shop.policies.returns}
            </Text>
          </View>
        ) : null}

        {/* ── Products section header ──────────────────────────────────── */}
        <View style={[s.row, { justifyContent: 'space-between', marginTop: sp['2xl'] }]}>
          <Text style={[typo.scale.label, { color: colors.textLow, fontFamily: typo.fonts.sansMed, letterSpacing: 1.5 }]}>
            PRODUCTS
          </Text>
          {productsData && (
            <View style={s.row}>
              <Text style={[typo.scale.caption, { color: colors.textMid, fontFamily: typo.fonts.sans }]}>
                {productsData.total} {productsData.total === 1 ? 'item' : 'items'}
              </Text>
              {productsFetching && (
                <ActivityIndicator size="small" color={colors.accent} style={{ marginLeft: sp.sm }} />
              )}
            </View>
          )}
        </View>

        {/* Sort pills */}
        <View style={[s.row, { marginTop: sp.sm, gap: sp.sm, flexWrap: 'wrap' }]}>
          {SORT_OPTIONS.map(opt => {
            const active = opt.value === sort;
            return (
              <Pressable
                key={opt.value}
                onPress={() => handleSort(opt.value)}
                style={[
                  s.sortPill,
                  {
                    backgroundColor: active ? colors.accentSubtle : 'transparent',
                    borderColor: active ? colors.accent : colors.border,
                    borderRadius: r.pill,
                    paddingHorizontal: sp.sm,
                    paddingVertical: 4,
                  },
                ]}
              >
                <Text style={[typo.scale.label, { color: active ? colors.accent : colors.textMid, fontFamily: typo.fonts.sansMed }]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Category pills */}
      <View style={{ borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, borderBottomWidth: 1, paddingVertical: 10, backgroundColor: colors.surface }}>
        <CategoryPills active={category} onSelect={handleCategoryChange} />
      </View>

      {/* Products skeleton while loading */}
      {productsLoading && (
        <View style={[s.skeletonGrid, { paddingHorizontal: H_PAD, paddingTop: sp.base }]}>
          {Array.from({ length: 4 }).map((_, i) => (
            <View key={i} style={{ marginLeft: i % 2 === 1 ? CARD_GAP : 0, marginBottom: CARD_GAP }}>
              <SkeletonCard width={CARD_WIDTH} />
            </View>
          ))}
        </View>
      )}
    </View>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={[s.screen, { backgroundColor: colors.bg }]}>
      <FlatList
        data={productsLoading ? [] : products}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        numColumns={2}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={{
          paddingHorizontal: H_PAD,
          paddingBottom: insets.bottom + sp['4xl'],
        }}
        columnWrapperStyle={{ marginBottom: CARD_GAP }}
        refreshControl={
          <RefreshControl
            refreshing={productsFetching && !productsLoading}
            onRefresh={refetchProducts}
            tintColor={colors.accent}
          />
        }
        ListEmptyComponent={
          !productsLoading ? (
            <View style={s.empty}>
              <IconSymbol name="bag" size={36} color={colors.textLow} />
              <Text style={[typo.scale.body, { color: colors.textMid, fontFamily: typo.fonts.sans, marginTop: sp.md, textAlign: 'center' }]}>
                No products found.{'\n'}Try a different filter.
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          !productsLoading && totalPages > 1 ? (
            <View style={[s.pagination, { marginTop: sp.xl }]}>
              <Pressable
                disabled={page <= 1}
                onPress={() => setPage(p => p - 1)}
                style={[s.pageBtn, { backgroundColor: page <= 1 ? colors.panel : colors.accent, borderRadius: r.sm, paddingHorizontal: sp.lg, paddingVertical: sp.sm }]}
              >
                <Text style={[typo.scale.label, { color: page <= 1 ? colors.textLow : colors.textOnAccent, fontFamily: typo.fonts.sansBold }]}>
                  PREV
                </Text>
              </Pressable>
              <Text style={[typo.scale.bodySmall, { color: colors.textMid, fontFamily: typo.fonts.sans }]}>
                {page} / {totalPages}
              </Text>
              <Pressable
                disabled={page >= totalPages}
                onPress={() => setPage(p => p + 1)}
                style={[s.pageBtn, { backgroundColor: page >= totalPages ? colors.panel : colors.accent, borderRadius: r.sm, paddingHorizontal: sp.lg, paddingVertical: sp.sm }]}
              >
                <Text style={[typo.scale.label, { color: page >= totalPages ? colors.textLow : colors.textOnAccent, fontFamily: typo.fonts.sansBold }]}>
                  NEXT
                </Text>
              </Pressable>
            </View>
          ) : null
        }
      />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen:   { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  row:      { flexDirection: 'row', alignItems: 'center' },

  overlayBtn: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.38)',
  },

  logoWrap: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderWidth: 2,
    overflow: 'hidden',
  },
  logoImg: { width: 68, height: 68 },

  chip: { paddingHorizontal: 8, paddingVertical: 3 },

  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 1,
  },
  statItem:    { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  statDivider: { width: 1, height: 20 },

  policyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 10,
    borderWidth: 1,
  },

  sortPill: { borderWidth: 1 },

  skeletonGrid: { flexDirection: 'row', flexWrap: 'wrap' },

  empty:      { alignItems: 'center', paddingVertical: 60 },
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 },
  pageBtn:    {},
});
