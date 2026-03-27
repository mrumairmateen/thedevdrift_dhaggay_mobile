import { useTheme } from '@shared/theme';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

const STATS = [
  { value: '48',   label: 'Tailors booked for Eid' },
  { value: '2–3w', label: 'Lead time' },
  { value: '850+', label: 'Eid orders placed' },
  { value: '100%', label: 'Delivery guarantee' },
];

interface Props {
  onBookTailor?: () => void;
}

export function EidBanner({ onBookTailor }: Props) {
  const { colors, sp, r, typo, mode } = useTheme();
  const router = useRouter();

  // Dark in light mode, elevated in dark mode — creates dramatic contrast
  const bannerBg = mode === 'light' ? colors.textHigh : colors.elevated;
  const bannerText = mode === 'light' ? colors.textOnAccent : colors.textHigh;
  const bannerMuted = mode === 'light' ? (colors.textOnAccent + 'AA') : colors.textMid;
  const statBorder = mode === 'light' ? (colors.textOnAccent + '33') : colors.border;

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: bannerBg,
          paddingHorizontal: sp.base,
          paddingVertical: sp['2xl'],
          marginHorizontal: sp.base,
          borderRadius: r.lg,
          overflow: 'hidden',
        },
      ]}
    >
      {/* Decorative thread accent bar */}
      <View style={[styles.accentBar, { backgroundColor: colors.thread }]} />

      {/* Seasonal label */}
      <Text
        style={[
          typo.scale.label,
          {
            fontFamily: typo.fonts.sansMed,
            color: colors.accent,
            marginBottom: sp.sm,
          },
        ]}
      >
        LIMITED SLOTS
      </Text>

      {/* Headline */}
      <Text
        style={[
          typo.scale.title2,
          {
            fontFamily: typo.fonts.serifBold,
            color: bannerText,
            marginBottom: sp.xs,
          },
        ]}
      >
        Eid ul-Fitr 2026{'\n'}Collection
      </Text>

      {/* Subline */}
      <Text
        style={[
          typo.scale.body,
          {
            fontFamily: typo.fonts.serif,
            fontStyle: 'italic',
            color: colors.accent,
            marginBottom: sp.xl,
          },
        ]}
      >
        Now accepting bookings
      </Text>

      {/* Description */}
      <Text
        style={[
          typo.scale.bodySmall,
          {
            fontFamily: typo.fonts.sans,
            color: bannerMuted,
            marginBottom: sp.xl,
            lineHeight: 22,
          },
        ]}
      >
        Our tailors are booking fast. Secure your slot — bridal pieces, family suits, festive kurtas.
      </Text>

      {/* Stats 2×2 grid */}
      <View style={[styles.statsGrid, { marginBottom: sp.xl, gap: sp.sm }]}>
        {STATS.map((stat) => (
          <View
            key={stat.label}
            style={[
              styles.statBox,
              {
                borderColor: statBorder,
                borderRadius: r.md,
                padding: sp.md,
                flex: 1,
              },
            ]}
          >
            <Text
              style={[
                typo.scale.title3,
                {
                  fontFamily: typo.fonts.display,
                  color: colors.accent,
                  marginBottom: 2,
                },
              ]}
            >
              {stat.value}
            </Text>
            <Text
              style={[
                typo.scale.caption,
                {
                  fontFamily: typo.fonts.sans,
                  color: bannerMuted,
                  lineHeight: 16,
                },
              ]}
            >
              {stat.label}
            </Text>
          </View>
        ))}
      </View>

      {/* CTAs */}
      <View style={[styles.ctaRow, { gap: sp.sm }]}>
        <Pressable
          onPress={onBookTailor ?? (() => router.push('/orders/new' as any))}
          style={[
            styles.primaryCta,
            {
              backgroundColor: colors.accent,
              borderRadius: r.pill,
              paddingHorizontal: sp.xl,
              paddingVertical: sp.md,
              flex: 1,
            },
          ]}
        >
          <Text
            style={[
              typo.scale.label,
              { fontFamily: typo.fonts.sansBold, color: colors.textOnAccent, textAlign: 'center' },
            ]}
          >
            BOOK YOUR TAILOR
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/(tabs)/designs' as any)}
          style={[
            styles.secondaryCta,
            {
              borderColor: statBorder,
              borderRadius: r.pill,
              paddingHorizontal: sp.md,
              paddingVertical: sp.md,
            },
          ]}
        >
          <Text
            style={[
              typo.scale.label,
              { fontFamily: typo.fonts.sansMed, color: bannerText },
            ]}
          >
            BROWSE
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {},
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statBox: {
    borderWidth: 1,
    minWidth: '47%',
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryCta: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryCta: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
