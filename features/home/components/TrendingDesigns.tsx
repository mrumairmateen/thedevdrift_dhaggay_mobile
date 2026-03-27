import React, { useCallback } from 'react';
import { ActivityIndicator, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';

import { useTheme } from '@shared/theme';
import type { Design } from '@features/designs/designs.types';
import { useGetDesignsQuery } from '@services/designsApi';

export interface TrendingDesignsProps {}

const QUERY_PARAMS = { sort: 'trending', limit: 6 } as const;

const SCREEN_WIDTH = Dimensions.get('window').width;

interface DesignCardProps {
  design: Design;
  cardWidth: number;
  onPress: (slug: string) => void;
}

const DesignCard = React.memo(function DesignCard({
  design,
  cardWidth,
  onPress,
}: DesignCardProps): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();
  const imageUrl = design.images[0]?.url;

  const styles = StyleSheet.create({
    card: {
      width: cardWidth,
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      ...elev.low,
    },
    imageArea: {
      aspectRatio: 0.85,
      backgroundColor: colors.panel,
      borderRadius: r.md,
    },
    body: {
      padding: sp.sm,
    },
    badge: {
      alignSelf: 'flex-start',
      backgroundColor: colors.accentSubtle,
      borderRadius: r.pill,
      paddingHorizontal: sp.xs,
      paddingVertical: 2,
    },
    badgeText: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansMed,
      color: colors.accent,
    },
    title: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.serifBold,
      color: colors.textHigh,
      marginTop: sp.xs,
    },
  });

  const handlePress = useCallback(() => {
    onPress(design.slug);
  }, [onPress, design.slug]);

  const occasion = design.occasion[0] ?? '';
  const occasionLabel = occasion.charAt(0).toUpperCase() + occasion.slice(1);

  return (
    <Pressable style={styles.card} onPress={handlePress}>
      <View style={styles.imageArea}>
        {imageUrl !== undefined && (
          <Image
            source={{ uri: imageUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
        )}
      </View>
      <View style={styles.body}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{occasionLabel}</Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {design.title}
        </Text>
      </View>
    </Pressable>
  );
});

export const TrendingDesigns = React.memo(function TrendingDesigns(
  _props: TrendingDesignsProps,
): React.JSX.Element {
  const { sp, colors } = useTheme();
  const router = useRouter();
  const { data, isLoading, isError } = useGetDesignsQuery(QUERY_PARAMS);

  const cardWidth = (SCREEN_WIDTH - sp.base * 2 - sp.sm) / 2;

  const styles = StyleSheet.create({
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: sp.base,
      gap: sp.sm,
    },
  });

  const handlePress = useCallback(
    (slug: string) => {
      router.push(`/designs/${slug}` as Parameters<typeof router.push>[0]);
    },
    [router],
  );

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

  const designs = data?.designs ?? [];

  return (
    <View style={styles.grid}>
      {designs.map(design => (
        <DesignCard
          key={design._id}
          design={design}
          cardWidth={cardWidth}
          onPress={handlePress}
        />
      ))}
    </View>
  );
});
