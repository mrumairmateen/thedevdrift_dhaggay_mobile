import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  ListRenderItem,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorBanner } from '@shared/components/ui/ErrorBanner';
import { Skeleton, SkeletonText } from '@shared/components/ui/Skeleton';
import { IconSymbol } from '@shared/components/ui/icon-symbol';
import { CARE_LABELS } from '@features/shop/shop.types';
import type { ShopRef } from '@features/shop/shop.types';
import { useGetProductBySlugQuery } from '@services/shopApi';
import { useTheme } from '@shared/theme';
import { formatPkr } from '@shared/utils';
import { addToCart } from '@store/cartSlice';
import { useAppDispatch } from '@store/index';

const { width: SW } = Dimensions.get('window');
const IMAGE_HEIGHT = Math.round(SW * 1.1);

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatFlashDiscount(original: number, flash: number): number {
  if (original <= 0) return 0;
  return Math.round(((original - flash) / original) * 100);
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function ProductDetailSkeleton(): React.JSX.Element {
  const { colors, sp } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Skeleton width={SW} height={IMAGE_HEIGHT} radius={0} />
      <View style={{ padding: sp.base, gap: sp.md }}>
        <Skeleton width="40%" height={12} />
        <Skeleton width="80%" height={28} />
        <Skeleton width="50%" height={20} />
        <Skeleton width="100%" height={1} />
        <Skeleton width="100%" height={80} radius={12} />
        <Skeleton width="100%" height={1} />
        <SkeletonText lines={4} lastLineWidth="60%" lineHeight={16} spacing={10} />
      </View>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function ProductDetailScreen(): React.JSX.Element {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { colors, sp, r, typo, elev } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { data: product, isLoading, isError, refetch } = useGetProductBySlugQuery(slug ?? '');

  const [activeIdx, setActiveIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const galleryRef = useRef<FlatList<string>>(null);
  const addedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (addedTimerRef.current !== null) {
        clearTimeout(addedTimerRef.current);
      }
    };
  }, []);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const first = viewableItems[0];
      if (first) setActiveIdx(first.index ?? 0);
    },
  );
  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const handleBack = useCallback(() => router.back(), [router]);

  const handleWishlist = useCallback(() => setWishlisted(prev => !prev), []);

  const handleDecrement = useCallback(() => {
    setQty(prev => Math.max(1, prev - 1));
  }, []);

  const handleIncrement = useCallback(() => {
    setQty(prev => Math.min(product?.stock ?? 99, prev + 1));
  }, [product?.stock]);

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    const shopRef = typeof product.shopId === 'object' && product.shopId !== null
      ? (product.shopId as ShopRef)
      : null;

    dispatch(
      addToCart({
        productId: product._id,
        title: product.title,
        category: product.category,
        pricePerSuit: product.pricePerSuit ?? product.pricePerMetre ?? product.price ?? 0,
        imageUrl: product.images?.[0]?.url ?? product.imageUrl ?? null,
        shopId: shopRef?._id ?? (typeof product.shopId === 'string' ? product.shopId : ''),
        shopSlug: shopRef?.slug ?? '',
        shopName: shopRef?.name ?? '',
        quantity: qty,
        stock: product.stock ?? 99,
        targetGender: product.targetGender,
        addedAt: new Date().toISOString(),
      }),
    );
    setAddedToCart(true);
    addedTimerRef.current = setTimeout(() => setAddedToCart(false), 1500);
  }, [dispatch, product, qty]);

  const renderDotIndicator = useCallback(
    (_: string, idx: number) => (
      <View
        key={idx}
        style={[
          styles.dot,
          {
            backgroundColor: idx === activeIdx ? colors.textOnAccent : 'rgba(255,255,255,0.45)',
            width: idx === activeIdx ? 18 : 6,
          },
        ]}
      />
    ),
    [activeIdx, colors.textOnAccent],
  );

  const renderGalleryItem = useCallback<ListRenderItem<string>>(
    ({ item: url }) => (
      <View style={{ width: SW, height: IMAGE_HEIGHT, backgroundColor: colors.panel }}>
        {url ? (
          <Image source={{ uri: url }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : null}
      </View>
    ),
    [colors.panel],
  );

  // ── Loading ───────────────────────────────────────────────────────────────

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  // ── Error ─────────────────────────────────────────────────────────────────

  if (isError || !product) {
    const styles = StyleSheet.create({
      screen: { flex: 1, backgroundColor: colors.bg },
      centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: sp['2xl'] },
    });

    return (
      <View style={styles.screen}>
        <View style={styles.centered}>
          <ErrorBanner
            message={isError ? "Couldn't load this product. Check your connection and try again." : 'Product not found.'}
            onRetry={isError ? () => refetch() : undefined}
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

  // ── Derived data ──────────────────────────────────────────────────────────

  const images: string[] =
    product.images && product.images.length > 0
      ? product.images.map(i => i.url)
      : product.imageUrl
        ? [product.imageUrl]
        : [];

  const galleryData = images.length > 0 ? images : [''];

  const flashActive =
    product.flashSalePrice != null &&
    product.flashSaleEndsAt != null &&
    new Date(product.flashSaleEndsAt).getTime() > Date.now();

  const effectivePrice = flashActive
    ? (product.flashSalePrice as number)
    : (product.pricePerSuit ?? product.pricePerMetre ?? product.price ?? 0);

  const originalPrice = product.pricePerSuit ?? product.price ?? 0;
  const discountPct = flashActive && originalPrice > 0
    ? formatFlashDiscount(originalPrice, product.flashSalePrice as number)
    : 0;

  const priceLabel = product.pricePerSuit != null ? 'per suit' : product.pricePerMetre != null ? 'per metre' : '';

  const isOutOfStock = product.status === 'out_of_stock' || (product.stock ?? 1) === 0;
  const maxQty = product.stock ?? 99;

  const shopRef: ShopRef | null =
    typeof product.shopId === 'object' && product.shopId !== null
      ? (product.shopId as ShopRef)
      : null;

  const detailRows: Array<{ label: string; value: string }> = [
    product.composition ? { label: 'Composition', value: product.composition } : null,
    product.origin ? { label: 'Origin', value: product.origin } : null,
    product.fabricWeight ? { label: 'Fabric Weight', value: `${product.fabricWeight} g/m²` } : null,
    product.careInstructions ? { label: 'Care Instructions', value: CARE_LABELS[product.careInstructions] } : null,
  ].filter((r): r is { label: string; value: string } => r !== null);

  const totalPrice = effectivePrice * qty;

  // ── Styles (inside component to access theme tokens) ──────────────────────

  const s = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg },
    scrollContent: { paddingBottom: sp['5xl'] },

    // Gallery
    overlayTopRow: {
      position: 'absolute',
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: sp.base,
    },
    overlayBtn: {
      width: 40,
      height: 40,
      borderRadius: r.pill,
      backgroundColor: 'rgba(0,0,0,0.42)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    dotsRow: {
      position: 'absolute',
      bottom: sp.md,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: sp.xs,
    },
    dot: { height: 6, borderRadius: r.pill },

    // Body
    body: { padding: sp.base },
    flashBadge: {
      alignSelf: 'flex-start',
      backgroundColor: colors.error,
      borderRadius: r.pill,
      paddingHorizontal: sp.md,
      paddingVertical: 4,
      marginBottom: sp.sm,
    },
    flashText: { ...typo.scale.label, fontFamily: typo.fonts.sansBold, color: colors.textOnAccent },
    titleText: { ...typo.scale.title2, fontFamily: typo.fonts.serifBold, color: colors.textHigh },
    categoryText: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansMed,
      color: colors.accent,
      textTransform: 'uppercase',
      marginTop: sp.xs,
    },

    // Price section
    priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: sp.sm, marginTop: sp.sm },
    priceMain: { ...typo.scale.price, fontFamily: typo.fonts.sansBold, color: colors.accent, fontSize: 24 },
    priceMainFlash: { ...typo.scale.price, fontFamily: typo.fonts.sansBold, color: colors.error, fontSize: 24 },
    priceStrike: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sans,
      color: colors.textLow,
      textDecorationLine: 'line-through',
    },
    priceLabel: { ...typo.scale.caption, fontFamily: typo.fonts.sans, color: colors.textMid },

    // Rating
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: sp.sm },
    ratingText: { ...typo.scale.bodySmall, fontFamily: typo.fonts.sans, color: colors.textMid },

    // Divider
    divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: sp.lg },

    // Shop card
    shopCard: {
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      padding: sp.md,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      gap: sp.md,
    },
    shopLogoCircle: {
      width: 44,
      height: 44,
      borderRadius: r.pill,
      backgroundColor: colors.accentSubtle,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    shopLogoText: { ...typo.scale.body, fontFamily: typo.fonts.sansBold, color: colors.accent },
    shopName: { ...typo.scale.bodySmall, fontFamily: typo.fonts.sansBold, color: colors.textHigh },
    shopCity: { ...typo.scale.caption, fontFamily: typo.fonts.sans, color: colors.textMid },
    shopVisit: { ...typo.scale.caption, fontFamily: typo.fonts.sansMed, color: colors.accent, marginTop: 2 },

    // Detail rows
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: sp.sm },
    detailLabel: { ...typo.scale.caption, fontFamily: typo.fonts.sansMed, color: colors.textLow, flex: 1 },
    detailValue: { ...typo.scale.bodySmall, fontFamily: typo.fonts.sans, color: colors.textHigh, flex: 2, textAlign: 'right' },

    // Quantity selector
    qtyLabel: { ...typo.scale.label, fontFamily: typo.fonts.sansMed, color: colors.textLow, marginBottom: sp.sm },
    qtyRow: { flexDirection: 'row', alignItems: 'center', gap: sp.base },
    qtyBtn: {
      width: 38,
      height: 38,
      borderRadius: r.pill,
      borderWidth: 1.5,
      borderColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    qtyBtnDisabled: { borderColor: colors.border },
    qtyCount: { ...typo.scale.title3, fontFamily: typo.fonts.sansBold, color: colors.textHigh, minWidth: 28, textAlign: 'center' },

    // Sticky bar
    stickyBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.navSolid,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: sp.base,
      ...elev.high,
    },
    totalLabel: { ...typo.scale.caption, fontFamily: typo.fonts.sans, color: colors.textMid },
    totalAmount: { ...typo.scale.price, fontFamily: typo.fonts.sansBold, color: colors.textHigh },
    addBtn: {
      backgroundColor: colors.accent,
      borderRadius: r.pill,
      paddingHorizontal: sp.xl,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addBtnText: { ...typo.scale.label, fontFamily: typo.fonts.sansBold, color: colors.textOnAccent },
    addedBtnText: { ...typo.scale.label, fontFamily: typo.fonts.sansBold, color: colors.textOnAccent },
    outOfStockBtn: { backgroundColor: colors.panel },
    outOfStockText: { ...typo.scale.label, fontFamily: typo.fonts.sansBold, color: colors.textLow },
  });

  return (
    <View style={s.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {/* ── Gallery ────────────────────────────────────────────────────── */}
        <View style={{ width: SW, height: IMAGE_HEIGHT }}>
          <FlatList
            ref={galleryRef}
            data={galleryData}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => String(i)}
            renderItem={renderGalleryItem}
            onViewableItemsChanged={onViewableItemsChanged.current}
            viewabilityConfig={viewabilityConfig.current}
          />

          {/* Top overlay: back + wishlist */}
          <View
            style={[s.overlayTopRow, { top: insets.top + sp.sm }]}
            pointerEvents="box-none"
          >
            <Pressable onPress={handleBack} style={s.overlayBtn}>
              <IconSymbol name="chevron.left" size={20} color={colors.textOnAccent} />
            </Pressable>
            <Pressable onPress={handleWishlist} style={s.overlayBtn}>
              <IconSymbol
                name={wishlisted ? 'heart.fill' : 'heart'}
                size={20}
                color={wishlisted ? colors.error : colors.textOnAccent}
              />
            </Pressable>
          </View>

          {/* Dot indicators */}
          {images.length > 1 && (
            <View style={s.dotsRow} pointerEvents="none">
              {galleryData.map(renderDotIndicator)}
            </View>
          )}
        </View>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <View style={s.body}>

          {/* Flash sale badge */}
          {flashActive && (
            <View style={s.flashBadge}>
              <Text style={s.flashText}>
                FLASH SALE{discountPct > 0 ? ` · ${discountPct}% OFF` : ''}
              </Text>
            </View>
          )}

          {/* Title */}
          <Text style={s.titleText}>{product.title}</Text>

          {/* Category */}
          <Text style={s.categoryText}>{product.category}</Text>

          {/* Price section */}
          <View style={s.priceRow}>
            {flashActive ? (
              <>
                <Text style={s.priceMainFlash}>{formatPkr(effectivePrice)}</Text>
                {originalPrice > 0 && (
                  <Text style={s.priceStrike}>{formatPkr(originalPrice)}</Text>
                )}
              </>
            ) : (
              <Text style={s.priceMain}>{formatPkr(effectivePrice)}</Text>
            )}
            {priceLabel.length > 0 && (
              <Text style={s.priceLabel}>{priceLabel}</Text>
            )}
          </View>

          {/* Rating row */}
          <View style={s.ratingRow}>
            {[1, 2, 3, 4, 5].map(i => (
              <IconSymbol
                key={i}
                name={i <= Math.round(product.rating) ? 'star.fill' : 'star'}
                size={13}
                color={i <= Math.round(product.rating) ? '#F59E0B' : colors.textLow}
              />
            ))}
            <Text style={s.ratingText}>
              {product.rating.toFixed(1)} · {product.reviewCount} reviews
            </Text>
          </View>

          <View style={s.divider} />

          {/* Shop info card */}
          {shopRef !== null && (
            <>
              <Pressable
                onPress={() => router.push(`/store/${shopRef.slug}` as never)}
                style={s.shopCard}
              >
                <View style={s.shopLogoCircle}>
                  {shopRef.logo?.url ? (
                    <Image source={{ uri: shopRef.logo.url }} style={StyleSheet.absoluteFill} contentFit="contain" />
                  ) : (
                    <Text style={s.shopLogoText}>{shopRef.name[0]?.toUpperCase() ?? '?'}</Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={s.shopName}>{shopRef.name}</Text>
                    {shopRef.isVerified === true && (
                      <IconSymbol name="checkmark.seal.fill" size={13} color={colors.accent} />
                    )}
                  </View>
                  {shopRef.address?.city != null && (
                    <Text style={s.shopCity}>{shopRef.address.city}</Text>
                  )}
                  <Text style={s.shopVisit}>Visit Store →</Text>
                </View>
                <IconSymbol name="chevron.right" size={14} color={colors.textLow} />
              </Pressable>
              <View style={s.divider} />
            </>
          )}

          {/* Details section */}
          {detailRows.length > 0 && (
            <>
              <Text style={[typo.scale.label, { fontFamily: typo.fonts.sansMed, color: colors.textLow, marginBottom: sp.sm }]}>
                PRODUCT DETAILS
              </Text>
              {detailRows.map((row, idx) => (
                <View key={idx} style={s.detailRow}>
                  <Text style={s.detailLabel}>{row.label}</Text>
                  <Text style={s.detailValue}>{row.value}</Text>
                </View>
              ))}
              <View style={s.divider} />
            </>
          )}

          {/* Quantity selector */}
          {!isOutOfStock && (
            <>
              <Text style={s.qtyLabel}>QUANTITY</Text>
              <View style={s.qtyRow}>
                <Pressable
                  onPress={handleDecrement}
                  disabled={qty <= 1}
                  style={[s.qtyBtn, qty <= 1 && s.qtyBtnDisabled]}
                >
                  <IconSymbol name="minus" size={16} color={qty <= 1 ? colors.textLow : colors.accent} />
                </Pressable>
                <Text style={s.qtyCount}>{qty}</Text>
                <Pressable
                  onPress={handleIncrement}
                  disabled={qty >= maxQty}
                  style={[s.qtyBtn, qty >= maxQty && s.qtyBtnDisabled]}
                >
                  <IconSymbol name="plus" size={16} color={qty >= maxQty ? colors.textLow : colors.accent} />
                </Pressable>
                {product.stock != null && product.stock > 0 && (
                  <Text style={[typo.scale.caption, { fontFamily: typo.fonts.sans, color: colors.textLow, marginLeft: sp.sm }]}>
                    {product.stock} in stock
                  </Text>
                )}
              </View>
            </>
          )}

        </View>
      </ScrollView>

      {/* ── Sticky Add to Cart bar ──────────────────────────────────────── */}
      <View style={[s.stickyBar, { paddingBottom: sp.base + insets.bottom }]}>
        <View>
          <Text style={s.totalLabel}>TOTAL</Text>
          <Text style={s.totalAmount}>{formatPkr(totalPrice)}</Text>
        </View>
        {isOutOfStock ? (
          <View style={[s.addBtn, s.outOfStockBtn]}>
            <Text style={s.outOfStockText}>OUT OF STOCK</Text>
          </View>
        ) : (
          <Pressable onPress={handleAddToCart} style={s.addBtn}>
            <Text style={addedToCart ? s.addedBtnText : s.addBtnText}>
              {addedToCart ? 'ADDED ✓' : 'ADD TO CART'}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dot: { height: 6 },
});
