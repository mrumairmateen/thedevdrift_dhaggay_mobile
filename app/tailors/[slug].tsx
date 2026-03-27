import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Dimensions,
  FlatList,
  ListRenderItem,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorBanner } from '@shared/components/ui/ErrorBanner';
import { Skeleton } from '@shared/components/ui/Skeleton';
import { IconSymbol } from '@shared/components/ui/icon-symbol';
import { useGetTailorBySlugQuery } from '@services/tailorsApi';
import type { TailorProfile } from '@services/tailorsApi';
import { useTheme } from '@shared/theme';
import type { ColorTokens } from '@shared/theme';
import { formatPkr } from '@shared/utils';
import { openAuthSheet } from '@store/authSlice';
import { useAppDispatch, useAppSelector } from '@store/index';

const { width: SW } = Dimensions.get('window');
const PORTFOLIO_SIZE = 120;

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('') || '?';
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function TailorSkeleton(): React.JSX.Element {
  const { colors, sp, r } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, padding: sp.base, gap: sp.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: sp.md, marginTop: sp['2xl'] }}>
        <Skeleton width={72} height={72} radius={r.pill} />
        <View style={{ flex: 1, gap: sp.sm }}>
          <Skeleton width="65%" height={22} />
          <Skeleton width="35%" height={14} />
          <Skeleton width="45%" height={14} />
        </View>
      </View>
      <Skeleton width="100%" height={80} radius={r.md} />
      <View style={{ flexDirection: 'row', gap: sp.sm }}>
        {[0, 1, 2, 3].map(i => (
          <Skeleton key={i} width={(SW - sp.base * 2 - sp.sm * 3) / 4} height={72} radius={r.sm} />
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: sp.sm, flexWrap: 'wrap' }}>
        {[0, 1, 2, 3].map(i => (
          <Skeleton key={i} width={80} height={24} radius={r.pill} />
        ))}
      </View>
    </View>
  );
}

// ── Availability pulsing dot ──────────────────────────────────────────────────

function AvailabilityDot({ available }: { available: boolean }): React.JSX.Element {
  const { colors, typo } = useTheme();
  const dotColor = available ? colors.success : colors.error;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dotColor }} />
      <Text style={{ ...typo.scale.bodySmall, fontFamily: typo.fonts.sansMed, color: dotColor }}>
        {available ? 'Available Now' : 'Currently Busy'}
      </Text>
    </View>
  );
}

// ── Tier badge color helper ───────────────────────────────────────────────────

function getTierColors(
  tier: TailorProfile['tier'],
  colors: ColorTokens,
): { bg: string; text: string } {
  switch (tier) {
    case 'Master':
      return { bg: colors.accent, text: colors.textOnAccent };
    case 'Premium':
      return { bg: colors.info, text: colors.textOnAccent };
    case 'Standard':
    default:
      return { bg: colors.panel, text: colors.textMid };
  }
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function TailorProfileScreen(): React.JSX.Element {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { colors, sp, r, typo, elev } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector(state => state.auth.user !== null);

  const { data: tailor, isLoading, isError, refetch } = useGetTailorBySlugQuery(slug ?? '');

  const [bioExpanded, setBioExpanded] = useState(false);

  const handleBack = useCallback(() => router.back(), [router]);
  const handleToggleBio = useCallback(() => setBioExpanded(prev => !prev), []);

  const handleBookTailor = useCallback(() => {
    if (!tailor) return;
    if (!isLoggedIn) {
      dispatch(openAuthSheet('login'));
      return;
    }
    router.push(`/orders/new?tailorId=${tailor._id}` as never);
  }, [dispatch, isLoggedIn, router, tailor]);

  const renderPortfolioItem = useCallback<ListRenderItem<string>>(
    ({ item: imgUrl }) => (
      <View
        style={{
          width: PORTFOLIO_SIZE,
          height: PORTFOLIO_SIZE,
          borderRadius: r.sm,
          overflow: 'hidden',
          backgroundColor: colors.panel,
        }}
      >
        {imgUrl.length > 0 ? (
          <Image source={{ uri: imgUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : null}
      </View>
    ),
    [colors.panel, r.sm],
  );

  // ── Loading ───────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={{ paddingTop: insets.top + sp.sm, paddingHorizontal: sp.base }}>
          <Pressable onPress={handleBack} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <IconSymbol name="chevron.left" size={20} color={colors.accent} />
            <Text style={{ ...typo.scale.body, fontFamily: typo.fonts.sansMed, color: colors.accent }}>
              Back
            </Text>
          </Pressable>
        </View>
        <TailorSkeleton />
      </View>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────

  if (isError || !tailor) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={{ paddingTop: insets.top + sp.sm, paddingHorizontal: sp.base }}>
          <Pressable onPress={handleBack} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <IconSymbol name="chevron.left" size={20} color={colors.accent} />
            <Text style={{ ...typo.scale.body, fontFamily: typo.fonts.sansMed, color: colors.accent }}>
              Back
            </Text>
          </Pressable>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: sp['2xl'] }}>
          <ErrorBanner
            message={isError ? "Couldn't load this tailor. Check your connection." : 'Tailor not found.'}
            onRetry={isError ? () => refetch() : undefined}
          />
          <Pressable onPress={handleBack} style={{ marginTop: sp.lg }}>
            <Text style={{ ...typo.scale.bodySmall, fontFamily: typo.fonts.sansMed, color: colors.accent }}>
              ← Go back
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ── Derived ───────────────────────────────────────────────────────────────

  const initials = getInitials(tailor.name);
  const tierColors = getTierColors(tailor.tier, colors);
  const portfolioImages = tailor.portfolioImages ?? [];

  // ── Styles ────────────────────────────────────────────────────────────────

  const s = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg },
    scrollContent: { paddingBottom: 100 + insets.bottom },

    // Top header bar (overlay)
    headerBar: {
      paddingTop: insets.top + sp.sm,
      paddingHorizontal: sp.base,
      paddingBottom: sp.md,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerBtn: {
      width: 40,
      height: 40,
      borderRadius: r.pill,
      backgroundColor: colors.elevated,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerRight: { flexDirection: 'row', gap: sp.sm },

    // Hero section
    heroSection: { paddingHorizontal: sp.base, paddingBottom: sp.base },
    avatarRow: { flexDirection: 'row', alignItems: 'flex-start', gap: sp.md, marginBottom: sp.md },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: r.pill,
      backgroundColor: colors.accentSubtle,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    avatarText: { ...typo.scale.title3, fontFamily: typo.fonts.sansBold, color: colors.accent },
    nameBlock: { flex: 1 },
    nameText: { ...typo.scale.title2, fontFamily: typo.fonts.serifBold, color: colors.textHigh },
    tierBadge: {
      alignSelf: 'flex-start',
      borderRadius: r.sharp,
      paddingHorizontal: sp.sm,
      paddingVertical: 3,
      marginTop: sp.xs,
    },
    tierText: { ...typo.scale.label, fontFamily: typo.fonts.sansBold },
    verifiedBadge: {
      alignSelf: 'flex-start',
      backgroundColor: colors.infoSubtle,
      borderRadius: r.sharp,
      paddingHorizontal: sp.sm,
      paddingVertical: 3,
      marginTop: sp.xs,
    },
    verifiedText: { ...typo.scale.label, fontFamily: typo.fonts.sansMed, color: colors.info },
    cityRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: sp.xs },
    cityText: { ...typo.scale.caption, fontFamily: typo.fonts.sans, color: colors.textMid },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: sp.xs },
    ratingText: { ...typo.scale.bodySmall, fontFamily: typo.fonts.sans, color: colors.textMid },

    // Quick stats row
    statsRow: { flexDirection: 'row', gap: sp.sm, paddingHorizontal: sp.base, marginBottom: sp.base },
    statCard: {
      flex: 1,
      backgroundColor: colors.elevated,
      borderRadius: r.sm,
      padding: sp.sm,
      alignItems: 'center',
    },
    statValue: { ...typo.scale.title3, fontFamily: typo.fonts.sansBold, color: colors.textHigh },
    statLabel: { ...typo.scale.caption, fontFamily: typo.fonts.sans, color: colors.textMid, marginTop: 2, textAlign: 'center' },

    // Specialties
    sectionHeader: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansMed,
      color: colors.textLow,
      paddingHorizontal: sp.base,
      marginBottom: sp.sm,
    },
    specialtiesRow: { paddingHorizontal: sp.base, flexDirection: 'row', flexWrap: 'wrap', gap: sp.xs, marginBottom: sp.base },
    specialtyChip: {
      backgroundColor: colors.accentSubtle,
      borderRadius: r.pill,
      paddingHorizontal: sp.md,
      paddingVertical: sp.xs,
    },
    specialtyText: { ...typo.scale.caption, fontFamily: typo.fonts.sansMed, color: colors.accent },

    // Portfolio
    portfolioList: { marginBottom: sp.base },

    // Bio
    bioSection: { paddingHorizontal: sp.base, marginBottom: sp.base },
    bioTitle: { ...typo.scale.label, fontFamily: typo.fonts.sansMed, color: colors.textLow, marginBottom: sp.sm },
    bioText: { ...typo.scale.body, fontFamily: typo.fonts.sans, color: colors.textMid, lineHeight: 24 },
    bioToggle: { ...typo.scale.caption, fontFamily: typo.fonts.sansMed, color: colors.accent, marginTop: 4 },

    // Divider
    divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginHorizontal: sp.base, marginBottom: sp.lg },

    // Sticky CTA
    stickyBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.navSolid,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      padding: sp.base,
      ...elev.high,
    },
    bookBtn: {
      backgroundColor: colors.accent,
      borderRadius: r.pill,
      height: 52,
      alignItems: 'center',
      justifyContent: 'center',
    },
    bookBtnText: { ...typo.scale.body, fontFamily: typo.fonts.sansBold, color: colors.textOnAccent },
  });

  return (
    <View style={s.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {/* Header bar */}
        <View style={s.headerBar}>
          <Pressable onPress={handleBack} style={s.headerBtn}>
            <IconSymbol name="chevron.left" size={20} color={colors.textHigh} />
          </Pressable>
          <View style={s.headerRight}>
            <Pressable style={s.headerBtn}>
              <IconSymbol name="square.and.arrow.up" size={18} color={colors.textHigh} />
            </Pressable>
          </View>
        </View>

        {/* Hero section */}
        <View style={s.heroSection}>
          <View style={s.avatarRow}>
            {/* Avatar */}
            <View style={s.avatar}>
              {tailor.avatarUrl != null ? (
                <Image source={{ uri: tailor.avatarUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
              ) : (
                <Text style={s.avatarText}>{initials}</Text>
              )}
            </View>

            {/* Name + badges */}
            <View style={s.nameBlock}>
              <Text style={s.nameText}>{tailor.name}</Text>

              <View style={[s.tierBadge, { backgroundColor: tierColors.bg }]}>
                <Text style={[s.tierText, { color: tierColors.text }]}>
                  {tailor.tier.toUpperCase()}
                </Text>
              </View>

              {tailor.isVerified && (
                <View style={s.verifiedBadge}>
                  <Text style={s.verifiedText}>✓ Verified</Text>
                </View>
              )}
            </View>
          </View>

          {/* City */}
          <View style={s.cityRow}>
            <IconSymbol name="location.fill" size={12} color={colors.textLow} />
            <Text style={s.cityText}>{tailor.city}</Text>
          </View>

          {/* Rating */}
          <View style={s.ratingRow}>
            {[1, 2, 3, 4, 5].map(i => (
              <IconSymbol
                key={i}
                name={i <= Math.round(tailor.rating) ? 'star.fill' : 'star'}
                size={13}
                color={i <= Math.round(tailor.rating) ? '#F59E0B' : colors.textLow}
              />
            ))}
            <Text style={s.ratingText}>
              {tailor.rating.toFixed(1)} · {tailor.reviewCount} reviews
            </Text>
          </View>

          {/* Availability */}
          <View style={{ marginTop: sp.sm }}>
            <AvailabilityDot available={tailor.isAvailable} />
          </View>
        </View>

        {/* Quick stats row */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={s.statValue}>{tailor.completedOrders}</Text>
            <Text style={s.statLabel}>Orders Done</Text>
          </View>
          <View style={s.statCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
              <IconSymbol name="star.fill" size={12} color="#F59E0B" />
              <Text style={s.statValue}>{tailor.rating.toFixed(1)}</Text>
            </View>
            <Text style={s.statLabel}>Rating</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statValue}>{tailor.turnaroundDays}d</Text>
            <Text style={s.statLabel}>Turnaround</Text>
          </View>
          <View style={s.statCard}>
            <Text style={[s.statValue, { fontSize: 14 }]}>{formatPkr(tailor.startingPrice)}</Text>
            <Text style={s.statLabel}>Starting From</Text>
          </View>
        </View>

        <View style={s.divider} />

        {/* Specialties */}
        {tailor.specialties.length > 0 && (
          <>
            <Text style={s.sectionHeader}>SPECIALTIES</Text>
            <View style={s.specialtiesRow}>
              {tailor.specialties.map(spec => (
                <View key={spec} style={s.specialtyChip}>
                  <Text style={s.specialtyText}>{spec}</Text>
                </View>
              ))}
            </View>
            <View style={s.divider} />
          </>
        )}

        {/* Portfolio */}
        {portfolioImages.length > 0 && (
          <>
            <Text style={s.sectionHeader}>PORTFOLIO</Text>
            <FlatList
              data={portfolioImages}
              horizontal
              keyExtractor={(item, idx) => `${item}-${idx}`}
              renderItem={renderPortfolioItem}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: sp.base,
                gap: sp.sm,
                paddingBottom: sp.sm,
              }}
              style={s.portfolioList}
            />
            <View style={s.divider} />
          </>
        )}

        {/* Bio */}
        {tailor.bio != null && tailor.bio.length > 0 && (
          <View style={s.bioSection}>
            <Text style={s.bioTitle}>ABOUT</Text>
            <Text
              style={s.bioText}
              numberOfLines={bioExpanded ? undefined : 4}
            >
              {tailor.bio}
            </Text>
            {tailor.bio.length > 180 && (
              <Pressable onPress={handleToggleBio}>
                <Text style={s.bioToggle}>{bioExpanded ? 'Show less' : 'Read more'}</Text>
              </Pressable>
            )}
          </View>
        )}
      </ScrollView>

      {/* Sticky Book CTA */}
      <View style={[s.stickyBar, { paddingBottom: sp.base + insets.bottom }]}>
        <Pressable onPress={handleBookTailor} style={s.bookBtn}>
          <Text style={s.bookBtnText}>Book This Tailor</Text>
        </Pressable>
      </View>
    </View>
  );
}
