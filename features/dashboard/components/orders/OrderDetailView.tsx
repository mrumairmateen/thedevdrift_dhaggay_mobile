import { OrderProgressBar } from '@features/dashboard/components/shared/OrderProgressBar';
import { StatusBadge } from '@features/dashboard/components/shared/StatusBadge';
import type { Order } from '@features/dashboard/dashboard.types';
import { useTheme } from '@shared/theme';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

interface Props {
  order: Order;
}

export function OrderDetailView({ order }: Props) {
  const { colors, sp, r, typo, elev } = useTheme();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: sp.base, paddingBottom: sp['4xl'] }}
    >
      {/* Status hero */}
      <View style={[styles.center, { marginBottom: sp.xl }]}>
        <StatusBadge status={order.status} size="md" />
        <Text
          style={[
            typo.scale.caption,
            { fontFamily: typo.fonts.sans, color: colors.textLow, marginTop: sp.xs },
          ]}
        >
          Placed {new Date(order.placedAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}
        </Text>
      </View>

      {/* Progress bar */}
      <View
        style={[
          styles.card,
          elev.low,
          { backgroundColor: colors.elevated, borderColor: colors.border, borderRadius: r.lg, marginBottom: sp.base },
        ]}
      >
        <Text
          style={[
            typo.scale.label,
            {
              fontFamily: typo.fonts.sansMed,
              color: colors.textLow,
              textTransform: 'uppercase',
              letterSpacing: 1,
              padding: sp.base,
              paddingBottom: 0,
            },
          ]}
        >
          Order Progress
        </Text>
        <OrderProgressBar statusHistory={order.statusHistory} status={order.status} />
      </View>

      {/* Product card */}
      <View
        style={[
          styles.card,
          elev.low,
          {
            backgroundColor: colors.elevated,
            borderColor: colors.border,
            borderRadius: r.lg,
            padding: sp.base,
            marginBottom: sp.base,
          },
        ]}
      >
        <Text
          style={[
            typo.scale.label,
            {
              fontFamily: typo.fonts.sansMed,
              color: colors.textLow,
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: sp.sm,
            },
          ]}
        >
          Product
        </Text>
        <View style={styles.row}>
          {order.product?.imageUrl ? (
            <Image
              source={{ uri: order.product.imageUrl }}
              style={[styles.thumb, { borderRadius: r.md, backgroundColor: colors.panel }]}
            />
          ) : (
            <View style={[styles.thumb, { borderRadius: r.md, backgroundColor: colors.panel }]} />
          )}
          <View style={{ flex: 1 }}>
            <Text
              style={[typo.scale.bodySmall, { fontFamily: typo.fonts.serifBold, color: colors.textHigh }]}
            >
              {order.product?.title ?? '—'}
            </Text>
            <Text
              style={[
                typo.scale.caption,
                { fontFamily: typo.fonts.sans, color: colors.textLow, marginTop: 2 },
              ]}
            >
              {order.product?.category ?? ''}
            </Text>
            <Text
              style={[
                typo.scale.price,
                { fontFamily: typo.fonts.sansBold, color: colors.accent, marginTop: sp.xs },
              ]}
            >
              ₨{(order.totalAmount ?? 0).toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      {/* Tailor info */}
      {order.tailor && (
        <View
          style={[
            styles.card,
            elev.low,
            {
              backgroundColor: colors.elevated,
              borderColor: colors.border,
              borderRadius: r.lg,
              padding: sp.base,
              marginBottom: sp.base,
            },
          ]}
        >
          <Text
            style={[
              typo.scale.label,
              {
                fontFamily: typo.fonts.sansMed,
                color: colors.textLow,
                textTransform: 'uppercase',
                letterSpacing: 1,
                marginBottom: sp.sm,
              },
            ]}
          >
            Tailor
          </Text>
          <View style={styles.row}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: colors.accentSubtle, borderRadius: r.pill },
              ]}
            >
              <Text
                style={[typo.scale.subtitle, { fontFamily: typo.fonts.serifBold, color: colors.accent }]}
              >
                {order.tailor.name.charAt(0)}
              </Text>
            </View>
            <View>
              <Text
                style={[typo.scale.body, { fontFamily: typo.fonts.serifBold, color: colors.textHigh }]}
              >
                {order.tailor.name}
              </Text>
              <Text
                style={[
                  typo.scale.caption,
                  { fontFamily: typo.fonts.sans, color: colors.textMid },
                ]}
              >
                ★ {order.tailor.rating.toFixed(1)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Delivery address */}
      <View
        style={[
          styles.card,
          elev.low,
          {
            backgroundColor: colors.elevated,
            borderColor: colors.border,
            borderRadius: r.lg,
            padding: sp.base,
            marginBottom: sp.base,
          },
        ]}
      >
        <Text
          style={[
            typo.scale.label,
            {
              fontFamily: typo.fonts.sansMed,
              color: colors.textLow,
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: sp.sm,
            },
          ]}
        >
          Delivery
        </Text>
        <Text
          style={[typo.scale.body, { fontFamily: typo.fonts.serifBold, color: colors.textHigh }]}
        >
          {order.deliveryAddress?.label ?? '—'}
        </Text>
        <Text
          style={[typo.scale.bodySmall, { fontFamily: typo.fonts.sans, color: colors.textMid, marginTop: 2 }]}
        >
          {order.deliveryAddress?.line1}{order.deliveryAddress?.city ? `, ${order.deliveryAddress.city}` : ''}
        </Text>
        {order.estimatedDelivery && (
          <Text
            style={[
              typo.scale.caption,
              { fontFamily: typo.fonts.sansMed, color: colors.accent, marginTop: sp.xs },
            ]}
          >
            Est. delivery:{' '}
            {new Date(order.estimatedDelivery).toLocaleDateString('en-PK', {
              day: 'numeric',
              month: 'long',
            })}
          </Text>
        )}
      </View>

      {/* Measurements */}
      {order.measurements && Object.keys(order.measurements).length > 0 && (
        <View
          style={[
            styles.card,
            elev.low,
            {
              backgroundColor: colors.elevated,
              borderColor: colors.border,
              borderRadius: r.lg,
              padding: sp.base,
              marginBottom: sp.base,
            },
          ]}
        >
          <Text
            style={[
              typo.scale.label,
              {
                fontFamily: typo.fonts.sansMed,
                color: colors.textLow,
                textTransform: 'uppercase',
                letterSpacing: 1,
                marginBottom: sp.sm,
              },
            ]}
          >
            Measurements
          </Text>
          {Object.entries(order.measurements).map(([key, val]) => (
            <View key={key} style={[styles.measureRow, { borderBottomColor: colors.border }]}>
              <Text
                style={[typo.scale.bodySmall, { fontFamily: typo.fonts.sansMed, color: colors.textMid }]}
              >
                {key.replace(/_/g, ' ')}
              </Text>
              <Text
                style={[typo.scale.bodySmall, { fontFamily: typo.fonts.sansBold, color: colors.textHigh }]}
              >
                {val} in
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Notes */}
      {order.notes && (
        <View
          style={[
            elev.low,
            {
              backgroundColor: colors.panel,
              borderRadius: r.md,
              padding: sp.base,
            },
          ]}
        >
          <Text
            style={[
              typo.scale.label,
              {
                fontFamily: typo.fonts.sansMed,
                color: colors.textLow,
                textTransform: 'uppercase',
                letterSpacing: 1,
                marginBottom: sp.xs,
              },
            ]}
          >
            Notes
          </Text>
          <Text style={[typo.scale.body, { fontFamily: typo.fonts.sans, color: colors.textMid }]}>
            {order.notes}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1 },
  center: { alignItems: 'center' },
  row: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  thumb: { width: 60, height: 60, flexShrink: 0 },
  avatar: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  measureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
