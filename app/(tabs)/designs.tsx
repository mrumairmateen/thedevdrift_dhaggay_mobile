import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@shared/components/ui/icon-symbol';
import type { Design, DesignSort } from '@features/designs/designs.types';
import { useGetDesignsQuery } from '@services/designsApi';
import { useTheme } from '@shared/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_GAP = 12;
const H_PAD = 16;
const CARD_WIDTH = (SCREEN_WIDTH - H_PAD * 2 - CARD_GAP) / 2;
const IMAGE_HEIGHT = Math.round(CARD_WIDTH * 1.35);

const OCCASIONS = ['All', 'Casual', 'Formal', 'Bridal', 'Eid', 'Party'];
const SORT_OPTIONS: Array<{ label: string; value: DesignSort }> = [
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
  const imageUrl = design.images[0]?.url;

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
        backgroundColor: colors.panel,
        borderTopLeftRadius: r.md,
        borderTopRightRadius: r.md,
      }]}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={[StyleSheet.absoluteFill, { borderTopLeftRadius: r.md, borderTopRightRadius: r.md }]}
            contentFit="cover"
          />
        ) : null}
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
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const [occasion, setOccasion] = useState('All');
  const [sort, setSort] = useState<DesignSort>('trending');
  const [page, setPage] = useState(1);

  const handleSearchChange = useCallback((text: string) => {
    setSearch(text);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setDebouncedSearch(text); setPage(1); }, 350);
  }, []);

  const query = useMemo(() => ({
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(occasion !== 'All' ? { occasion } : {}),
    sort,
    page,
    limit: 20,
  }), [debouncedSearch, occasion, sort, page]);

  const { data, isLoading, isFetching, isError, refetch } = useGetDesignsQuery(query);

  const designs = data?.designs ?? [];
  const totalPages = data?.pages ?? 1;

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
            onChangeText={handleSearchChange}
            placeholder="Search designs…"
            placeholderTextColor={colors.textLow}
            style={[styles.searchInput, typo.scale.body, { fontFamily: typo.fonts.sans, color: colors.textHigh }]}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable onPress={() => { setSearch(''); setDebouncedSearch(''); }}>
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
                  onPress={() => { setSort(opt.value); setPage(1); }}
                  style={[styles.sortPill, {
                    backgroundColor: active ? colors.accentSubtle : 'transparent',
                    borderRadius: r.pill,
                    borderColor: active ? colors.accent : colors.border,
                    paddingHorizontal: sp.sm,
                    paddingVertical: 4,
                  }]}
                >
                  <Text style={[typo.scale.label, { fontFamily: typo.fonts.sansMed, color: active ? colors.accent : colors.textMid }]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {isFetching && !isLoading && <ActivityIndicator size="small" color={colors.accent} />}
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
                onPress={() => { setOccasion(occ); setPage(1); }}
                style={[styles.occasionPill, {
                  backgroundColor: active ? colors.accentSubtle : colors.chipBg,
                  borderRadius: r.pill,
                  borderColor: active ? colors.accent : 'transparent',
                  paddingHorizontal: sp.md,
                  paddingVertical: sp.xs,
                }]}
              >
                <Text style={[typo.scale.label, { fontFamily: typo.fonts.sansMed, color: active ? colors.accent : colors.textMid }]}>
                  {occ}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Error state */}
      {isError && !isLoading && (
        <View style={styles.empty}>
          <IconSymbol name="exclamationmark.triangle" size={36} color={colors.textLow} />
          <Text style={[typo.scale.body, { color: colors.textMid, fontFamily: typo.fonts.sans, marginTop: sp.md, textAlign: 'center' }]}>
            Couldn't load designs.{'\n'}Check your connection and try again.
          </Text>
          <Pressable
            onPress={() => refetch()}
            style={[{ marginTop: sp.lg, backgroundColor: colors.accent, borderRadius: r.pill, paddingHorizontal: sp.xl, paddingVertical: sp.sm }]}
          >
            <Text style={[typo.scale.label, { color: colors.textOnAccent, fontFamily: typo.fonts.sansBold }]}>RETRY</Text>
          </Pressable>
        </View>
      )}

      {/* Grid */}
      {!isError && (isLoading ? (
        <View style={[styles.skeletonGrid, { paddingHorizontal: H_PAD, paddingTop: sp.md }]}>
          {[0, 1, 2, 3].map(i => (
            <View key={i} style={{ marginLeft: i % 2 === 1 ? CARD_GAP : 0, marginBottom: CARD_GAP }}>
              <SkeletonDesignCard width={CARD_WIDTH} />
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={designs}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          numColumns={2}
          refreshControl={<RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} tintColor={colors.accent} />}
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
          ListFooterComponent={
            totalPages > 1 ? (
              <View style={[styles.pagination, { marginTop: sp.xl }]}>
                <Pressable
                  disabled={page <= 1}
                  onPress={() => setPage(p => p - 1)}
                  style={[styles.pageBtn, { backgroundColor: page <= 1 ? colors.panel : colors.accent, borderRadius: r.sm, paddingHorizontal: sp.lg, paddingVertical: sp.sm }]}
                >
                  <Text style={[typo.scale.label, { color: page <= 1 ? colors.textLow : colors.textOnAccent, fontFamily: typo.fonts.sansBold }]}>PREV</Text>
                </Pressable>
                <Text style={[typo.scale.bodySmall, { color: colors.textMid, fontFamily: typo.fonts.sans }]}>{page} / {totalPages}</Text>
                <Pressable
                  disabled={page >= totalPages}
                  onPress={() => setPage(p => p + 1)}
                  style={[styles.pageBtn, { backgroundColor: page >= totalPages ? colors.panel : colors.accent, borderRadius: r.sm, paddingHorizontal: sp.lg, paddingVertical: sp.sm }]}
                >
                  <Text style={[typo.scale.label, { color: page >= totalPages ? colors.textLow : colors.textOnAccent, fontFamily: typo.fonts.sansBold }]}>NEXT</Text>
                </Pressable>
              </View>
            ) : null
          }
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { borderBottomWidth: 1 },
  searchBar: { flexDirection: 'row', alignItems: 'center', height: 42, borderWidth: 1, gap: 8 },
  searchInput: { flex: 1, padding: 0 },
  sortRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sortPills: { flexDirection: 'row', gap: 6, flex: 1 },
  sortPill: { borderWidth: 1 },
  pillsRow: { paddingVertical: 10, borderBottomWidth: 1 },
  occasionPill: { borderWidth: 1 },
  skeletonGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  listContent: {},
  card: { borderWidth: 1, overflow: 'hidden' },
  imageArea: { overflow: 'hidden' },
  imageOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, backgroundColor: 'rgba(0,0,0,0.15)' },
  trendingBadge: { position: 'absolute', top: 8, left: 8 },
  cardInfo: {},
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 16 },
  pageBtn: {},
});
