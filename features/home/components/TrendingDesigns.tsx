import { DESIGNS } from '@features/home/home.fixtures';
import type { Design } from '@features/designs/designs.types';
import { useTheme } from '@shared/theme';
import { useRouter } from 'expo-router';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const H_PAD = 16;
const GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - H_PAD * 2 - GAP) / 2;
const IMAGE_HEIGHT = Math.round(CARD_WIDTH * 1.3);

function DesignCard({ design }: { design: Design }) {
  const { colors, sp, r, typo, elev } = useTheme();
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/designs/${design.slug}` as any)}
      style={[
        styles.card,
        elev.low,
        {
          width: CARD_WIDTH,
          backgroundColor: colors.elevated,
          borderColor: colors.border,
          borderRadius: r.md,
        },
      ]}
    >
      {/* Image placeholder */}
      <View
        style={[
          styles.imageArea,
          {
            height: IMAGE_HEIGHT,
            backgroundColor: design.imageColor,
            borderTopLeftRadius: r.md,
            borderTopRightRadius: r.md,
          },
        ]}
      >
        {/* Trending badge */}
        {design.isTrending && (
          <View
            style={[
              styles.trendingBadge,
              {
                backgroundColor: '#F59E0B',
                borderRadius: r.sharp,
                paddingHorizontal: sp.sm,
                paddingVertical: 3,
              },
            ]}
          >
            <Text
              style={[
                typo.scale.label,
                { fontFamily: typo.fonts.sansBold, color: '#fff', fontSize: 9 },
              ]}
            >
              TRENDING
            </Text>
          </View>
        )}

        {/* Gradient-like overlay at bottom */}
        <View style={styles.imageGradient} />
      </View>

      {/* Info */}
      <View style={[styles.info, { padding: sp.sm }]}>
        <Text
          style={[
            typo.scale.label,
            { fontFamily: typo.fonts.sansMed, color: colors.accentMid, marginBottom: 2 },
          ]}
        >
          {(design.occasion[0] ?? '').toUpperCase()}
        </Text>
        <Text
          style={[
            typo.scale.bodySmall,
            { fontFamily: typo.fonts.serifBold, color: colors.textHigh },
          ]}
          numberOfLines={2}
        >
          {design.title}
        </Text>
      </View>
    </Pressable>
  );
}

export function TrendingDesigns() {
  const { sp } = useTheme();

  return (
    <View style={[styles.grid, { paddingHorizontal: H_PAD, gap: GAP }]}>
      {DESIGNS.map((design) => (
        <DesignCard key={design._id} design={design} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 12,
  },
  card: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  imageArea: {
    overflow: 'hidden',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  trendingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  info: {},
});
