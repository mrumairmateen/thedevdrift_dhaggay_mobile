import { IconSymbol } from '@shared/components/ui/icon-symbol';
import type { WishlistProduct } from '@features/dashboard/dashboard.types';
import { useTheme } from '@shared/theme';
import { useToggleProductWishlistMutation } from '@services/wishlistApi';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  product: WishlistProduct;
}

export function WishlistFabricCard({ product }: Props) {
  const { colors, sp, r, typo } = useTheme();
  const [removeFromWishlist] = useToggleProductWishlistMutation();

  const price = product.pricePerSuit ?? product.pricePerMetre;
  const priceUnit = product.pricePerSuit ? '/suit' : '/m';

  const handleRemove = () => {
    removeFromWishlist(product._id);
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.elevated,
          borderColor: colors.border,
          borderRadius: r.lg,
          overflow: 'hidden',
          margin: sp.xs,
          flex: 1,
        },
      ]}
    >
      {/* Image */}
      <View style={[styles.imageWrap, { backgroundColor: colors.panel }]}>
        {product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.image} />
        )}
        {/* Remove button */}
        <Pressable
          onPress={handleRemove}
          hitSlop={8}
          style={[
            styles.removeBtn,
            {
              backgroundColor: colors.surface,
              borderRadius: r.pill,
              top: sp.xs,
              right: sp.xs,
            },
          ]}
        >
          <IconSymbol name="xmark" size={12} color={colors.textMid} />
        </Pressable>
        {/* Out of stock overlay */}
        {product.status === 'out_of_stock' && (
          <View style={[styles.oos, { backgroundColor: `${colors.bg}CC` }]}>
            <Text style={[typo.scale.caption, { fontFamily: typo.fonts.sansBold, color: colors.textMid }]}>
              Out of Stock
            </Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={{ padding: sp.sm }}>
        <Text
          style={[typo.scale.caption, { fontFamily: typo.fonts.sans, color: colors.textLow }]}
          numberOfLines={1}
        >
          {product.category}
        </Text>
        <Text
          style={[typo.scale.bodySmall, { fontFamily: typo.fonts.serifBold, color: colors.textHigh }]}
          numberOfLines={2}
        >
          {product.title}
        </Text>
        {price && (
          <Text
            style={[
              typo.scale.bodySmall,
              { fontFamily: typo.fonts.sansBold, color: colors.accent, marginTop: 2 },
            ]}
          >
            ₨{price.toLocaleString()}{priceUnit}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1 },
  imageWrap: { position: 'relative', aspectRatio: 4 / 5 },
  image: { width: '100%', height: '100%' },
  removeBtn: { position: 'absolute', width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  oos: { position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' },
});
