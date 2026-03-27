import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  ListRenderItem,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorBanner } from '@shared/components/ui/ErrorBanner';
import { Skeleton } from '@shared/components/ui/Skeleton';
import { IconSymbol } from '@shared/components/ui/icon-symbol';
import { ProductCard } from '@features/shop/components/ProductCard';
import type { ShopProduct, SortOption } from '@features/shop/shop.types';
import { useGetShopBySlugQuery, useGetShopProductsQuery } from '@services/shopApi';
import { useTheme } from '@shared/theme';

const { width: SW } = Dimensions.get('window');
const BANNER_H = 200;
const H_PAD = 16;
const CARD_GAP = 12;
const CARD_W = (SW - H_PAD * 2 - CARD_GAP) / 2;

const SORT_OPTIONS: Array<{ label: string; value: SortOption }> = [
  { label: 'Top Rated', value: 'rating' },
  { label: 'Newest', value: 'newest' },
  { label: 'Price ↑', value: 'price_asc' },
];

// ── Skeleton card for loading ─────────────────────────────────────────────────

function SkeletonProductCard(): React.JSX.Element {
  const { colors, r, sp } = useTheme();
  const imgH = Math.round(CARD_W * 1.25);
  return (
    <View style={{ width: CARD_W, borderRadius: r.md, overflow: 'hidden' }}>
      <Skeleton width={CARD_W} height={imgH} radius={0} />
      <View style={{ padding: sp.sm, gap: sp.xs }}>
        <Skeleton width="40%" height={10} />
        <Skeleton width="80%" height={14} />
        <Skeleton width="50%" height={16} />
      </View>
    </View>
  );
}

// ── Full-screen store skeleton ────────────────────────────────────────────────

function StoreSkeleton(): React.JSX.Element {
  const { colors, sp, r } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Skeleton width={SW} height={BANNER_H} radius={0} />
      <View style={{ padding: sp.base, gap: sp.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: sp.md, marginTop: sp.md }}>
          <Skeleton width={56} height={56} radius={r.pill} />
          <View style={{ flex: 1, gap: sp.sm }}>
            <Skeleton width="60%" height={22} />
            <Skeleton width="40%" height={14} />
          </View>
        </View>
        <Skeleton width="100%" height={64} radius={r.md} />
        <View style={{ flexDirection: 'row', gap: sp.sm }}>
          {[0, 1, 2].map(i => (
            <Skeleton key={i} width={(SW - H_PAD * 2 - sp.sm * 2) / 3} height={64} radius={r.sm} />
          ))}
        </View>
      </View>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function StorefrontScreen(): React.JSX.Element {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { colors, sp, r, typo, elev } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [sort, setSort] = useState<SortOption>('rating');
  const [descExpanded, setDescExpanded] = useState(false);

  const {
    data: shop,
    isLoading: shopLoading,
    isError: shopError,
    refetch: refetchShop,
  } = useGetShopBySlugQuery(slug ?? '');

  const productQuery = useMemo(
    () => ({ slug: slug ?? '', sort, limit: 20 }),
    [slug, sort],
  );

  const {
    data: productsData,
    isLoading: productsLoading,
    isFetching: productsFetching,
    refetch: refetchProducts,
  } = useGetShopProductsQuery(productQuery, { skip: !slug || shopError });

  const products = productsData?.products ?? [];

  const handleBack = useCallback(() => router.back(), [router]);
  const handleSort = useCallback((s: SortOption) => setSort(s), []);
  const handleToggleDesc = useCallback(() => setDescExpanded(prev => !prev), []);

  const renderItem = useCallback<ListRenderItem<ShopProduct>>(
    ({ item, index }) => (
      <View style={{ marginLeft: index % 2 === 1 ? CARD_GAP : 0 }}>
        <ProductCard product={item} width={CARD_W} />
      </View>
    ),
    [],
  );

  // ── Loading ───────────────────────────────────────────────────────────────

  if (shopLoading) {
    return <StoreSkeleton />;
  }

  // ── Error ─────────────────────────────────────────────────────────────────

  if (shopError || !shop) {
    const errStyles = StyleSheet.create({
      screen: { flex: 1, backgroundColor: colors.bg },
      inner: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: sp['2xl'] },
    });
    return (
      <View style={errStyles.screen}>
        <View style={errStyles.inner}>
          <ErrorBanner
            message={shopError ? "Couldn't load this store. Check your connection." : 'Store not found.'}
            onRetry={shopError ? () => refetchShop() : undefined}
          />
          <Pressable onPress={handleBack} style={{ marginTop: sp.lg }}>
            <Text style={{ ...typo.scale.bodySmall, fontFamily: typo.fonts.sansMed, color: colors.accent }}>
              ← Go back
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ── Styles ────────────────────────────────────────────────────────────────

  const s = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg },

    // Banner + header overlay
    bannerWrap: { width: SW, height: BANNER_H, backgroundColor: colors.panel },
    overlayRow: {
      position: 'absolute',
      top: insets.top + sp.sm,
      left: sp.base,
      right: sp.base,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    overlayBtn: {
      width: 40,
      height: 40,
      borderRadius: r.pill,
      backgroundColor: 'rgba(0,0,0,0.40)',
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Logo
    logoCircle: {
      width: 56,
      height: 56,
      borderRadius: r.pill,
      backgroundColor: colors.elevated,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      marginTop: -28,
    },
    logoText: { ...typo.scale.title3, fontFamily: typo.fonts.sansBold, color: colors.textOnAccent },

    // Info section
    infoSection: { paddingHorizontal: sp.base, paddingBottom: sp.base },
    shopName: { ...typo.scale.title2, fontFamily: typo.fonts.serifBold, color: colors.textHigh, marginTop: sp.sm },
    verifiedBadge: {
      alignSelf: 'flex-start',
      backgroundColor: colors.infoSubtle,
      borderRadius: r.sharp,
      paddingHorizontal: sp.sm,
      paddingVertical: 3,
      marginTop: sp.xs,
    },
    verifiedText: { ...typo.scale.label, fontFamily: typo.fonts.sansMed, color: colors.info },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: sp.xs, marginTop: sp.sm },
    ratingText: { ...typo.scale.bodySmall, fontFamily: typo.fonts.sans, color: colors.textMid },
    addressText: { ...typo.scale.caption, fontFamily: typo.fonts.sans, color: colors.textMid, marginTop: 3 },
    descText: { ...typo.scale.body, fontFamily: typo.fonts.sans, color: colors.textMid, marginTop: sp.sm, lineHeight: 22 },
    readMoreText: { ...typo.scale.caption, fontFamily: typo.fonts.sansMed, color: colors.accent, marginTop: 4 },

    // Stats row
    statsRow: { flexDirection: 'row', gap: sp.sm, marginTop: sp.md },
    statCard: {
      flex: 1,
      backgroundColor: colors.elevated,
      borderRadius: r.sm,
      padding: sp.sm,
      alignItems: 'center',
    },
    statValue: { ...typo.scale.title3, fontFamily: typo.fonts.sansBold, color: colors.textHigh },
    statLabel: { ...typo.scale.caption, fontFamily: typo.fonts.sans, color: colors.textMid, marginTop: 2, textAlign: 'center' },

    // Products section
    productsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: sp.base,
      marginTop: sp.lg,
      marginBottom: sp.sm,
    },
    productsTitleText: { ...typo.scale.label, fontFamily: typo.fonts.sansMed, color: colors.textLow },
    sortRow: {
      flexDirection: 'row',
      gap: sp.sm,
      paddingHorizontal: sp.base,
      marginBottom: sp.md,
      flexWrap: 'wrap',
    },
    sortPill: { borderWidth: 1, borderRadius: r.pill, paddingHorizontal: sp.sm, paddingVertical: 4 },
    sortPillText: { ...typo.scale.label, fontFamily: typo.fonts.sansMed },

    // Empty state
    emptyWrap: { alignItems: 'center', paddingVertical: sp['4xl'] },
    emptyText: { ...typo.scale.body, fontFamily: typo.fonts.sans, color: colors.textMid, marginTop: sp.md, textAlign: 'center' },

    // Skeleton grid
    skeletonGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: H_PAD, gap: CARD_GAP },
  });

  const addressParts = [shop.address?.line1, shop.address?.area, shop.address?.city].filter(Boolean);

  // ── List header component ─────────────────────────────────────────────────

  const ListHeader = (
    <View>
      {/* Banner */}
      <View style={s.bannerWrap}>
        {shop.banner?.url ? (
          <Image source={{ uri: shop.banner.url }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.accentSubtle }]} />
        )}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.15)' }]} />

        {/* Back button */}
        <View style={s.overlayRow} pointerEvents="box-none">
          <Pressable onPress={handleBack} style={s.overlayBtn}>
            <IconSymbol name="chevron.left" size={20} color={colors.textOnAccent} />
          </Pressable>
          <Pressable style={s.overlayBtn}>
            <IconSymbol name="square.and.arrow.up" size={18} color={colors.textOnAccent} />
          </Pressable>
        </View>
      </View>

      {/* Shop info section */}
      <View style={s.infoSection}>
        {/* Logo overlapping banner */}
        <View style={s.logoCircle}>
          {shop.logo?.url ? (
            <Image source={{ uri: shop.logo.url }} style={StyleSheet.absoluteFill} contentFit="contain" />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }]}>
              <Text style={s.logoText}>{shop.name[0]?.toUpperCase() ?? '?'}</Text>
            </View>
          )}
        </View>

        {/* Name */}
        <Text style={s.shopName}>{shop.name}</Text>

        {/* Verified badge */}
        {shop.isVerified && (
          <View style={s.verifiedBadge}>
            <Text style={s.verifiedText}>✓ Verified</Text>
          </View>
        )}

        {/* Rating + sales */}
        <View style={s.ratingRow}>
          <IconSymbol name="star.fill" size={13} color="#F59E0B" />
          <Text style={s.ratingText}>
            {shop.rating.toFixed(1)} ({shop.reviewCount} reviews) · {shop.totalSales} sales
          </Text>
        </View>

        {/* Address */}
        {addressParts.length > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: sp.xs }}>
            <IconSymbol name="mappin" size={11} color={colors.textLow} />
            <Text style={s.addressText}>{addressParts.join(', ')}</Text>
          </View>
        )}

        {/* Description with read more */}
        {shop.description != null && shop.description.length > 0 && (
          <View>
            <Text
              style={s.descText}
              numberOfLines={descExpanded ? undefined : 3}
            >
              {shop.description}
            </Text>
            {shop.description.length > 120 && (
              <Pressable onPress={handleToggleDesc}>
                <Text style={s.readMoreText}>{descExpanded ? 'Show less' : 'Read more'}</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Stats row */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={s.statValue}>{shop.productCount}</Text>
            <Text style={s.statLabel}>Products</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statValue}>{shop.totalSales}</Text>
            <Text style={s.statLabel}>Total Sales</Text>
          </View>
          <View style={s.statCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <IconSymbol name="star.fill" size={12} color="#F59E0B" />
              <Text style={s.statValue}>{shop.rating.toFixed(1)}</Text>
            </View>
            <Text style={s.statLabel}>Rating</Text>
          </View>
        </View>
      </View>

      {/* Products section header */}
      <View style={s.productsHeader}>
        <Text style={s.productsTitleText}>
          PRODUCTS{productsData != null ? ` (${productsData.total})` : ''}
        </Text>
        {productsFetching && !productsLoading && (
          <Text style={[typo.scale.caption, { fontFamily: typo.fonts.sans, color: colors.textLow }]}>
            Updating…
          </Text>
        )}
      </View>

      {/* Sort chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[s.sortRow, { paddingHorizontal: sp.base }]}
        style={{ marginBottom: sp.md }}
      >
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
                },
              ]}
            >
              <Text style={[s.sortPillText, { color: active ? colors.accent : colors.textMid }]}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Skeleton grid while loading products */}
      {productsLoading && (
        <View style={s.skeletonGrid}>
          {[0, 1, 2, 3].map(i => (
            <SkeletonProductCard key={i} />
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={s.screen}>
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
            onRefresh={() => refetchProducts()}
            tintColor={colors.accent}
          />
        }
        ListEmptyComponent={
          !productsLoading ? (
            <View style={s.emptyWrap}>
              <IconSymbol name="bag" size={36} color={colors.textLow} />
              <Text style={s.emptyText}>No products found.{'\n'}Try a different filter.</Text>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
      />
    </View>
  );
}
