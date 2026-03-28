import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import { IconSymbol } from '@shared/components/ui/icon-symbol';
import { useTheme } from '@shared/theme';
import { formatPkr } from '@shared/utils';
import type { ShopProduct, ShopRef } from '@features/shop/shop.types';

export interface ProductCardProps {
  product: ShopProduct;
  width: number;
  onPress?: (slug: string) => void;
  /** Customer-only: called when tapping Add or the "+" stepper button */
  onAddToCart?: (product: ShopProduct) => void;
  /** Current quantity in cart (0 or absent = not in cart). Only relevant when onAddToCart is provided. */
  inCartQty?: number;
  /** Customer-only: called by the "−/+" stepper; qty=0 removes the item */
  onChangeQty?: (productId: string, qty: number) => void;
}

function resolveImageUri(product: ShopProduct): string | null {
  if (product.images !== undefined && product.images.length > 0) {
    const first = product.images[0];
    return first !== undefined ? first.url : null;
  }
  if (product.imageUrl !== undefined) {
    return product.imageUrl;
  }
  return null;
}

function resolveShopName(product: ShopProduct): string | null {
  const shopId = product.shopId;
  if (shopId === undefined || typeof shopId === 'string') {
    return null;
  }
  const ref = shopId as ShopRef;
  return ref.name;
}

function resolveFlashSaleActive(product: ShopProduct): boolean {
  return (
    product.flashSalePrice !== undefined &&
    product.flashSaleEndsAt !== undefined &&
    new Date(product.flashSaleEndsAt).getTime() > Date.now()
  );
}

export const ProductCard = React.memo(function ProductCard({
  product,
  width,
  onPress,
  onAddToCart,
  inCartQty = 0,
  onChangeQty,
}: ProductCardProps): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();
  const router = useRouter();
  const isOutOfStock = product.status === 'out_of_stock' || (product.stock !== undefined && product.stock <= 0);

  const imageHeight = Math.round(width * 1.15);
  const imageUri = resolveImageUri(product);
  const shopName = resolveShopName(product);
  const flashActive = resolveFlashSaleActive(product);

  const displayPrice = flashActive
    ? (product.flashSalePrice ?? 0)
    : (product.pricePerSuit ?? product.pricePerMetre ?? 0);

  const originalPrice = flashActive
    ? (product.pricePerSuit ?? product.pricePerMetre ?? 0)
    : null;

  const styles = StyleSheet.create({
    card: {
      width,
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      ...elev.low,
    },
    imageArea: {
      width,
      height: imageHeight,
      backgroundColor: colors.panel,
      alignItems: 'center',
      justifyContent: 'center',
    },
    image: {
      width,
      height: imageHeight,
    },
    saleBadge: {
      position: 'absolute',
      top: sp.sm,
      right: sp.sm,
      backgroundColor: colors.error,
      borderRadius: r.sharp,
      paddingHorizontal: sp.xs,
      paddingVertical: 2,
    },
    saleBadgeText: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansBold,
      color: colors.textOnAccent,
    },
    body: {
      padding: sp.sm,
    },
    category: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansMed,
      color: colors.accent,
      marginBottom: sp.xs,
    },
    title: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.serifBold,
      color: colors.textHigh,
    },
    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: sp.xs,
    },
    ratingText: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
      marginLeft: 2,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: sp.xs,
      marginTop: sp.xs,
    },
    flashPrice: {
      ...typo.scale.price,
      fontFamily: typo.fonts.sansBold,
      color: colors.error,
    },
    originalPrice: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textLow,
      textDecorationLine: 'line-through',
    },
    regularPrice: {
      ...typo.scale.price,
      fontFamily: typo.fonts.sansBold,
      color: colors.textHigh,
    },
    shopName: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textLow,
      marginTop: sp.xs,
    },
    starIcon: {
      ...typo.scale.caption,
      color: colors.warning,
    },
    cartRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginTop: sp.sm,
    },
    addBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: sp.xs,
      backgroundColor: colors.accent,
      borderRadius: r.pill,
      paddingHorizontal: sp.sm,
      paddingVertical: sp.xs,
    },
    addBtnText: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansBold,
      color: colors.textOnAccent,
    },
    stepper: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: sp.xs,
      backgroundColor: colors.accentSubtle,
      borderRadius: r.pill,
      paddingHorizontal: sp.xs,
      paddingVertical: sp.xs,
    },
    stepBtn: {
      width: 22,
      height: 22,
      borderRadius: r.pill,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepQty: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.accent,
      minWidth: 18,
      textAlign: 'center',
    },
    outOfStockText: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sans,
      color: colors.textLow,
    },
  });

  const handlePress = useCallback(() => {
    if (onPress !== undefined) {
      onPress(product.slug);
    } else {
      router.push(`/shop/${product.slug}` as Parameters<typeof router.push>[0]);
    }
  }, [onPress, product.slug, router]);

  const handleAdd = useCallback(() => {
    onAddToCart?.(product);
  }, [onAddToCart, product]);

  const handleIncrement = useCallback(() => {
    onChangeQty?.(product._id, inCartQty + 1);
  }, [onChangeQty, product._id, inCartQty]);

  const handleDecrement = useCallback(() => {
    onChangeQty?.(product._id, inCartQty - 1);
  }, [onChangeQty, product._id, inCartQty]);

  return (
    <Pressable style={styles.card} onPress={handlePress}>
      <View style={styles.imageArea}>
        {imageUri !== null ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            contentFit="cover"
          />
        ) : (
          <IconSymbol name="bag.fill" size={32} color={colors.textLow} />
        )}
        {flashActive && (
          <View style={styles.saleBadge}>
            <Text style={styles.saleBadgeText}>{'SALE'}</Text>
          </View>
        )}
      </View>
      <View style={styles.body}>
        <Text style={styles.category}>
          {product.category.toUpperCase()}
        </Text>
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>
        <View style={styles.ratingRow}>
          <Text style={styles.starIcon}>{'★'}</Text>
          <Text style={styles.ratingText}>
            {`${product.rating.toFixed(1)} · ${product.reviewCount} reviews`}
          </Text>
        </View>
        <View style={styles.priceRow}>
          {flashActive ? (
            <>
              <Text style={styles.flashPrice}>{formatPkr(displayPrice)}</Text>
              {originalPrice !== null && originalPrice > 0 && (
                <Text style={styles.originalPrice}>{formatPkr(originalPrice)}</Text>
              )}
            </>
          ) : (
            <Text style={styles.regularPrice}>{formatPkr(displayPrice)}</Text>
          )}
        </View>
        {shopName !== null && (
          <Text style={styles.shopName} numberOfLines={1}>
            {shopName}
          </Text>
        )}
        {onAddToCart !== undefined && (
          <View style={styles.cartRow}>
            {isOutOfStock ? (
              <Text style={styles.outOfStockText}>{'Out of stock'}</Text>
            ) : inCartQty > 0 ? (
              <View style={styles.stepper}>
                <Pressable style={styles.stepBtn} onPress={handleDecrement} hitSlop={sp.xs}>
                  <IconSymbol name="minus" size={12} color={colors.textOnAccent} />
                </Pressable>
                <Text style={styles.stepQty}>{inCartQty}</Text>
                <Pressable style={styles.stepBtn} onPress={handleIncrement} hitSlop={sp.xs}>
                  <IconSymbol name="plus" size={12} color={colors.textOnAccent} />
                </Pressable>
              </View>
            ) : (
              <Pressable style={styles.addBtn} onPress={handleAdd} hitSlop={sp.xs}>
                <IconSymbol name="plus" size={12} color={colors.textOnAccent} />
                <Text style={styles.addBtnText}>{'Add'}</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
});
