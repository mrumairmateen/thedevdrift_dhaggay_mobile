import { IconSymbol } from '@shared/components/ui/icon-symbol';
import type { WishlistDesign } from '@features/dashboard/dashboard.types';
import { useTheme } from '@shared/theme';
import { useToggleDesignWishlistMutation } from '@services/wishlistApi';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  design: WishlistDesign;
}

export function WishlistDesignCard({ design }: Props) {
  const { colors, sp, r, typo } = useTheme();
  const [removeFromWishlist] = useToggleDesignWishlistMutation();

  const handleRemove = () => {
    removeFromWishlist(design._id);
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
        {design.imageUrl ? (
          <Image source={{ uri: design.imageUrl }} style={styles.image} />
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
      </View>

      {/* Info */}
      <View style={{ padding: sp.sm }}>
        <Text
          style={[typo.scale.bodySmall, { fontFamily: typo.fonts.serifBold, color: colors.textHigh }]}
          numberOfLines={2}
        >
          {design.title}
        </Text>
        {design.occasion.length > 0 && (
          <Text
            style={[typo.scale.caption, { fontFamily: typo.fonts.sans, color: colors.textLow, marginTop: 2 }]}
            numberOfLines={1}
          >
            {design.occasion.slice(0, 2).join(' · ')}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1 },
  imageWrap: { position: 'relative', aspectRatio: 3 / 4 },
  image: { width: '100%', height: '100%' },
  removeBtn: { position: 'absolute', width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
});
