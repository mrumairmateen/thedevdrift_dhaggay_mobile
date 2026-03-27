import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { Design } from '@features/designs/designs.types';
import { useGetDesignsQuery } from '@services/designsApi';
import { useTheme } from '@shared/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const H_PAD = 16;
const GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - H_PAD * 2 - GAP) / 2;
const IMAGE_HEIGHT = Math.round(CARD_WIDTH * 1.3);

function SkeletonDesignCard() {
  const { colors, r, sp } = useTheme();
  return (
    <View style={{ width: CARD_WIDTH, borderRadius: r.md, overflow: 'hidden', backgroundColor: colors.panel }}>
      <View style={{ height: IMAGE_HEIGHT, backgroundColor: colors.panel }} />
      <View style={{ padding: sp.sm, gap: sp.xs }}>
        <View style={{ height: 9, width: '35%', backgroundColor: colors.border, borderRadius: r.sharp }} />
        <View style={{ height: 14, width: '85%', backgroundColor: colors.border, borderRadius: r.sharp }} />
      </View>
    </View>
  );
}

function DesignCard({ design }: { design: Design }) {
  const { colors, sp, r, typo, elev } = useTheme();
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/designs/${design.slug}` as any)}
      style={[styles.card, elev.low, { width: CARD_WIDTH, backgroundColor: colors.elevated, borderColor: colors.border, borderRadius: r.md }]}
    >
      <View style={[styles.imageArea, { height: IMAGE_HEIGHT, backgroundColor: colors.panel, borderTopLeftRadius: r.md, borderTopRightRadius: r.md }]}>
        {design.images[0]?.url ? (
          <Image
            source={{ uri: design.images[0].url }}
            style={[StyleSheet.absoluteFill, { borderTopLeftRadius: r.md, borderTopRightRadius: r.md }]}
            contentFit="cover"
          />
        ) : null}
        {design.isTrending && (
          <View style={[styles.trendingBadge, { backgroundColor: colors.warning, borderRadius: r.sharp, paddingHorizontal: sp.sm, paddingVertical: 3 }]}>
            <Text style={[typo.scale.label, { fontFamily: typo.fonts.sansBold, color: '#fff', fontSize: 9 }]}>TRENDING</Text>
          </View>
        )}
        <View style={styles.imageGradient} />
      </View>

      <View style={[styles.info, { padding: sp.sm }]}>
        <Text style={[typo.scale.label, { fontFamily: typo.fonts.sansMed, color: colors.accentMid, marginBottom: 2 }]}>
          {(design.occasion[0] ?? '').toUpperCase()}
        </Text>
        <Text style={[typo.scale.bodySmall, { fontFamily: typo.fonts.serifBold, color: colors.textHigh }]} numberOfLines={2}>
          {design.title}
        </Text>
      </View>
    </Pressable>
  );
}

export function TrendingDesigns() {
  const { sp, colors, typo } = useTheme();
  const { data, isLoading, isError } = useGetDesignsQuery({ sort: 'trending', limit: 6 });
  const designs = data?.designs ?? [];

  if (isLoading) {
    return (
      <View style={[styles.grid, { paddingHorizontal: H_PAD, gap: GAP }]}>
        {[0, 1, 2, 3].map(i => <SkeletonDesignCard key={i} />)}
      </View>
    );
  }

  if (isError || designs.length === 0) {
    return (
      <View style={{ paddingHorizontal: sp.base, paddingVertical: sp.xl, alignItems: 'center' }}>
        <Text style={[typo.scale.bodySmall, { color: colors.textLow, fontFamily: typo.fonts.sans }]}>
          {isError ? 'Could not load designs.' : 'No designs available.'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[{ paddingHorizontal: H_PAD, gap: GAP, flexDirection: 'row', alignItems: 'flex-start' }]}
    >
      {designs.map(design => <DesignCard key={design._id} design={design} />)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 12 },
  card: { borderWidth: 1, overflow: 'hidden' },
  imageArea: { overflow: 'hidden' },
  imageGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, backgroundColor: 'rgba(0,0,0,0.2)' },
  trendingBadge: { position: 'absolute', top: 8, left: 8 },
  info: {},
});
