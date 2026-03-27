import { OrderProgressBar } from '@features/dashboard/components/shared/OrderProgressBar';
import { StatusBadge } from '@features/dashboard/components/shared/StatusBadge';
import type { Order, OrderItem } from '@features/dashboard/dashboard.types';
import { useTheme } from '@shared/theme';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

interface Props {
  order: Order;
}

function getShopName(shopId: OrderItem['shopId']): string | null {
  if (typeof shopId === 'object') return shopId.name;
  return null;
}

function ItemRow({ item }: { item: OrderItem }): React.JSX.Element {
  const { colors, sp, r, typo } = useTheme();
  const thumbUrl = item.productId.images[0]?.url ?? null;
  const itemTotal = item.pricing.fabricPrice + item.pricing.stitchingFee + item.pricing.platformFee;
  const shopName = getShopName(item.shopId);

  return (
    <View style={[styles.itemRow, { borderBottomColor: colors.border }]}>
      {thumbUrl ? (
        <Image
          source={{ uri: thumbUrl }}
          style={[styles.thumb, { borderRadius: r.md, backgroundColor: colors.panel }]}
        />
      ) : (
        <View style={[styles.thumb, { borderRadius: r.md, backgroundColor: colors.panel }]} />
      )}
      <View style={{ flex: 1 }}>
        <Text style={[typo.scale.bodySmall, { fontFamily: typo.fonts.serifBold, color: colors.textHigh }]}>
          {item.productId.title}
        </Text>
        <Text style={[typo.scale.caption, { fontFamily: typo.fonts.sans, color: colors.textLow, marginTop: 2 }]}>
          {item.designId.title}
        </Text>
        {shopName && (
          <Text style={[typo.scale.caption, { fontFamily: typo.fonts.sans, color: colors.textLow, marginTop: 1 }]}>
            {shopName}
          </Text>
        )}
        <Text
          style={[typo.scale.caption, { fontFamily: typo.fonts.sans, color: colors.textMid, marginTop: sp.xs }]}
        >
          Fabric ₨{item.pricing.fabricPrice.toLocaleString()}
          {'  ·  '}Stitching ₨{item.pricing.stitchingFee.toLocaleString()}
        </Text>
        <Text style={[typo.scale.price, { fontFamily: typo.fonts.sansBold, color: colors.accent, marginTop: sp.xs }]}>
          ₨{itemTotal.toLocaleString()}
        </Text>
        {item.isRushOrder && (
          <Text style={[typo.scale.caption, { fontFamily: typo.fonts.sansMed, color: colors.warning, marginTop: 2 }]}>
            Rush order
          </Text>
        )}
      </View>
    </View>
  );
}

export function OrderDetailView({ order }: Props): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();

  const tailorName = order.tailorId?.userId.name ?? null;
  const tailorTier = order.tailorId?.tier ?? null;
  const measurements = order.items[0]?.measurementSnapshot ?? null;

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
          Placed {new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}
        </Text>
      </View>

      {/* Cancellation reason */}
      {order.cancellation && (
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.errorSubtle,
              borderColor: colors.error,
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
                color: colors.error,
                textTransform: 'uppercase',
                letterSpacing: 1,
                marginBottom: sp.xs,
              },
            ]}
          >
            Cancellation Reason
          </Text>
          <Text style={[typo.scale.body, { fontFamily: typo.fonts.sans, color: colors.error }]}>
            {order.cancellation.reason}
          </Text>
          {order.cancellation.refundAmount > 0 && (
            <Text
              style={[
                typo.scale.caption,
                { fontFamily: typo.fonts.sansMed, color: colors.error, marginTop: sp.xs },
              ]}
            >
              Refund: ₨{order.cancellation.refundAmount.toLocaleString()}
            </Text>
          )}
        </View>
      )}

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

      {/* Items */}
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
          Items ({order.items.length})
        </Text>
        {order.items.map((item) => (
          <ItemRow key={item._id} item={item} />
        ))}

        {/* Order total breakdown */}
        <View style={[styles.totalRow, { borderTopColor: colors.border, marginTop: sp.sm, paddingTop: sp.sm }]}>
          {order.pricing.deliveryFee > 0 && (
            <View style={styles.priceRow}>
              <Text style={[typo.scale.bodySmall, { fontFamily: typo.fonts.sans, color: colors.textMid }]}>
                Delivery
              </Text>
              <Text style={[typo.scale.bodySmall, { fontFamily: typo.fonts.sansMed, color: colors.textMid }]}>
                ₨{order.pricing.deliveryFee.toLocaleString()}
              </Text>
            </View>
          )}
          {order.pricing.loyaltyDiscount > 0 && (
            <View style={styles.priceRow}>
              <Text style={[typo.scale.bodySmall, { fontFamily: typo.fonts.sans, color: colors.success }]}>
                Loyalty discount
              </Text>
              <Text style={[typo.scale.bodySmall, { fontFamily: typo.fonts.sansMed, color: colors.success }]}>
                -₨{order.pricing.loyaltyDiscount.toLocaleString()}
              </Text>
            </View>
          )}
          {order.pricing.promoDiscount > 0 && (
            <View style={styles.priceRow}>
              <Text style={[typo.scale.bodySmall, { fontFamily: typo.fonts.sans, color: colors.success }]}>
                Promo discount
              </Text>
              <Text style={[typo.scale.bodySmall, { fontFamily: typo.fonts.sansMed, color: colors.success }]}>
                -₨{order.pricing.promoDiscount.toLocaleString()}
              </Text>
            </View>
          )}
          <View style={styles.priceRow}>
            <Text style={[typo.scale.body, { fontFamily: typo.fonts.sansBold, color: colors.textHigh }]}>
              Total
            </Text>
            <Text style={[typo.scale.price, { fontFamily: typo.fonts.sansBold, color: colors.accent }]}>
              ₨{order.pricing.total.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      {/* Tailor info */}
      {tailorName && (
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
            <View style={[styles.avatar, { backgroundColor: colors.accentSubtle, borderRadius: r.pill }]}>
              <Text style={[typo.scale.subtitle, { fontFamily: typo.fonts.serifBold, color: colors.accent }]}>
                {tailorName.charAt(0)}
              </Text>
            </View>
            <View>
              <Text style={[typo.scale.body, { fontFamily: typo.fonts.serifBold, color: colors.textHigh }]}>
                {tailorName}
              </Text>
              {tailorTier && (
                <Text style={[typo.scale.caption, { fontFamily: typo.fonts.sansMed, color: colors.textMid }]}>
                  {tailorTier.charAt(0).toUpperCase() + tailorTier.slice(1)} tier
                </Text>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Delivery address */}
      {order.deliveryAddress && (
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
            Delivery Address
          </Text>
          <Text style={[typo.scale.body, { fontFamily: typo.fonts.serifBold, color: colors.textHigh }]}>
            {order.deliveryAddress.line1}
            {order.deliveryAddress.city ? `, ${order.deliveryAddress.city}` : ''}
          </Text>
          {order.deliveryAddress.area && (
            <Text style={[typo.scale.bodySmall, { fontFamily: typo.fonts.sans, color: colors.textMid, marginTop: 2 }]}>
              {order.deliveryAddress.area}
            </Text>
          )}
          {order.deliveryAddress.phone && (
            <Text style={[typo.scale.caption, { fontFamily: typo.fonts.sans, color: colors.textLow, marginTop: sp.xs }]}>
              {order.deliveryAddress.phone}
            </Text>
          )}
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
      )}

      {/* Measurements (from first item) */}
      {measurements && (
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
            Measurements — {measurements.label}
          </Text>
          {(
            [
              ['Chest', measurements.chest],
              ['Waist', measurements.waist],
              ['Hips', measurements.hips],
              ['Shoulder', measurements.shoulder],
              ['Length', measurements.length],
              ['Sleeve', measurements.sleeveLength],
            ] as [string, number][]
          ).map(([label, value]) => (
            <View key={label} style={[styles.measureRow, { borderBottomColor: colors.border }]}>
              <Text style={[typo.scale.bodySmall, { fontFamily: typo.fonts.sansMed, color: colors.textMid }]}>
                {label}
              </Text>
              <Text style={[typo.scale.bodySmall, { fontFamily: typo.fonts.sansBold, color: colors.textHigh }]}>
                {value} in
              </Text>
            </View>
          ))}
          {measurements.customNotes && (
            <Text
              style={[
                typo.scale.caption,
                { fontFamily: typo.fonts.sans, color: colors.textMid, marginTop: sp.sm },
              ]}
            >
              {measurements.customNotes}
            </Text>
          )}
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
  itemRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalRow: { borderTopWidth: StyleSheet.hairlineWidth, gap: 6 },
  measureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
