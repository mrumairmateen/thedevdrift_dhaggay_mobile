import { IconSymbol } from '@/components/ui/icon-symbol';
import { TAILORS } from '@features/home/home.fixtures';
import type { Tailor } from '@features/tailors/tailors.types';
import { useTheme } from '@shared/theme';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';


function TailorCard({ tailor }: { tailor: Tailor }) {
  const { colors, sp, r, typo, elev } = useTheme();
  const router = useRouter();
  const stars = Math.round(tailor.rating);

  const tierBg =
    tailor.tier === 'master'   ? colors.warning :
    tailor.tier === 'premium'  ? colors.accent  :
    colors.chipBg;
  const tierText =
    tailor.tier === 'standard' ? colors.textMid : colors.textOnAccent;

  const name = typeof tailor.userId === 'object' && tailor.userId !== null
    ? tailor.userId.name
    : tailor.initials;
  const city = tailor.serviceAreas[0]?.city ?? '';
  const startingPrice = tailor.pricing?.shalwarKameez ?? tailor.categoryPricing?.[0]?.price ?? 0;

  return (
    <Pressable
      onPress={() => router.push(`/tailors/${tailor.slug}` as any)}
      style={[
        styles.card,
        elev.low,
        {
          backgroundColor: colors.elevated,
          borderColor: tailor.tier === 'master' ? colors.borderStrong : colors.border,
          borderRadius: r.lg,
          width: 232,
          padding: sp.base,
          borderWidth: tailor.tier === 'master' ? 1.5 : 1,
        },
      ]}
    >
      {/* Top row: avatar + name/city */}
      <View style={[styles.topRow, { marginBottom: sp.md }]}>
        {/* Avatar */}
        <View
          style={[
            styles.avatar,
            {
              backgroundColor: tailor.avatarColor,
              borderRadius: r.pill,
              width: 48,
              height: 48,
            },
          ]}
        >
          <Text style={[typo.scale.body, { fontFamily: typo.fonts.sansBold, color: colors.textOnAccent }]}>
            {tailor.initials}
          </Text>
        </View>

        {/* Name + city */}
        <View style={styles.nameBlock}>
          <Text
            style={[typo.scale.bodySmall, { fontFamily: typo.fonts.serifBold, color: colors.textHigh }]}
            numberOfLines={1}
          >
            {name}
          </Text>
          <View style={styles.cityRow}>
            <IconSymbol name="location.fill" size={10} color={colors.textLow} />
            <Text style={[typo.scale.caption, { fontFamily: typo.fonts.sans, color: colors.textLow }]}>
              {' '}{city}
            </Text>
          </View>
        </View>
      </View>

      {/* Tier badge + availability */}
      <View style={[styles.midRow, { marginBottom: sp.md }]}>
        <View
          style={[
            styles.tierBadge,
            {
              backgroundColor: tierBg,
              borderRadius: r.sharp,
              paddingHorizontal: sp.sm,
              paddingVertical: 3,
            },
          ]}
        >
          <Text style={[typo.scale.label, { fontFamily: typo.fonts.sansBold, color: tierText, fontSize: 10 }]}>
            {tailor.tier.toUpperCase()}
          </Text>
        </View>

        {tailor.isAvailable && (
          <View style={styles.availRow}>
            <View style={[styles.availDot, { backgroundColor: colors.success }]} />
            <Text style={[typo.scale.caption, { fontFamily: typo.fonts.sansMed, color: colors.success }]}>
              Available
            </Text>
          </View>
        )}
      </View>

      {/* Rating */}
      <View style={[styles.ratingRow, { marginBottom: sp.xs }]}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Text key={i} style={{ fontSize: 11, color: i <= stars ? colors.warning : colors.border }}>
            ★
          </Text>
        ))}
        <Text style={[typo.scale.caption, { fontFamily: typo.fonts.sans, color: colors.textMid, marginLeft: 4 }]}>
          {tailor.rating} · {tailor.reviewCount} reviews
        </Text>
      </View>

      {/* Completed orders */}
      <Text style={[typo.scale.caption, { fontFamily: typo.fonts.sans, color: colors.textLow, marginBottom: sp.md }]}>
        {tailor.completedOrders} orders completed
      </Text>

      {/* Price + CTA */}
      <View style={[styles.bottomRow, { borderTopColor: colors.border, paddingTop: sp.md }]}>
        <View>
          <Text style={[typo.scale.caption, { fontFamily: typo.fonts.sans, color: colors.textLow }]}>
            Starting from
          </Text>
          <Text style={[typo.scale.price, { fontFamily: typo.fonts.sansBold, color: colors.textHigh }]}>
            PKR {startingPrice.toLocaleString('en-PK')}
          </Text>
        </View>

        <Pressable
          onPress={() => router.push(`/tailors/${tailor.slug}` as any)}
          style={[
            styles.bookBtn,
            {
              backgroundColor: colors.accent,
              borderRadius: r.pill,
              paddingHorizontal: sp.md,
              paddingVertical: sp.sm,
            },
          ]}
        >
          <Text style={[typo.scale.label, { fontFamily: typo.fonts.sansBold, color: colors.textOnAccent }]}>
            VIEW
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

export function FeaturedTailors() {
  const { sp } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.container, { paddingHorizontal: sp.base, gap: sp.md }]}
    >
      {TAILORS.map((tailor) => (
        <TailorCard key={tailor._id} tailor={tailor} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  card: {},
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameBlock: {
    flex: 1,
    gap: 2,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  midRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tierBadge: {},
  availRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  availDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
  },
  bookBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
