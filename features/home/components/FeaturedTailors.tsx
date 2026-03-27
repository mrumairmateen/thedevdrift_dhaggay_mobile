import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, ListRenderItem, StyleSheet, Text, View } from 'react-native';
import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';

import { useTheme } from '@shared/theme';
import { formatPkr } from '@shared/utils';
import type { Tailor } from '@features/tailors/tailors.types';
import { useGetTailorsQuery } from '@services/tailorsApi';

export interface FeaturedTailorsProps {}

const QUERY_PARAMS = { sort: 'rating', limit: 5 } as const;

function getInitials(name: string): string {
  const parts = name.split(' ');
  const first = parts[0];
  const second = parts[1];
  const a = first !== undefined ? (first[0] ?? '') : '';
  const b = second !== undefined ? (second[0] ?? '') : '';
  return (a + b).toUpperCase() || '?';
}

interface TailorCardProps {
  tailor: Tailor;
  onPress: (slug: string) => void;
}

const TailorCard = React.memo(function TailorCard({
  tailor,
  onPress,
}: TailorCardProps): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();

  const name =
    typeof tailor.userId === 'object' && tailor.userId !== null
      ? tailor.userId.name
      : 'Unknown';
  const city = tailor.serviceAreas[0]?.city ?? '';
  const startingPrice = tailor.categoryPricing?.[0]?.price ?? 0;

  const tierBg =
    tailor.tier === 'master'
      ? colors.accent
      : tailor.tier === 'premium'
      ? colors.info
      : colors.border;

  const tierTextColor =
    tailor.tier === 'standard' ? colors.textMid : colors.textOnAccent;

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
    onPress(tailor.slug ?? tailor._id);
  }, [onPress, tailor.slug, tailor._id]);

  const initials = getInitials(name);
  const availColor = tailor.isAvailable ? colors.success : colors.error;
  const availLabel = tailor.isAvailable ? 'Available' : 'Unavailable';

  return (
    <Pressable style={styles.card} onPress={handlePress}>
      <View style={styles.topRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
      </View>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.city}>{city}</Text>
      <View style={styles.tierBadge}>
        <Text style={styles.tierText}>{tailor.tier}</Text>
      </View>
      <View style={styles.ratingRow}>
        <Text style={styles.starText}>{'★'}</Text>
        <Text style={styles.ratingText}>
          {` ${tailor.rating.toFixed(1)} · ${tailor.reviewCount} reviews`}
        </Text>
      </View>
      {startingPrice > 0 && (
        <Text style={styles.priceText}>{`From ${formatPkr(startingPrice)}`}</Text>
      )}
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
  const { sp, colors } = useTheme();
  const router = useRouter();
  const { data, isLoading, isError } = useGetTailorsQuery(QUERY_PARAMS);

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

  const renderItem = useCallback<ListRenderItem<Tailor>>(
    ({ item }) => <TailorCard tailor={item} onPress={handlePress} />,
    [handlePress],
  );

  const keyExtractor = useCallback((item: Tailor) => item._id, []);

  if (isLoading) {
    return (
      <View style={{ paddingHorizontal: sp.base }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (isError) {
    return <View />;
  }

  const tailors = data?.tailors ?? [];

  return (
    <FlatList
      data={tailors}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
      removeClippedSubviews={true}
    />
  );
});
