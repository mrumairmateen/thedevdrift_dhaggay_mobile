import { OrderProgressBar } from '@features/dashboard/components/shared/OrderProgressBar';
import { StatusBadge } from '@features/dashboard/components/shared/StatusBadge';
import type { ActiveOrder } from '@features/dashboard/dashboard.types';
import { useTheme } from '@shared/theme';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  order: ActiveOrder;
}

export const ActiveOrderCard = React.memo(function ActiveOrderCard({ order }: Props): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();
  const router = useRouter();

  const handlePress = useCallback(() => {
    router.push(`/(dashboard)/orders/${order._id}` as never);
  }, [router, order._id]);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        elev.low,
        {
          backgroundColor: colors.elevated,
          borderColor: colors.border,
          borderRadius: r.lg,
          opacity: pressed ? 0.85 : 1,
          marginBottom: sp.sm,
        },
      ]}
    >
      <View style={[styles.topRow, { padding: sp.base }]}>
        {/* Thumbnail */}
        {order.productImage ? (
          <Image
            source={{ uri: order.productImage }}
            style={[styles.thumb, { borderRadius: r.md, backgroundColor: colors.panel }]}
          />
        ) : (
          <View style={[styles.thumb, { borderRadius: r.md, backgroundColor: colors.panel }]} />
        )}

        <View style={styles.meta}>
          <Text
            style={[typo.scale.bodySmall, { fontFamily: typo.fonts.serifBold, color: colors.textHigh }]}
            numberOfLines={2}
          >
            {order.productTitle}
          </Text>
          <View style={[styles.row, { marginTop: sp.xs }]}>
            <StatusBadge status={order.status} />
          </View>
          {order.estimatedDelivery && (
            <Text
              style={[
                typo.scale.caption,
                { fontFamily: typo.fonts.sans, color: colors.textLow, marginTop: sp.xs },
              ]}
            >
              Est. {new Date(order.estimatedDelivery).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}
            </Text>
          )}
        </View>

        <Text style={[typo.scale.price, { fontFamily: typo.fonts.sansBold, color: colors.accent }]}>
          ₨{(order.totalAmount ?? 0).toLocaleString()}
        </Text>
      </View>

      {/* Progress bar */}
      <View style={{ borderTopWidth: 1, borderTopColor: colors.border }}>
        <OrderProgressBar statusHistory={order.statusHistory} status={order.status} />
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: { borderWidth: 1, overflow: 'hidden' },
  topRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  thumb: { width: 60, height: 60 },
  meta: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
});
