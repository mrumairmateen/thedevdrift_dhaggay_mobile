import React, { useCallback } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useTheme } from '@shared/theme';

export interface TrendingDesignsProps {}

interface DesignFixture {
  _id: string;
  slug: string;
  title: string;
  occasion: string;
  imageUrl: string | null;
}

const DESIGN_FIXTURES: DesignFixture[] = [
  { _id: '1', slug: 'anarkali-formal',   title: 'Anarkali Formal',         occasion: 'formal',  imageUrl: null },
  { _id: '2', slug: 'bridal-lehenga',    title: 'Bridal Lehenga',          occasion: 'bridal',  imageUrl: null },
  { _id: '3', slug: 'eid-kurta',         title: 'Eid Kurta',               occasion: 'eid',     imageUrl: null },
  { _id: '4', slug: 'casual-shalwar',    title: 'Casual Shalwar Kameez',   occasion: 'casual',  imageUrl: null },
  { _id: '5', slug: 'office-khaddar',    title: 'Office Khaddar',          occasion: 'office',  imageUrl: null },
  { _id: '6', slug: 'party-chiffon',     title: 'Party Chiffon',           occasion: 'party',   imageUrl: null },
];

const SCREEN_WIDTH = Dimensions.get('window').width;

interface DesignCardProps {
  design: DesignFixture;
  cardWidth: number;
  onPress: (slug: string) => void;
}

const DesignCard = React.memo(function DesignCard({
  design,
  cardWidth,
  onPress,
}: DesignCardProps): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();

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

  const occasionLabel =
    design.occasion.charAt(0).toUpperCase() + design.occasion.slice(1);

  return (
    <Pressable style={styles.card} onPress={handlePress}>
      <View style={styles.imageArea} />
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
  const { sp } = useTheme();
  const router = useRouter();

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

  return (
    <View style={styles.grid}>
      {DESIGN_FIXTURES.map(design => (
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
