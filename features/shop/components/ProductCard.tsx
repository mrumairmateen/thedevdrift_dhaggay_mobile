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
}: ProductCardProps): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();
  const router = useRouter();

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
  });

  const handlePress = useCallback(() => {
    if (onPress !== undefined) {
      onPress(product.slug);
    } else {
      router.push(`/shop/${product.slug}` as Parameters<typeof router.push>[0]);
    }
  }, [onPress, product.slug, router]);

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
      </View>
    </Pressable>
  );
});
