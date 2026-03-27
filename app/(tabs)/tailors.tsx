import { IconSymbol } from '@shared/components/ui/icon-symbol';
import type { Tailor, TailorSort } from '@features/tailors/tailors.types';
import { useGetTailorsQuery } from '@services/tailorsApi';
import { useTheme } from '@shared/theme';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CITIES = ['All', 'Lahore', 'Karachi', 'Islamabad', 'Faisalabad', 'Rawalpindi', 'Multan'];
const SPECIALISATIONS = ['Shalwar Kameez', 'Bridal', 'Suit', 'Western', 'Kids', 'Uniform'];
const TIERS: Array<{ label: string; value: 'all' | 'master' | 'premium' | 'standard' }> = [
  { label: 'All', value: 'all' },
  { label: 'Master', value: 'master' },
  { label: 'Premium', value: 'premium' },
  { label: 'Standard', value: 'standard' },
];
const SORT_OPTIONS: Array<{ label: string; value: TailorSort }> = [
  { label: 'Top Rated', value: 'rating' },
  { label: 'Most Orders', value: 'orders' },
  { label: 'Price ↑', value: 'price_asc' },
];
const AVATAR_COLORS = ['#1A6B3C', '#6D28D9', '#B45309', '#0369A1', '#9D174D', '#BE123C'];

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('') || '?';
}

function getAvatarColor(id: string): string {
  const sum = id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function TailorCardItem({ tailor }: { tailor: Tailor }) {
  const { colors, sp, r, typo, elev } = useTheme();
  const router = useRouter();
  const stars = Math.round(tailor.rating);

  const name = typeof tailor.userId === 'object' && tailor.userId !== null ? tailor.userId.name : 'Unknown';
  const initials = getInitials(name);
  const avatarColor = getAvatarColor(tailor._id);

  const tierBg =
    tailor.tier === 'master' ? colors.warning :
    tailor.tier === 'premium' ? colors.accent :
    colors.chipBg;
  const tierText =
    tailor.tier === 'standard' ? colors.textMid : colors.textOnAccent;

  const city = tailor.serviceAreas[0]?.city ?? '';
  const area = tailor.serviceAreas[0]?.area;
  const startingPrice = tailor.categoryPricing?.[0]?.price ?? 0;

  return (
    <Pressable
      onPress={() => router.push(`/tailors/${tailor.slug || tailor._id}` as any)}
      style={[styles.tailorCard, elev.low, {
        backgroundColor: colors.elevated,
        borderColor: tailor.tier === 'master' ? colors.borderStrong : colors.border,
        borderWidth: tailor.tier === 'master' ? 1.5 : 1,
        borderRadius: r.lg,
        padding: sp.base,
        marginHorizontal: 16,
      }]}
    >
      {/* Top row */}
      <View style={[styles.topRow, { marginBottom: sp.md }]}>
        <View style={[styles.avatar, {
          backgroundColor: avatarColor,
          borderRadius: r.pill,
          width: 52,
          height: 52,
        }]}>
          <Text style={[typo.scale.body, { fontFamily: typo.fonts.sansBold, color: '#fff' }]}>
            {initials}
          </Text>
        </View>
        <View style={styles.nameBlock}>
          <Text style={[typo.scale.bodySmall, { fontFamily: typo.fonts.serifBold, color: colors.textHigh }]} numberOfLines={1}>
            {name}
          </Text>
          <View style={styles.cityRow}>
            <IconSymbol name="location.fill" size={10} color={colors.textLow} />
            <Text style={[typo.scale.caption, { fontFamily: typo.fonts.sans, color: colors.textLow }]}>
              {' '}{area ? `${area}, ${city}` : city}
            </Text>
          </View>
        </View>
      </View>

      {/* Tier badge + availability */}
      <View style={[styles.midRow, { marginBottom: sp.sm }]}>
        <View style={[{
          backgroundColor: tierBg,
          borderRadius: r.sharp,
          paddingHorizontal: sp.sm,
          paddingVertical: 3,
        }]}>
          <Text style={[typo.scale.label, { fontFamily: typo.fonts.sansBold, color: tierText, fontSize: 10 }]}>
            {tailor.tier.toUpperCase()}
          </Text>
        </View>
        {tailor.isAvailable ? (
          <View style={styles.availRow}>
            <View style={[styles.availDot, { backgroundColor: colors.success }]} />
            <Text style={[typo.scale.caption, { fontFamily: typo.fonts.sansMed, color: colors.success }]}>
              Available now
            </Text>
          </View>
        ) : (
          <View style={styles.availRow}>
            <View style={[styles.availDot, { backgroundColor: colors.warning }]} />
            <Text style={[typo.scale.caption, { fontFamily: typo.fonts.sansMed, color: colors.warning }]}>
              Currently busy
            </Text>
          </View>
        )}
      </View>

      {/* Rating */}
      <View style={[styles.ratingRow, { marginBottom: sp.xs }]}>
        {[1, 2, 3, 4, 5].map(i => (
          <Text key={i} style={{ fontSize: 12, color: i <= stars ? colors.warning : colors.border }}>★</Text>
        ))}
        <Text style={[typo.scale.caption, { fontFamily: typo.fonts.sans, color: colors.textMid, marginLeft: 4 }]}>
          {tailor.rating.toFixed(1)} · {tailor.reviewCount} reviews
        </Text>
      </View>

      {/* Completed orders */}
      <Text style={[typo.scale.caption, { fontFamily: typo.fonts.sans, color: colors.textLow, marginBottom: sp.sm }]}>
        {tailor.completedOrders} orders completed
      </Text>

      {/* Specialisations */}
      <View style={[styles.specRow, { marginBottom: sp.md }]}>
        {tailor.specialisations.slice(0, 3).map(s => (
          <View key={s} style={[styles.specChip, {
            backgroundColor: colors.chipBg,
            borderRadius: r.sharp,
            paddingHorizontal: sp.sm,
            paddingVertical: 2,
          }]}>
            <Text style={[typo.scale.label, { fontFamily: typo.fonts.sansMed, color: colors.textMid, fontSize: 10 }]}>
              {s}
            </Text>
          </View>
        ))}
      </View>

      {/* Price + CTA */}
      <View style={[styles.bottomRow, { borderTopColor: colors.border, paddingTop: sp.md }]}>
        <View>
          <Text style={[typo.scale.caption, { fontFamily: typo.fonts.sans, color: colors.textLow }]}>Starting from</Text>
          <Text style={[typo.scale.price, { fontFamily: typo.fonts.sansBold, color: colors.textHigh }]}>
            {startingPrice > 0 ? `PKR ${startingPrice.toLocaleString('en-PK')}` : 'Contact for price'}
          </Text>
        </View>
        <Pressable
          onPress={() => router.push(`/tailors/${tailor.slug || tailor._id}` as any)}
          style={[{
            backgroundColor: colors.accent,
            borderRadius: r.pill,
            paddingHorizontal: sp.md,
            paddingVertical: sp.sm,
          }]}
        >
          <Text style={[typo.scale.label, { fontFamily: typo.fonts.sansBold, color: colors.textOnAccent }]}>
            VIEW PROFILE
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

export default function TailorsScreen() {
  const { colors, sp, r, typo, elev } = useTheme();
  const insets = useSafeAreaInsets();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const [city, setCity] = useState('All');
  const [tier, setTier] = useState<'all' | 'master' | 'premium' | 'standard'>('all');
  const [spec, setSpec] = useState<string | null>(null);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sort, setSort] = useState<TailorSort>('rating');
  const [page, setPage] = useState(1);

  const handleSearchChange = useCallback((text: string) => {
    setSearch(text);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setDebouncedSearch(text); setPage(1); }, 350);
  }, []);

  const query = useMemo(() => ({
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(city !== 'All' ? { city } : {}),
    ...(tier !== 'all' ? { tier } : {}),
    ...(spec ? { specialisation: spec } : {}),
    ...(availableOnly ? { available: true } : {}),
    sort,
    page,
    limit: 10,
  }), [debouncedSearch, city, tier, spec, availableOnly, sort, page]);

  const { data, isLoading, isFetching, isError, refetch } = useGetTailorsQuery(query);

  const tailors = data?.tailors ?? [];
  const totalPages = data?.pages ?? 1;

  const renderItem = useCallback(
    ({ item }: { item: Tailor }) => (
      <View style={{ marginBottom: 12 }}>
        <TailorCardItem tailor={item} />
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
          Tailors
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
            placeholder="Search by name or specialisation…"
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

      {/* City pills */}
      <View style={[{ backgroundColor: colors.surface, borderBottomColor: colors.border, borderBottomWidth: 1, paddingVertical: 10 }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: sp.base, gap: sp.sm }}>
          {CITIES.map(c => {
            const active = c === city;
            return (
              <Pressable
                key={c}
                onPress={() => { setCity(c); setPage(1); }}
                style={[{
                  backgroundColor: active ? colors.accentSubtle : colors.chipBg,
                  borderRadius: r.pill,
                  borderWidth: 1,
                  borderColor: active ? colors.accent : 'transparent',
                  paddingHorizontal: sp.md,
                  paddingVertical: sp.xs,
                }]}
              >
                <Text style={[typo.scale.label, { fontFamily: typo.fonts.sansMed, color: active ? colors.accent : colors.textMid }]}>
                  {c}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Sub-filters: tier + specialisations + available toggle */}
      <View style={[{ backgroundColor: colors.bg, borderBottomColor: colors.border, borderBottomWidth: 1, paddingVertical: sp.sm, paddingBottom: sp.md }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: sp.base, gap: sp.sm, marginBottom: sp.sm }}>
          {TIERS.map(t => {
            const active = t.value === tier;
            const isMaster = t.value === 'master';
            const isPremium = t.value === 'premium';
            return (
              <Pressable
                key={t.value}
                onPress={() => { setTier(t.value); setPage(1); }}
                style={[{
                  backgroundColor: active
                    ? (isMaster ? colors.warning : isPremium ? colors.accent : colors.accentSubtle)
                    : colors.chipBg,
                  borderRadius: r.pill,
                  borderWidth: 1,
                  borderColor: active ? (isMaster ? colors.warning : colors.accent) : 'transparent',
                  paddingHorizontal: sp.md,
                  paddingVertical: sp.xs,
                }]}
              >
                <Text style={[typo.scale.label, {
                  fontFamily: typo.fonts.sansMed,
                  color: active ? (t.value === 'standard' ? colors.accent : colors.textOnAccent) : colors.textMid,
                }]}>
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: sp.base, gap: sp.sm, alignItems: 'center' }}>
          {SPECIALISATIONS.map(s => {
            const active = s === spec;
            return (
              <Pressable
                key={s}
                onPress={() => { setSpec(active ? null : s); setPage(1); }}
                style={[{
                  backgroundColor: active ? colors.accentSubtle : colors.chipBg,
                  borderRadius: r.pill,
                  borderWidth: 1,
                  borderColor: active ? colors.accent : 'transparent',
                  paddingHorizontal: sp.md,
                  paddingVertical: sp.xs,
                }]}
              >
                <Text style={[typo.scale.label, { fontFamily: typo.fonts.sansMed, color: active ? colors.accent : colors.textMid }]}>
                  {s}
                </Text>
              </Pressable>
            );
          })}
          <View style={[styles.availToggle, {
            backgroundColor: availableOnly ? colors.successSubtle : colors.chipBg,
            borderRadius: r.pill,
            borderWidth: 1,
            borderColor: availableOnly ? colors.success : 'transparent',
            paddingHorizontal: sp.sm,
            paddingVertical: 2,
          }]}>
            <Text style={[typo.scale.label, { fontFamily: typo.fonts.sansMed, color: availableOnly ? colors.success : colors.textMid }]}>
              Available
            </Text>
            <Switch
              value={availableOnly}
              onValueChange={v => { setAvailableOnly(v); setPage(1); }}
              trackColor={{ false: colors.border, true: colors.success }}
              thumbColor={colors.elevated}
              style={{ transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] }}
            />
          </View>
        </ScrollView>
      </View>

      {/* Error state */}
      {isError && !isLoading && (
        <View style={styles.empty}>
          <IconSymbol name="exclamationmark.triangle" size={36} color={colors.textLow} />
          <Text style={[typo.scale.body, { color: colors.textMid, fontFamily: typo.fonts.sans, marginTop: sp.md, textAlign: 'center' }]}>
            Couldn't load tailors.{'\n'}Check your connection and try again.
          </Text>
          <Pressable
            onPress={() => refetch()}
            style={[{ marginTop: sp.lg, backgroundColor: colors.accent, borderRadius: r.pill, paddingHorizontal: sp.xl, paddingVertical: sp.sm }]}
          >
            <Text style={[typo.scale.label, { color: colors.textOnAccent, fontFamily: typo.fonts.sansBold }]}>RETRY</Text>
          </Pressable>
        </View>
      )}

      {/* List */}
      {!isError && (isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={tailors}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} tintColor={colors.accent} />}
          contentContainerStyle={{ paddingTop: sp.sm, paddingBottom: insets.bottom + sp['4xl'] }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <IconSymbol name="magnifyingglass" size={40} color={colors.textLow} />
              <Text style={[typo.scale.body, { color: colors.textMid, fontFamily: typo.fonts.sans, marginTop: sp.md, textAlign: 'center' }]}>
                No tailors found.{'\n'}Try a different filter.
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
  tailorCard: {},
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { alignItems: 'center', justifyContent: 'center' },
  nameBlock: { flex: 1, gap: 2 },
  cityRow: { flexDirection: 'row', alignItems: 'center' },
  midRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  availRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  availDot: { width: 6, height: 6, borderRadius: 3 },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  specRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  specChip: {},
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1 },
  availToggle: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 16 },
  pageBtn: {},
});
