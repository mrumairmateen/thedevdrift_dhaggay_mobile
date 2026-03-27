import { useTheme } from '@shared/theme';
import { useRef, useEffect } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

const AVATAR_INITIALS = ['A', 'F', 'S', 'N', 'Z'];

export function HeroBanner() {
  const { colors, sp, r, typo, elev, mode } = useTheme();
  const router = useRouter();

  // Pulsing opacity for live badge dot
  const pulseAnim = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    ).start();
  }, [pulseAnim]);

  const avatarBgs = [colors.accent, colors.success, colors.info, colors.warning, colors.accentMid];

  return (
    <View
      style={[
        styles.root,
        elev.low,
        {
          backgroundColor: colors.elevated,
          borderBottomColor: colors.border,
          borderLeftColor: colors.thread,
          paddingHorizontal: sp.base,
          paddingTop: sp['2xl'],
          paddingBottom: sp.xl,
        },
      ]}
    >
      {/* Thread accent stripe */}
      <View
        style={[styles.threadStripe, { backgroundColor: colors.thread }]}
      />

      {/* Live badge */}
      <View
        style={[
          styles.liveBadge,
          {
            backgroundColor: colors.accentSubtle,
            borderColor: colors.border,
            borderRadius: r.pill,
            paddingHorizontal: sp.md,
            paddingVertical: sp.xs,
            marginBottom: sp.lg,
          },
        ]}
      >
        <View style={styles.dotContainer}>
          <View style={[styles.dotHalo, { backgroundColor: colors.success + '33' }]} />
          <Animated.View
            style={[styles.dot, { backgroundColor: colors.success, opacity: pulseAnim }]}
          />
        </View>
        <Text style={[typo.scale.caption, { fontFamily: typo.fonts.sansMed, color: colors.accent }]}>
          847 outfits in progress right now
        </Text>
      </View>

      {/* Headline */}
      <Text
        style={[
          typo.scale.title1,
          { fontFamily: typo.fonts.serifBold, color: colors.textHigh, marginBottom: sp.xs },
        ]}
      >
        Your Fabric.{'\n'}Your Design.{'\n'}Delivered.
      </Text>

      {/* Subtitle */}
      <Text
        style={[
          typo.scale.body,
          {
            fontFamily: typo.fonts.sans,
            color: colors.textMid,
            marginBottom: sp.xl,
            lineHeight: 24,
          },
        ]}
      >
        Pakistan's first end-to-end custom clothing marketplace.{' '}
        Fabric → Tailor → Your door.
      </Text>

      {/* Social proof row */}
      <View style={[styles.socialRow, { marginBottom: sp.xl }]}>
        {/* Avatar stack */}
        <View style={styles.avatarStack}>
          {AVATAR_INITIALS.map((initial, i) => (
            <View
              key={initial}
              style={[
                styles.avatar,
                {
                  backgroundColor: avatarBgs[i],
                  borderColor: colors.elevated,
                  marginLeft: i === 0 ? 0 : -8,
                  zIndex: 5 - i,
                },
              ]}
            >
              <Text
                style={{
                  fontSize: 9,
                  fontFamily: typo.fonts.sansBold,
                  color: colors.textOnAccent,
                }}
              >
                {initial}
              </Text>
            </View>
          ))}
        </View>

        {/* Count + rating */}
        <View style={styles.socialText}>
          <Text style={[typo.scale.bodySmall, { fontFamily: typo.fonts.sansBold, color: colors.textHigh }]}>
            12,000+ outfits
          </Text>
          <View style={styles.ratingRow}>
            <Text style={{ fontSize: 11, color: colors.warning }}>★</Text>
            <Text style={[typo.scale.caption, { fontFamily: typo.fonts.sansMed, color: colors.textMid }]}>
              {' '}4.9 · 8.4k reviews
            </Text>
          </View>
        </View>
      </View>

      {/* CTA buttons */}
      <View style={[styles.ctaRow, { gap: sp.sm }]}>
        <Pressable
          onPress={() => router.push('/orders/new' as any)}
          style={[
            styles.ctaPrimary,
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
            START YOUR ORDER
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/(tabs)/designs' as any)}
          style={[
            styles.ctaSecondary,
            {
              borderColor: colors.border,
              borderRadius: r.pill,
              paddingHorizontal: sp.lg,
              paddingVertical: sp.md,
            },
          ]}
        >
          <Text
            style={[
              typo.scale.label,
              { fontFamily: typo.fonts.sansMed, color: colors.textMid },
            ]}
          >
            EXPLORE
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderBottomWidth: 1,
    borderLeftWidth: 4,
    overflow: 'hidden',
  },
  threadStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    borderWidth: 1,
  },
  dotContainer: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotHalo: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialText: {
    gap: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaPrimary: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaSecondary: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
