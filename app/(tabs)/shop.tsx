import { IconSymbol } from '@shared/components/ui/icon-symbol';
import { CategoryPills } from '@features/shop/components/CategoryPills';
import { ProductCard } from '@features/shop/components/ProductCard';
import type { FabricCategory, ShopProduct, SortOption } from '@features/shop/shop.types';
import { useTheme } from '@shared/theme';
import { useGetProductsQuery } from '@services/shopApi';
import { addToCart, removeFromCart, updateQuantity, selectCartCount, selectCartItems } from '@store/cartSlice';
import type { CartItem } from '@store/cartSlice';
import { useAppDispatch, useAppSelector } from '@store/index';
import { openAuthSheet } from '@store/authSlice';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_GAP = 12;
const H_PAD = 16;
const CARD_WIDTH = (SCREEN_WIDTH - H_PAD * 2 - CARD_GAP) / 2;

const SORT_OPTIONS: Array<{ label: string; value: SortOption }> = [
  { label: 'Top Rated', value: 'rating' },
  { label: 'Price ↑', value: 'price_asc' },
  { label: 'Price ↓', value: 'price_desc' },
  { label: 'Newest', value: 'newest' },
];

function SkeletonCard({ width }: { width: number }) {
  const { colors, r, sp } = useTheme();
  const height = Math.round(width * 1.25);
  return (
    <View
      style={{
        width,
        borderRadius: r.md,
        overflow: 'hidden',
        backgroundColor: colors.panel,
      }}
    >
      <View style={{ height, backgroundColor: colors.panel }} />
      <View style={{ padding: sp.sm, gap: sp.xs }}>
        <View style={{ height: 10, width: '40%', backgroundColor: colors.border, borderRadius: r.sharp }} />
        <View style={{ height: 14, width: '80%', backgroundColor: colors.border, borderRadius: r.sharp }} />
        <View style={{ height: 10, width: '30%', backgroundColor: colors.border, borderRadius: r.sharp }} />
        <View style={{ height: 16, width: '50%', backgroundColor: colors.border, borderRadius: r.sharp }} />
      </View>
    </View>
  );
}

export default function ShopScreen() {
  const { colors, sp, r, typo } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { category: categoryParam } = useLocalSearchParams<{ category?: string }>();

  const userRole = useAppSelector((s) => s.auth.user?.role);
  const isLoggedIn = useAppSelector((s) => s.auth.user !== null);
  const isCustomer = userRole === 'customer';
  // Show cart controls to guests (not logged in) AND logged-in customers.
  // Sellers, tailors, admins, delivery don't see cart controls.
  const showCartControls = !isLoggedIn || isCustomer;
  const cartCount = useAppSelector(selectCartCount);
  const cartItems = useAppSelector(selectCartItems);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const [category, setCategory] = useState<FabricCategory | null>((categoryParam as FabricCategory) ?? null);
  const [sort, setSort] = useState<SortOption>('rating');
  const [page, setPage] = useState(1);

  // Sync when navigating from CategoryRow with a ?category= param
  useEffect(() => {
    if (categoryParam) {
      setCategory(categoryParam as FabricCategory);
      setPage(1);
    }
  }, [categoryParam]);

  const query = useMemo(
    () => ({
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...(category ? { category } : {}),
      sort,
      page,
      limit: 20,
    }),
    [debouncedSearch, category, sort, page],
  );

  const { data, isLoading, isFetching, isError, refetch } = useGetProductsQuery(query);

  const products = data?.products ?? [];
  const totalPages = data?.pages ?? 1;

  // Debounce search 350ms
  const handleSearchChange = useCallback((text: string) => {
    setSearch(text);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(text);
      setPage(1);
    }, 350);
  }, []);

  const handleCategoryChange = useCallback((cat: FabricCategory | null) => {
    setCategory(cat);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((s: SortOption) => {
    setSort(s);
    setPage(1);
  }, []);

  const handleAddToCart = useCallback(
    (product: ShopProduct) => {
      if (!isLoggedIn) {
        dispatch(openAuthSheet('login'));
        return;
      }
      const imageUri = product.images?.[0]?.url ?? product.imageUrl ?? null;
      const shopRef = typeof product.shopId === 'object' && product.shopId !== null ? product.shopId : null;
      const item: CartItem = {
        productId: product._id,
        title: product.title,
        category: product.category,
        pricePerSuit: product.pricePerSuit ?? product.pricePerMetre ?? 0,
        imageUrl: imageUri ?? null,
        shopId: shopRef !== null ? (shopRef._id ?? '') : (typeof product.shopId === 'string' ? product.shopId : ''),
        shopSlug: shopRef?.slug ?? '',
        shopName: shopRef?.name ?? '',
        quantity: 1,
        stock: product.stock ?? 99,
        targetGender: product.targetGender,
        addedAt: new Date().toISOString(),
      };
      dispatch(addToCart(item));
    },
    [dispatch],
  );

  const handleChangeQty = useCallback(
    (productId: string, qty: number) => {
      if (qty <= 0) {
        dispatch(removeFromCart(productId));
      } else {
        dispatch(updateQuantity({ productId, quantity: qty }));
      }
    },
    [dispatch],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: ShopProduct; index: number }) => {
      const inCartQty = cartItems.find((c) => c.productId === item._id)?.quantity ?? 0;
      return (
        <View style={{ marginLeft: index % 2 === 1 ? CARD_GAP : 0 }}>
          <ProductCard
            product={item}
            width={CARD_WIDTH}
            {...(showCartControls
              ? {
                  onAddToCart: handleAddToCart,
                  inCartQty,
                  onChangeQty: handleChangeQty,
                }
              : {})}
          />
        </View>
      );
    },
    [cartItems, showCartControls, handleAddToCart, handleChangeQty],
  );

  const renderSkeleton = () => (
    <View style={[styles.grid, { paddingHorizontal: H_PAD, paddingTop: sp.base }]}>
      {Array.from({ length: 6 }).map((_, i) => (
        <View key={i} style={{ marginLeft: i % 2 === 1 ? CARD_GAP : 0, marginBottom: CARD_GAP }}>
          <SkeletonCard width={CARD_WIDTH} />
        </View>
      ))}
    </View>
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.navSolid,
            paddingTop: insets.top + sp.sm,
            paddingHorizontal: sp.base,
            paddingBottom: sp.md,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.headerTitle}>
          <Text style={[typo.scale.title2, { fontFamily: typo.fonts.serifBold, color: colors.textHigh }]}>
            Shop
          </Text>
          {showCartControls && (
            <Pressable
              onPress={() => router.push('/(tabs)/cart' as never)}
              style={[styles.cartBtn, { backgroundColor: colors.elevated, borderColor: colors.border }]}
            >
              <IconSymbol name="bag" size={20} color={colors.textHigh} />
              {cartCount > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.accent }]}>
                  <Text style={[typo.scale.label, { fontFamily: typo.fonts.sansBold, color: colors.textOnAccent, lineHeight: 14 }]}>
                    {cartCount > 99 ? '99+' : String(cartCount)}
                  </Text>
                </View>
              )}
            </Pressable>
          )}
        </View>

        {/* Search bar */}
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.inputBg,
              borderRadius: r.sm,
              borderColor: colors.border,
              paddingHorizontal: sp.md,
            },
          ]}
        >
          <IconSymbol name="magnifyingglass" size={16} color={colors.textLow} />
          <TextInput
            value={search}
            onChangeText={handleSearchChange}
            placeholder="Search fabrics…"
            placeholderTextColor={colors.textLow}
            style={[
              styles.searchInput,
              typo.scale.body,
              { fontFamily: typo.fonts.sans, color: colors.textHigh },
            ]}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable onPress={() => { setSearch(''); setDebouncedSearch(''); }}>
              <IconSymbol name="xmark" size={14} color={colors.textLow} />
            </Pressable>
          )}
        </View>

        {/* Sort pills */}
        <View style={[styles.sortRow, { marginTop: sp.sm }]}>
          <IconSymbol name="arrow.up.arrow.down" size={14} color={colors.textMid} />
          <View style={styles.sortPills}>
            {SORT_OPTIONS.map(opt => {
              const active = opt.value === sort;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => handleSortChange(opt.value)}
                  style={[
                    styles.sortPill,
                    {
                      backgroundColor: active ? colors.accentSubtle : 'transparent',
                      borderRadius: r.pill,
                      borderColor: active ? colors.accent : colors.border,
                      paddingHorizontal: sp.sm,
                      paddingVertical: 4,
                    },
                  ]}
                >
                  <Text
                    style={[
                      typo.scale.label,
                      {
                        fontFamily: typo.fonts.sansMed,
                        color: active ? colors.accent : colors.textMid,
                      },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {/* Category pills */}
      <View style={[styles.pillsRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <CategoryPills active={category} onSelect={handleCategoryChange} />
      </View>

      {/* Results count */}
      {!isLoading && data && (
        <View style={[styles.resultsBar, { paddingHorizontal: sp.base, paddingVertical: sp.sm }]}>
          <Text style={[typo.scale.caption, { color: colors.textMid, fontFamily: typo.fonts.sans }]}>
            {data.total} {data.total === 1 ? 'product' : 'products'} found
          </Text>
          {isFetching && <ActivityIndicator size="small" color={colors.accent} style={{ marginLeft: sp.sm }} />}
        </View>
      )}

      {/* Error state */}
      {isError && !isLoading && (
        <View style={styles.empty}>
          <IconSymbol name="exclamationmark.triangle" size={36} color={colors.textLow} />
          <Text style={[typo.scale.body, { color: colors.textMid, fontFamily: typo.fonts.sans, marginTop: sp.md, textAlign: 'center' }]}>
            Couldn't load products.{'\n'}Check your connection and try again.
          </Text>
          <Pressable
            onPress={() => refetch()}
            style={[{ marginTop: sp.lg, backgroundColor: colors.accent, borderRadius: r.pill, paddingHorizontal: sp.xl, paddingVertical: sp.sm }]}
          >
            <Text style={[typo.scale.label, { color: colors.textOnAccent, fontFamily: typo.fonts.sansBold }]}>
              RETRY
            </Text>
          </Pressable>
        </View>
      )}

      {/* Grid */}
      {!isError && (isLoading ? (
        renderSkeleton()
      ) : (
        <FlatList
          data={products}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={[
            styles.listContent,
            { paddingHorizontal: H_PAD, paddingTop: sp.md, paddingBottom: insets.bottom + sp['4xl'] },
          ]}
          columnWrapperStyle={{ marginBottom: CARD_GAP }}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={refetch}
              tintColor={colors.accent}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <IconSymbol name="magnifyingglass" size={40} color={colors.textLow} />
              <Text style={[typo.scale.body, { color: colors.textMid, fontFamily: typo.fonts.sans, marginTop: sp.md, textAlign: 'center' }]}>
                No products found.{'\n'}Try a different filter.
              </Text>
            </View>
          }
          ListFooterComponent={
            totalPages > 1 ? (
              <View style={[styles.pagination, { marginTop: sp.xl }]}>
                <Pressable
                  disabled={page <= 1}
                  onPress={() => setPage(p => p - 1)}
                  style={[
                    styles.pageBtn,
                    {
                      backgroundColor: page <= 1 ? colors.panel : colors.accent,
                      borderRadius: r.sm,
                      paddingHorizontal: sp.lg,
                      paddingVertical: sp.sm,
                    },
                  ]}
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
                  style={[
                    styles.pageBtn,
                    {
                      backgroundColor: page >= totalPages ? colors.panel : colors.accent,
                      borderRadius: r.sm,
                      paddingHorizontal: sp.lg,
                      paddingVertical: sp.sm,
                    },
                  ]}
                >
                  <Text style={[typo.scale.label, { color: page >= totalPages ? colors.textLow : colors.textOnAccent, fontFamily: typo.fonts.sansBold }]}>
                    NEXT
                  </Text>
                </Pressable>
              </View>
            ) : null
          }
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { borderBottomWidth: 1 },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cartBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: { flex: 1, padding: 0 },
  sortRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sortPills: { flexDirection: 'row', gap: 6 },
  sortPill: { borderWidth: 1 },
  pillsRow: { paddingVertical: 10, borderBottomWidth: 1 },
  resultsBar: { flexDirection: 'row', alignItems: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  listContent: {},
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 },
  pageBtn: {},
});
