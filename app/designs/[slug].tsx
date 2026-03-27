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
import type { Design } from '@services/designsApi';
import { useGetDesignBySlugQuery, useGetDesignsQuery } from '@services/designsApi';
import { useTheme } from '@shared/theme';

const { width: SW } = Dimensions.get('window');
const RELATED_CARD_W = 130;
const RELATED_CARD_H = 170;

// ── Loading skeleton ──────────────────────────────────────────────────────────

function DesignSkeleton(): React.JSX.Element {
  const { colors, sp } = useTheme();
  const imageH = Math.round(SW * 0.85);
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Skeleton width={SW} height={imageH} radius={0} />
      <View style={{ padding: sp.base, gap: sp.md }}>
        <View style={{ flexDirection: 'row', gap: sp.sm }}>
          <Skeleton width={70} height={22} radius={999} />
          <Skeleton width={70} height={22} radius={999} />
        </View>
        <Skeleton width="75%" height={26} />
        <View style={{ flexDirection: 'row', gap: sp.sm }}>
          <Skeleton width={60} height={16} />
          <Skeleton width={60} height={16} />
        </View>
        <Skeleton width="100%" height={80} radius={12} />
        <Skeleton width="100%" height={52} radius={999} />
      </View>
    </View>
  );
}

// ── Related design card ───────────────────────────────────────────────────────

const RelatedCard = React.memo(function RelatedCard({ design }: { design: Design }): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();
  const router = useRouter();

  const handlePress = useCallback(
    () => router.push(`/designs/${design.slug}` as never),
    [router, design.slug],
  );

  return (
    <Pressable
      onPress={handlePress}
      style={[
        {
          width: RELATED_CARD_W,
          backgroundColor: colors.elevated,
          borderRadius: r.md,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: 'hidden',
        },
        elev.low,
      ]}
    >
      <View style={{ width: RELATED_CARD_W, height: RELATED_CARD_H, backgroundColor: colors.panel }}>
        {design.imageUrl != null ? (
          <Image source={{ uri: design.imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : null}
      </View>
      <View style={{ padding: sp.sm }}>
        <Text
          numberOfLines={1}
          style={{ ...typo.scale.label, fontFamily: typo.fonts.sansMed, color: colors.accentMid }}
        >
          {design.occasion[0]?.toUpperCase() ?? ''}
        </Text>
        <Text
          numberOfLines={2}
          style={{ ...typo.scale.caption, fontFamily: typo.fonts.serifBold, color: colors.textHigh, marginTop: 2 }}
        >
          {design.title}
        </Text>
      </View>
    </Pressable>
  );
});

// ── Main screen ───────────────────────────────────────────────────────────────

export default function DesignDetailScreen(): React.JSX.Element {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { colors, sp, r, typo, elev } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { data: design, isLoading, isError, refetch } = useGetDesignBySlugQuery(slug ?? '');

  const { data: relatedData } = useGetDesignsQuery(
    { occasion: design?.occasion[0], limit: 7 },
    { skip: !design },
  );
  const related = relatedData?.designs.filter(d => d.slug !== slug).slice(0, 6) ?? [];

  const [wishlisted, setWishlisted] = useState(false);

  const handleBack = useCallback(() => router.back(), [router]);
  const handleWishlist = useCallback(() => setWishlisted(prev => !prev), []);
  const handleBrowseFabrics = useCallback(() => router.push('/(tabs)/shop' as never), [router]);
  const handleStartOrder = useCallback(() => {
    if (!design) return;
    router.push(`/orders/new?designId=${design._id}` as never);
  }, [design, router]);

  const renderRelatedItem = useCallback<ListRenderItem<Design>>(
    ({ item }) => <RelatedCard design={item} />,
    [],
  );

  // ── Loading ───────────────────────────────────────────────────────────────

  if (isLoading) {
    return <DesignSkeleton />;
  }

  // ── Error ─────────────────────────────────────────────────────────────────

  if (isError || !design) {
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
            message={isError ? "Couldn't load this design. Check your connection." : 'Design not found.'}
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

  // ── Styles ────────────────────────────────────────────────────────────────

  const s = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg },
    scrollContent: { paddingBottom: insets.bottom + sp['4xl'] },

    // Header overlay on image
    headerOverlay: {
      position: 'absolute',
      top: insets.top + sp.sm,
      left: sp.base,
      right: sp.base,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    overlayBtn: {
      width: 40,
      height: 40,
      borderRadius: r.pill,
      backgroundColor: 'rgba(0,0,0,0.40)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerRight: { flexDirection: 'row', gap: sp.sm },

    // Hero image
    heroImage: {
      width: SW,
      aspectRatio: 1 / 0.85,
      backgroundColor: colors.panel,
    },

    // Body
    body: { padding: sp.base },

    // Occasion pills
    pillsRow: { flexDirection: 'row', gap: sp.xs, flexWrap: 'wrap', marginBottom: sp.sm },
    pill: {
      backgroundColor: colors.accentSubtle,
      borderRadius: r.pill,
      paddingHorizontal: sp.md,
      paddingVertical: 4,
    },
    pillText: { ...typo.scale.caption, fontFamily: typo.fonts.sansMed, color: colors.accent },

    // Title
    titleText: { ...typo.scale.title2, fontFamily: typo.fonts.serifBold, color: colors.textHigh, marginBottom: sp.xs },

    // Meta row
    metaRow: { flexDirection: 'row', gap: sp.sm, marginBottom: sp.base },
    metaText: { ...typo.scale.caption, fontFamily: typo.fonts.sans, color: colors.textLow },

    // Description
    descText: { ...typo.scale.body, fontFamily: typo.fonts.sans, color: colors.textMid, lineHeight: 24, marginBottom: sp.base },

    // Divider
    divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: sp.lg },

    // CTA card
    ctaCard: {
      backgroundColor: colors.elevated,
      borderRadius: r.lg,
      padding: sp.lg,
      ...elev.low,
    },
    ctaHeading: { ...typo.scale.title3, fontFamily: typo.fonts.serifBold, color: colors.textHigh, marginBottom: sp.sm },
    ctaSubtext: { ...typo.scale.body, fontFamily: typo.fonts.sans, color: colors.textMid, marginBottom: sp.lg, lineHeight: 22 },
    primaryBtn: {
      backgroundColor: colors.accent,
      borderRadius: r.pill,
      height: 52,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryBtnText: { ...typo.scale.body, fontFamily: typo.fonts.sansBold, color: colors.textOnAccent },
    secondaryBtn: {
      borderWidth: 1.5,
      borderColor: colors.accent,
      borderRadius: r.pill,
      height: 52,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: sp.sm,
    },
    secondaryBtnText: { ...typo.scale.body, fontFamily: typo.fonts.sansBold, color: colors.accent },

    // You might also like
    sectionLabel: { ...typo.scale.label, fontFamily: typo.fonts.sansMed, color: colors.textLow, marginBottom: sp.xs },
    sectionTitle: { ...typo.scale.subtitle, fontFamily: typo.fonts.serifBold, color: colors.textHigh, marginBottom: sp.md },
    relatedList: { marginTop: sp.md },
  });

  const imageH = Math.round(SW * 0.85);

  return (
    <View style={s.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {/* Hero image with header overlay */}
        <View style={{ width: SW, height: imageH, backgroundColor: colors.panel }}>
          {design.imageUrl != null ? (
            <Image source={{ uri: design.imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : null}

          <View style={s.headerOverlay} pointerEvents="box-none">
            <Pressable onPress={handleBack} style={s.overlayBtn}>
              <IconSymbol name="chevron.left" size={20} color={colors.textOnAccent} />
            </Pressable>
            <View style={s.headerRight}>
              <Pressable style={s.overlayBtn}>
                <IconSymbol name="square.and.arrow.up" size={18} color={colors.textOnAccent} />
              </Pressable>
              <Pressable onPress={handleWishlist} style={s.overlayBtn}>
                <IconSymbol
                  name={wishlisted ? 'heart.fill' : 'heart'}
                  size={20}
                  color={wishlisted ? colors.error : colors.textOnAccent}
                />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Body */}
        <View style={s.body}>
          {/* Occasion pills */}
          {design.occasion.length > 0 && (
            <View style={s.pillsRow}>
              {design.occasion.map(occ => (
                <View key={occ} style={s.pill}>
                  <Text style={s.pillText}>{occ}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Title */}
          <Text style={s.titleText}>{design.title}</Text>

          {/* Gender + Category */}
          <View style={s.metaRow}>
            <Text style={s.metaText}>{design.gender.toUpperCase()}</Text>
            {design.category.length > 0 && (
              <>
                <Text style={s.metaText}>·</Text>
                <Text style={s.metaText}>{design.category.replace(/-/g, ' ').toUpperCase()}</Text>
              </>
            )}
          </View>

          {/* Description */}
          {design.description != null && design.description.length > 0 && (
            <Text style={s.descText}>{design.description}</Text>
          )}

          <View style={s.divider} />

          {/* "Make This Outfit" CTA card */}
          <View style={s.ctaCard}>
            <Text style={s.ctaHeading}>Want this design made?</Text>
            <Text style={s.ctaSubtext}>
              Browse fabrics and book a tailor to bring this to life.
            </Text>
            <Pressable onPress={handleBrowseFabrics} style={s.secondaryBtn}>
              <Text style={s.secondaryBtnText}>Browse Fabrics</Text>
            </Pressable>
            <Pressable onPress={handleStartOrder} style={s.primaryBtn}>
              <Text style={s.primaryBtnText}>Start Order</Text>
            </Pressable>
          </View>

          {/* You Might Also Like */}
          {related.length > 0 && (
            <View style={{ marginTop: sp['2xl'] }}>
              <Text style={s.sectionLabel}>YOU MIGHT ALSO LIKE</Text>
              <Text style={s.sectionTitle}>Similar Designs</Text>
              <FlatList
                data={related}
                horizontal
                keyExtractor={item => item._id}
                renderItem={renderRelatedItem}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: sp.md }}
                style={s.relatedList}
              />
            </View>
          )}

          {/* Fallback placeholder row when no related loaded yet */}
          {related.length === 0 && !design.occasion.length && (
            <View style={{ marginTop: sp['2xl'] }}>
              <Text style={s.sectionLabel}>YOU MIGHT ALSO LIKE</Text>
              <Text style={s.sectionTitle}>Similar Designs</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: sp.md, marginTop: sp.sm }}
              >
                {[0, 1, 2].map(i => (
                  <View
                    key={i}
                    style={{
                      width: RELATED_CARD_W,
                      height: RELATED_CARD_H,
                      backgroundColor: colors.panel,
                      borderRadius: r.md,
                    }}
                  />
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
