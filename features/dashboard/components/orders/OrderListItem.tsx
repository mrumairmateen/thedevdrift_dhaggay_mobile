import { StatusBadge } from '@features/dashboard/components/shared/StatusBadge';
import type { Order } from '@features/dashboard/dashboard.types';
import { useTheme } from '@shared/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  order: Order;
  onPress: (id: string) => void;
}

export function OrderListItem({ order, onPress }: Props) {
  const { colors, sp, r, typo } = useTheme();

  return (
    <Pressable
      onPress={() => onPress(order._id)}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: colors.elevated,
          borderColor: colors.border,
          borderRadius: r.lg,
          padding: sp.base,
          marginBottom: sp.sm,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      {/* Thumbnail */}
      {order.product?.imageUrl ? (
        <Image
          source={{ uri: order.product.imageUrl }}
          style={[styles.thumb, { borderRadius: r.md, backgroundColor: colors.panel }]}
        />
      ) : (
        <View style={[styles.thumb, { borderRadius: r.md, backgroundColor: colors.panel }]} />
      )}

      {/* Meta */}
      <View style={styles.meta}>
        <Text
          style={[typo.scale.bodySmall, { fontFamily: typo.fonts.serifBold, color: colors.textHigh }]}
          numberOfLines={2}
        >
          {order.product?.title ?? '—'}
        </Text>
        <Text
          style={[
            typo.scale.caption,
            { fontFamily: typo.fonts.sans, color: colors.textLow, marginTop: 2 },
          ]}
        >
          #{order.orderNumber}
        </Text>
        <View style={{ marginTop: sp.xs }}>
          <StatusBadge status={order.status} />
        </View>
      </View>

      {/* Price + chevron */}
      <View style={styles.right}>
        <Text style={[typo.scale.price, { fontFamily: typo.fonts.sansBold, color: colors.accent }]}>
          ₨{(order.totalAmount ?? 0).toLocaleString()}
        </Text>
        <IconSymbol name="chevron.right" size={16} color={colors.textLow} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1 },
  thumb: { width: 60, height: 60, flexShrink: 0 },
  meta: { flex: 1 },
  right: { alignItems: 'flex-end', gap: 4 },
});
