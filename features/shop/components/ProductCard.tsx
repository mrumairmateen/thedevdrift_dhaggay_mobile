import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@shared/theme';
import type { ShopProduct } from '../shop.types';

interface Props {
  product: ShopProduct;
  width: number;
}

function getImage(product: ShopProduct): string | null {
  if (product.images && product.images.length > 0) return product.images[0].url;
  if (product.imageUrl) return product.imageUrl;
  return null;
}

function getPrice(product: ShopProduct): { label: string; amount: number; isFlash: boolean } {
  const now = Date.now();
  const flashActive =
    product.flashSalePrice != null &&
    product.flashSaleEndsAt != null &&
    new Date(product.flashSaleEndsAt).getTime() > now;

  if (flashActive) {
    return { label: 'PKR', amount: product.flashSalePrice!, isFlash: true };
  }
  const amount = product.pricePerSuit ?? product.pricePerMetre ?? product.price ?? 0;
  const suffix = product.pricePerMetre && !product.pricePerSuit ? '/m' : '';
  return { label: `PKR${suffix}`, amount, isFlash: false };
}

function StarRating({ rating, count, color, smallColor }: {
  rating: number; count: number; color: string; smallColor: string;
}) {
  const { typo } = useTheme();
  const stars = Math.round(rating);
  return (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map(i => (
        <IconSymbol
          key={i}
          name={i <= stars ? 'star.fill' : 'star'}
          size={10}
          color={i <= stars ? '#F59E0B' : smallColor}
        />
      ))}
      <Text style={[typo.scale.caption, { color: smallColor, marginLeft: 3 }]}>
        ({count})
      </Text>
    </View>
  );
}

export function ProductCard({ product, width }: Props) {
  const { colors, sp, r, typo, elev } = useTheme();
  const router = useRouter();

  const imageUrl = useMemo(() => getImage(product), [product]);
  const price = useMemo(() => getPrice(product), [product]);
  const imageHeight = Math.round(width * 1.25); // 4:5 ratio
  const isOutOfStock = product.status === 'out_of_stock' || (product.stock ?? 1) === 0;

  return (
    <Pressable
      onPress={() => router.push(`/shop/${product.slug}`)}
      style={[
        styles.card,
        elev.low,
        {
          width,
          backgroundColor: colors.elevated,
          borderRadius: r.md,
          borderColor: colors.border,
        },
      ]}
    >
      {/* Image */}
      <View style={[styles.imageWrapper, { height: imageHeight, borderRadius: r.md }]}>
        <Image
          source={imageUrl ? { uri: imageUrl } : require('@/assets/images/icon.png')}
          style={[StyleSheet.absoluteFill, { borderRadius: r.md }]}
          contentFit="cover"
          transition={200}
        />

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <View style={[styles.overlay, { borderRadius: r.md, backgroundColor: 'rgba(0,0,0,0.45)' }]}>
            <Text style={[typo.scale.label, { color: '#fff', fontFamily: typo.fonts.sansBold }]}>
              OUT OF STOCK
            </Text>
          </View>
        )}

        {/* Flash sale badge */}
        {price.isFlash && (
          <View style={[styles.flashBadge, { backgroundColor: colors.error, borderRadius: r.sharp }]}>
            <Text style={[typo.scale.label, { color: '#fff', fontFamily: typo.fonts.sansBold }]}>
              SALE
            </Text>
          </View>
        )}

        {/* Featured badge */}
        {product.isFeatured && !price.isFlash && (
          <View style={[styles.featuredBadge, { backgroundColor: colors.accent, borderRadius: r.sharp }]}>
            <Text style={[typo.scale.label, { color: colors.textOnAccent, fontFamily: typo.fonts.sansMed }]}>
              FEATURED
            </Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={[styles.info, { padding: sp.sm }]}>
        <Text
          style={[typo.scale.label, { color: colors.accentMid, fontFamily: typo.fonts.sansMed, marginBottom: 2 }]}
          numberOfLines={1}
        >
          {product.category.toUpperCase()}
        </Text>
        <Text
          style={[typo.scale.bodySmall, { color: colors.textHigh, fontFamily: typo.fonts.serifBold, marginBottom: sp.xs }]}
          numberOfLines={2}
        >
          {product.title}
        </Text>
        <StarRating
          rating={product.rating}
          count={product.reviewCount}
          color={colors.textHigh}
          smallColor={colors.textLow}
        />
        <View style={styles.priceRow}>
          <Text style={[typo.scale.price, { color: colors.accent, fontFamily: typo.fonts.sansBold }]}>
            {price.label} {price.amount.toLocaleString('en-PK')}
          </Text>
          {price.isFlash && (
            <Text style={[typo.scale.caption, { color: colors.textLow, textDecorationLine: 'line-through', marginLeft: sp.xs }]}>
              {(product.pricePerSuit ?? product.price ?? 0).toLocaleString('en-PK')}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  imageWrapper: {
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flashBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  info: {
    flexShrink: 1,
  },
  stars: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
  },
});
