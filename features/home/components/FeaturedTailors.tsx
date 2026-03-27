import React, { useCallback } from 'react';
import { FlatList, ListRenderItem, StyleSheet, Text, View } from 'react-native';
import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';

import { useTheme } from '@shared/theme';
import { formatPkr } from '@shared/utils';

export interface FeaturedTailorsProps {}

type TailorTier = 'Master' | 'Premium' | 'Standard';

interface TailorFixture {
  _id: string;
  slug: string;
  name: string;
  city: string;
  tier: TailorTier;
  rating: number;
  reviewCount: number;
  completedOrders: number;
  startingPrice: number;
  isAvailable: boolean;
}

const TAILOR_FIXTURES: TailorFixture[] = [
  { _id: '1', slug: 'ustad-ibrahim', name: 'Ustad Ibrahim', city: 'Lahore',    tier: 'Master',   rating: 4.9, reviewCount: 312, completedOrders: 847, startingPrice: 2500, isAvailable: true  },
  { _id: '2', slug: 'nazim-bhai',    name: 'Nazim Bhai',    city: 'Karachi',   tier: 'Premium',  rating: 4.8, reviewCount: 198, completedOrders: 423, startingPrice: 1800, isAvailable: true  },
  { _id: '3', slug: 'ahmed-tailor',  name: 'Ahmed Master',  city: 'Islamabad', tier: 'Master',   rating: 4.9, reviewCount: 276, completedOrders: 612, startingPrice: 3000, isAvailable: false },
];

function getInitials(name: string): string {
  const parts = name.split(' ');
  const first = parts[0];
  const second = parts[1];
  const a = first !== undefined ? (first[0] ?? '') : '';
  const b = second !== undefined ? (second[0] ?? '') : '';
  return (a + b).toUpperCase() || '?';
}

interface TailorCardProps {
  tailor: TailorFixture;
  onPress: (slug: string) => void;
}

const TailorCard = React.memo(function TailorCard({
  tailor,
  onPress,
}: TailorCardProps): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();

  const tierBg =
    tailor.tier === 'Master'
      ? colors.accent
      : tailor.tier === 'Premium'
      ? colors.info
      : colors.border;

  const tierTextColor =
    tailor.tier === 'Standard' ? colors.textMid : colors.textOnAccent;

  const styles = StyleSheet.create({
    card: {
      width: 200,
      backgroundColor: colors.elevated,
      borderRadius: r.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: sp.md,
      ...elev.low,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: sp.sm,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: r.pill,
      backgroundColor: colors.accentSubtle,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.accent,
    },
    nameBlock: {
      flex: 1,
    },
    name: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.serifBold,
      color: colors.textHigh,
      marginTop: sp.sm,
    },
    city: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
    },
    tierBadge: {
      alignSelf: 'flex-start',
      backgroundColor: tierBg,
      borderRadius: r.pill,
      paddingHorizontal: sp.xs,
      paddingVertical: 2,
      marginTop: sp.xs,
    },
    tierText: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansMed,
      color: tierTextColor,
    },
    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: sp.xs,
    },
    ratingText: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
    },
    starText: {
      ...typo.scale.caption,
      color: colors.warning,
    },
    priceText: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.textHigh,
      marginTop: sp.xs,
    },
    availRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: sp.xs,
      marginTop: sp.xs,
    },
    availDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    availText: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
    },
  });

  const handlePress = useCallback(() => {
    onPress(tailor.slug);
  }, [onPress, tailor.slug]);

  const initials = getInitials(tailor.name);
  const availColor = tailor.isAvailable ? colors.success : colors.error;
  const availLabel = tailor.isAvailable ? 'Available' : 'Unavailable';

  return (
    <Pressable style={styles.card} onPress={handlePress}>
      <View style={styles.topRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
      </View>
      <Text style={styles.name}>{tailor.name}</Text>
      <Text style={styles.city}>{tailor.city}</Text>
      <View style={styles.tierBadge}>
        <Text style={styles.tierText}>{tailor.tier}</Text>
      </View>
      <View style={styles.ratingRow}>
        <Text style={styles.starText}>{'★'}</Text>
        <Text style={styles.ratingText}>
          {` ${tailor.rating.toFixed(1)} · ${tailor.reviewCount} reviews`}
        </Text>
      </View>
      <Text style={styles.priceText}>{`From ${formatPkr(tailor.startingPrice)}`}</Text>
      <View style={styles.availRow}>
        <View style={[styles.availDot, { backgroundColor: availColor }]} />
        <Text style={[styles.availText, { color: availColor }]}>{availLabel}</Text>
      </View>
    </Pressable>
  );
});

export const FeaturedTailors = React.memo(function FeaturedTailors(
  _props: FeaturedTailorsProps,
): React.JSX.Element {
  const { sp } = useTheme();
  const router = useRouter();

  const styles = StyleSheet.create({
    contentContainer: {
      paddingHorizontal: sp.base,
      gap: sp.md,
    },
  });

  const handlePress = useCallback(
    (slug: string) => {
      router.push(`/tailors/${slug}` as Parameters<typeof router.push>[0]);
    },
    [router],
  );

  const renderItem = useCallback<ListRenderItem<TailorFixture>>(
    ({ item }) => <TailorCard tailor={item} onPress={handlePress} />,
    [handlePress],
  );

  const keyExtractor = useCallback((item: TailorFixture) => item._id, []);

  return (
    <FlatList
      data={TAILOR_FIXTURES}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
      removeClippedSubviews={true}
    />
  );
});
