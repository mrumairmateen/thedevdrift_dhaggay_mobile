import { IconSymbol } from '@/components/ui/icon-symbol';
import { DESIGN_FIXTURES } from '@features/designs/designs.fixtures';
import type { Design } from '@features/designs/designs.types';
import { useTheme } from '@shared/theme';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_GAP = 12;
const H_PAD = 16;
const CARD_WIDTH = (SCREEN_WIDTH - H_PAD * 2 - CARD_GAP) / 2;
const IMAGE_HEIGHT = Math.round(CARD_WIDTH * 1.35);

const OCCASIONS = ['All', 'Casual', 'Formal', 'Bridal', 'Eid', 'Party'];
const SORT_OPTIONS: Array<{ label: string; value: 'trending' | 'newest' | 'most_used' }> = [
  { label: 'Trending', value: 'trending' },
  { label: 'Newest', value: 'newest' },
  { label: 'Most Used', value: 'most_used' },
];

function SkeletonDesignCard({ width }: { width: number }) {
  const { colors, r, sp } = useTheme();
  return (
    <View style={{ width, borderRadius: r.md, overflow: 'hidden', backgroundColor: colors.panel }}>
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
      style={[styles.card, elev.low, {
        width: CARD_WIDTH,
        backgroundColor: colors.elevated,
        borderColor: colors.border,
        borderRadius: r.md,
      }]}
    >
      <View style={[styles.imageArea, {
        height: IMAGE_HEIGHT,
        backgroundColor: design.imageColor,
        borderTopLeftRadius: r.md,
        borderTopRightRadius: r.md,
      }]}>
        {design.isTrending && (
          <View style={[styles.trendingBadge, {
            backgroundColor: colors.warning,
            borderRadius: r.sharp,
            paddingHorizontal: sp.sm,
            paddingVertical: 3,
          }]}>
            <Text style={[typo.scale.label, { fontFamily: typo.fonts.sansBold, color: '#fff', fontSize: 9 }]}>
              TRENDING
            </Text>
          </View>
        )}
        <View style={styles.imageOverlay} />
      </View>

      <View style={[styles.cardInfo, { padding: sp.sm }]}>
        <Text style={[typo.scale.label, { fontFamily: typo.fonts.sansMed, color: colors.accentMid, marginBottom: 2 }]}>
          {design.occasion[0]?.toUpperCase() ?? ''}
        </Text>
        <Text
          style={[typo.scale.bodySmall, { fontFamily: typo.fonts.serifBold, color: colors.textHigh }]}
          numberOfLines={2}
        >
          {design.title}
        </Text>
      </View>
    </Pressable>
  );
}

export default function DesignsScreen() {
  const { colors, sp, r, typo, elev } = useTheme();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [occasion, setOccasion] = useState('All');
  const [sort, setSort] = useState<'trending' | 'newest' | 'most_used'>('trending');

  const filtered = useMemo(() => {
    let data = DESIGN_FIXTURES;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter(d => d.title.toLowerCase().includes(q) || d.garmentCategorySlug.includes(q));
    }
    if (occasion !== 'All') {
      data = data.filter(d => d.occasion.includes(occasion));
    }
    if (sort === 'trending') data = [...data].sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0));
    return data;
  }, [search, occasion, sort]);

  const renderItem = useCallback(
    ({ item, index }: { item: Design; index: number }) => (
      <View style={{ marginLeft: index % 2 === 1 ? CARD_GAP : 0 }}>
        <DesignCard design={item} />
      </View>
    ),
    [],
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, elev.high, {
        backgroundColor: colors.navSolid,
        paddingTop: insets.top + sp.sm,
        paddingHorizontal: sp.base,
        paddingBottom: sp.md,
        borderBottomColor: colors.border,
      }]}>
        <Text style={[typo.scale.title2, { fontFamily: typo.fonts.serifBold, color: colors.textHigh, marginBottom: sp.md }]}>
          Designs
        </Text>

        {/* Search */}
        <View style={[styles.searchBar, {
          backgroundColor: colors.inputBg,
          borderRadius: r.sm,
          borderColor: colors.border,
          paddingHorizontal: sp.md,
        }]}>
          <IconSymbol name="magnifyingglass" size={16} color={colors.textLow} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search designs…"
            placeholderTextColor={colors.textLow}
            style={[styles.searchInput, typo.scale.body, { fontFamily: typo.fonts.sans, color: colors.textHigh }]}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <IconSymbol name="xmark" size={14} color={colors.textLow} />
            </Pressable>
          )}
        </View>

        {/* Sort pills */}
        <View style={[styles.sortRow, { marginTop: sp.sm }]}>
          <IconSymbol name="arrow.up.arrow.down" size={14} color={colors.textMid} />
          <View style={styles.sortPills}>
            {SORT_OPTIONS.map(opt => {
              const active = opt.value === sort;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => setSort(opt.value)}
                  style={[styles.sortPill, {
                    backgroundColor: active ? colors.accentSubtle : 'transparent',
                    borderRadius: r.pill,
                    borderColor: active ? colors.accent : colors.border,
                    paddingHorizontal: sp.sm,
                    paddingVertical: 4,
                  }]}
                >
                  <Text style={[typo.scale.label, {
                    fontFamily: typo.fonts.sansMed,
                    color: active ? colors.accent : colors.textMid,
                  }]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {/* Occasion filter pills */}
      <View style={[styles.pillsRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: sp.base, gap: sp.sm }}>
          {OCCASIONS.map(occ => {
            const active = occ === occasion;
            return (
              <Pressable
                key={occ}
                onPress={() => setOccasion(occ)}
                style={[styles.occasionPill, {
                  backgroundColor: active ? colors.accentSubtle : colors.chipBg,
                  borderRadius: r.pill,
                  borderColor: active ? colors.accent : 'transparent',
                  paddingHorizontal: sp.md,
                  paddingVertical: sp.xs,
                }]}
              >
                <Text style={[typo.scale.label, {
                  fontFamily: typo.fonts.sansMed,
                  color: active ? colors.accent : colors.textMid,
                }]}>
                  {occ}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Results count */}
      <View style={[styles.resultsBar, { paddingHorizontal: sp.base, paddingVertical: sp.sm }]}>
        <Text style={[typo.scale.caption, { color: colors.textMid, fontFamily: typo.fonts.sans }]}>
          {filtered.length} {filtered.length === 1 ? 'design' : 'designs'} found
        </Text>
      </View>

      {/* Grid */}
      <FlatList
        data={filtered}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={[styles.listContent, {
          paddingHorizontal: H_PAD,
          paddingTop: sp.md,
          paddingBottom: insets.bottom + sp['4xl'],
        }]}
        columnWrapperStyle={{ marginBottom: CARD_GAP }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <IconSymbol name="magnifyingglass" size={40} color={colors.textLow} />
            <Text style={[typo.scale.body, { color: colors.textMid, fontFamily: typo.fonts.sans, marginTop: sp.md, textAlign: 'center' }]}>
              No designs found.{'\n'}Try a different filter.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { borderBottomWidth: 1 },
  searchBar: { flexDirection: 'row', alignItems: 'center', height: 42, borderWidth: 1, gap: 8 },
  searchInput: { flex: 1, padding: 0 },
  sortRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sortPills: { flexDirection: 'row', gap: 6 },
  sortPill: { borderWidth: 1 },
  pillsRow: { paddingVertical: 10, borderBottomWidth: 1 },
  occasionPill: { borderWidth: 1 },
  resultsBar: { flexDirection: 'row', alignItems: 'center' },
  listContent: {},
  card: { borderWidth: 1, overflow: 'hidden' },
  imageArea: { overflow: 'hidden' },
  imageOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, backgroundColor: 'rgba(0,0,0,0.15)' },
  trendingBadge: { position: 'absolute', top: 8, left: 8 },
  cardInfo: {},
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
});
