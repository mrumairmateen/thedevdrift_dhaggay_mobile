import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import type { Shop, StoreSort } from '@features/shop/shop.types';
import { useGetShopsQuery } from '@services/shopApi';
import { useTheme } from '@shared/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const H_PAD = 16;
const CARD_WIDTH = SCREEN_WIDTH - H_PAD * 2;

const CITIES = ['All Cities', 'Lahore', 'Karachi', 'Islamabad', 'Faisalabad', 'Rawalpindi', 'Multan'];
const SORT_OPTIONS: Array<{ label: string; value: StoreSort }> = [
  { label: 'Top Rated', value: 'rating' },
  { label: 'Popular', value: 'popular' },
  { label: 'Newest', value: 'newest' },
];

function StoreCard({ shop }: { shop: Shop }) {
  const { colors, sp, r, typo, elev } = useTheme();
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/store/${shop.slug}`)}
      style={[
        styles.storeCard,
        elev.low,
        {
          backgroundColor: colors.elevated,
          borderRadius: r.lg,
          borderColor: colors.border,
          width: CARD_WIDTH,
        },
      ]}
    >
      {/* Banner */}
      <View style={[styles.banner, { backgroundColor: colors.panel, borderRadius: r.lg }]}>
        {shop.banner?.url ? (
          <Image
            source={{ uri: shop.banner.url }}
            style={[StyleSheet.absoluteFill, { borderRadius: r.lg }]}
            contentFit="cover"
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.accentSubtle, borderRadius: r.lg }]} />
        )}
        {/* Logo overlap */}
        <View
          style={[
            styles.logoWrap,
            {
              backgroundColor: colors.surface,
              borderRadius: r.md,
              borderColor: colors.border,
            },
          ]}
        >
          {shop.logo?.url ? (
            <Image source={{ uri: shop.logo.url }} style={styles.logo} contentFit="contain" />
          ) : (
            <View style={[styles.logo, { backgroundColor: colors.panel }]} />
          )}
        </View>
      </View>

      {/* Info */}
      <View style={[styles.storeInfo, { padding: sp.md, paddingTop: sp['3xl'] }]}>
        <View style={styles.nameRow}>
          <Text style={[typo.scale.title3, { color: colors.textHigh, fontFamily: typo.fonts.serifBold, flex: 1 }]} numberOfLines={1}>
            {shop.name}
          </Text>
          {shop.isVerified && (
            <IconSymbol name="checkmark.seal.fill" size={16} color={colors.accent} />
          )}
        </View>

        {shop.address && (
          <View style={styles.locationRow}>
            <IconSymbol name="mappin" size={12} color={colors.textLow} />
            <Text style={[typo.scale.caption, { color: colors.textMid, fontFamily: typo.fonts.sans, marginLeft: 3 }]}>
              {[shop.address.area, shop.address.city].filter(Boolean).join(', ')}
            </Text>
          </View>
        )}

        <View style={[styles.statsRow, { marginTop: sp.sm }]}>
          <View style={styles.stat}>
            <IconSymbol name="star.fill" size={12} color="#F59E0B" />
            <Text style={[typo.scale.bodySmall, { color: colors.textHigh, fontFamily: typo.fonts.sansBold, marginLeft: 3 }]}>
              {shop.rating.toFixed(1)}
            </Text>
            <Text style={[typo.scale.caption, { color: colors.textLow, fontFamily: typo.fonts.sans, marginLeft: 3 }]}>
              ({shop.reviewCount})
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Text style={[typo.scale.caption, { color: colors.textMid, fontFamily: typo.fonts.sans }]}>
            {shop.productCount} products
          </Text>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Text style={[typo.scale.label, { color: colors.accentMid, fontFamily: typo.fonts.sansMed }]}>
            {shop.category.toUpperCase()}
          </Text>
        </View>

        <Pressable
          onPress={() => router.push(`/store/${shop.slug}`)}
          style={[
            styles.browseBtn,
            {
              backgroundColor: colors.accent,
              borderRadius: r.pill,
              marginTop: sp.md,
              paddingVertical: sp.sm,
            },
          ]}
        >
          <Text style={[typo.scale.label, { color: colors.textOnAccent, fontFamily: typo.fonts.sansBold }]}>
            BROWSE STORE
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

export default function StoresScreen() {
  const { colors, sp, r, typo } = useTheme();
  const insets = useSafeAreaInsets();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const [city, setCity] = useState('All Cities');
  const [sort, setSort] = useState<StoreSort>('rating');
  const [page, setPage] = useState(1);

  const query = useMemo(
    () => ({
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...(city !== 'All Cities' ? { city } : {}),
      sort,
      page,
      limit: 10,
    }),
    [debouncedSearch, city, sort, page],
  );

  const { data, isLoading, isFetching, isError, refetch } = useGetShopsQuery(query);

  const shops = data?.shops ?? [];
  const totalPages = data?.pages ?? 1;

  const handleSearchChange = useCallback((text: string) => {
    setSearch(text);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setDebouncedSearch(text); setPage(1); }, 350);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Shop }) => <StoreCard shop={item} />,
    [],
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.navSolid,
            paddingTop: insets.top + sp.sm,
            paddingHorizontal: sp.base,
            paddingBottom: sp.md,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text style={[typo.scale.title2, { fontFamily: typo.fonts.serifBold, color: colors.textHigh, marginBottom: sp.md }]}>
          Stores
        </Text>

        {/* Search */}
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.inputBg,
              borderRadius: r.sm,
              borderColor: colors.border,
              paddingHorizontal: sp.md,
            },
          ]}
        >
          <IconSymbol name="magnifyingglass" size={16} color={colors.textLow} />
          <TextInput
            value={search}
            onChangeText={handleSearchChange}
            placeholder="Search stores…"
            placeholderTextColor={colors.textLow}
            style={[styles.searchInput, typo.scale.body, { fontFamily: typo.fonts.sans, color: colors.textHigh }]}
          />
          {search.length > 0 && (
            <Pressable onPress={() => { setSearch(''); setDebouncedSearch(''); }}>
              <IconSymbol name="xmark" size={14} color={colors.textLow} />
            </Pressable>
          )}
        </View>

        {/* City + Sort filters */}
        <View style={[styles.filterRow, { marginTop: sp.sm }]}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={CITIES}
            keyExtractor={c => c}
            contentContainerStyle={{ gap: sp.sm }}
            renderItem={({ item: c }) => {
              const active = c === city;
              return (
                <Pressable
                  onPress={() => { setCity(c); setPage(1); }}
                  style={[
                    styles.pill,
                    {
                      backgroundColor: active ? colors.accent : colors.chipBg,
                      borderRadius: r.pill,
                      paddingHorizontal: sp.md,
                      paddingVertical: 5,
                    },
                  ]}
                >
                  <Text style={[typo.scale.label, { color: active ? colors.textOnAccent : colors.textMid, fontFamily: typo.fonts.sansMed }]}>
                    {c}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>

        <View style={[styles.filterRow, { marginTop: sp.xs }]}>
          {SORT_OPTIONS.map(opt => {
            const active = opt.value === sort;
            return (
              <Pressable
                key={opt.value}
                onPress={() => { setSort(opt.value); setPage(1); }}
                style={[
                  styles.pill,
                  {
                    backgroundColor: active ? colors.accentSubtle : 'transparent',
                    borderRadius: r.pill,
                    borderColor: active ? colors.accent : colors.border,
                    paddingHorizontal: sp.sm,
                    paddingVertical: 4,
                    borderWidth: 1,
                    marginRight: sp.sm,
                  },
                ]}
              >
                <Text style={[typo.scale.label, { color: active ? colors.accent : colors.textMid, fontFamily: typo.fonts.sansMed }]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
          {isFetching && !isLoading && <ActivityIndicator size="small" color={colors.accent} />}
        </View>
      </View>

      {/* Error state */}
      {isError && !isLoading && (
        <View style={styles.empty}>
          <IconSymbol name="exclamationmark.triangle" size={36} color={colors.textLow} />
          <Text style={[typo.scale.body, { color: colors.textMid, fontFamily: typo.fonts.sans, marginTop: sp.md, textAlign: 'center' }]}>
            Couldn't load stores.{'\n'}Check your connection and try again.
          </Text>
          <Pressable
            onPress={() => refetch()}
            style={[{ marginTop: sp.lg, backgroundColor: colors.accent, borderRadius: r.pill, paddingHorizontal: sp.xl, paddingVertical: sp.sm }]}
          >
            <Text style={[typo.scale.label, { color: colors.textOnAccent, fontFamily: typo.fonts.sansBold }]}>
              RETRY
            </Text>
          </Pressable>
        </View>
      )}

      {/* List */}
      {!isError && (isLoading ? (
        <View style={[styles.loading]}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={shops}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingHorizontal: H_PAD,
            paddingTop: sp.base,
            paddingBottom: insets.bottom + sp['4xl'],
            gap: sp.md,
          }}
          refreshControl={
            <RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} tintColor={colors.accent} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <IconSymbol name="building.2.fill" size={40} color={colors.textLow} />
              <Text style={[typo.scale.body, { color: colors.textMid, fontFamily: typo.fonts.sans, marginTop: sp.md, textAlign: 'center' }]}>
                No stores found.{'\n'}Try a different filter.
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
  filterRow: { flexDirection: 'row', alignItems: 'center' },
  pill: { alignItems: 'center', justifyContent: 'center' },
  storeCard: { borderWidth: 1, overflow: 'hidden' },
  banner: { height: 120, overflow: 'hidden', justifyContent: 'flex-end', alignItems: 'flex-start' },
  logoWrap: { position: 'absolute', bottom: -24, left: 16, width: 56, height: 56, borderWidth: 2, overflow: 'hidden' },
  logo: { width: 52, height: 52 },
  storeInfo: {},
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stat: { flexDirection: 'row', alignItems: 'center' },
  divider: { width: 1, height: 12 },
  browseBtn: { alignItems: 'center' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 },
  pageBtn: {},
});
