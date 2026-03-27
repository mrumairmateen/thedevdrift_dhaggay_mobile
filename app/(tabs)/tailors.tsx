import { IconSymbol } from '@/components/ui/icon-symbol';
import { TAILOR_FIXTURES } from '@features/tailors/tailors.fixtures';
import type { Tailor } from '@features/tailors/tailors.types';
import { useTheme } from '@shared/theme';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
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
const SORT_OPTIONS: Array<{ label: string; value: 'rating' | 'orders' | 'price_asc' }> = [
  { label: 'Top Rated', value: 'rating' },
  { label: 'Most Orders', value: 'orders' },
  { label: 'Price ↑', value: 'price_asc' },
];

function TailorCardItem({ tailor }: { tailor: Tailor }) {
  const { colors, sp, r, typo, elev } = useTheme();
  const router = useRouter();
  const stars = Math.round(tailor.rating);

  const tierBg =
    tailor.tier === 'master' ? colors.warning :
    tailor.tier === 'premium' ? colors.accent :
    colors.chipBg;
  const tierText =
    tailor.tier === 'standard' ? colors.textMid : colors.textOnAccent;

  const city = tailor.serviceAreas[0]?.city ?? '';
  const area = tailor.serviceAreas[0]?.area;
  const startingPrice = tailor.pricing?.shalwarKameez ?? tailor.categoryPricing?.[0]?.price ?? 0;
  const name = typeof tailor.userId === 'object' && tailor.userId !== null ? tailor.userId.name : tailor.initials;

  return (
    <Pressable
      onPress={() => router.push(`/tailors/${tailor.slug}` as any)}
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
          backgroundColor: tailor.avatarColor,
          borderRadius: r.pill,
          width: 52,
          height: 52,
        }]}>
          <Text style={[typo.scale.body, { fontFamily: typo.fonts.sansBold, color: colors.textOnAccent }]}>
            {tailor.initials}
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
        {tailor.isAvailable && (
          <View style={styles.availRow}>
            <View style={[styles.availDot, { backgroundColor: colors.success }]} />
            <Text style={[typo.scale.caption, { fontFamily: typo.fonts.sansMed, color: colors.success }]}>
              Available now
            </Text>
          </View>
        )}
        {!tailor.isAvailable && (
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
          {tailor.rating} · {tailor.reviewCount} reviews
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
            PKR {startingPrice.toLocaleString('en-PK')}
          </Text>
        </View>
        <Pressable
          onPress={() => router.push(`/tailors/${tailor.slug}` as any)}
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
  const [city, setCity] = useState('All');
  const [tier, setTier] = useState<'all' | 'master' | 'premium' | 'standard'>('all');
  const [spec, setSpec] = useState<string | null>(null);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sort, setSort] = useState<'rating' | 'orders' | 'price_asc'>('rating');

  const filtered = useMemo(() => {
    let data = TAILOR_FIXTURES;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter(t => {
        const name = typeof t.userId === 'object' && t.userId !== null ? t.userId.name : '';
        return name.toLowerCase().includes(q) || t.specialisations.some(s => s.toLowerCase().includes(q));
      });
    }
    if (city !== 'All') data = data.filter(t => t.serviceAreas.some(a => a.city === city));
    if (tier !== 'all') data = data.filter(t => t.tier === tier);
    if (spec) data = data.filter(t => t.specialisations.includes(spec));
    if (availableOnly) data = data.filter(t => t.isAvailable);
    if (sort === 'rating') data = [...data].sort((a, b) => b.rating - a.rating);
    if (sort === 'orders') data = [...data].sort((a, b) => b.completedOrders - a.completedOrders);
    if (sort === 'price_asc') {
      data = [...data].sort((a, b) => {
        const pa = a.pricing?.shalwarKameez ?? a.categoryPricing?.[0]?.price ?? 99999;
        const pb = b.pricing?.shalwarKameez ?? b.categoryPricing?.[0]?.price ?? 99999;
        return pa - pb;
      });
    }
    return data;
  }, [search, city, tier, spec, availableOnly, sort]);

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
            onChangeText={setSearch}
            placeholder="Search by name or specialisation…"
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

      {/* City pills */}
      <View style={[{ backgroundColor: colors.surface, borderBottomColor: colors.border, borderBottomWidth: 1, paddingVertical: 10 }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: sp.base, gap: sp.sm }}>
          {CITIES.map(c => {
            const active = c === city;
            return (
              <Pressable
                key={c}
                onPress={() => setCity(c)}
                style={[{
                  backgroundColor: active ? colors.accentSubtle : colors.chipBg,
                  borderRadius: r.pill,
                  borderWidth: 1,
                  borderColor: active ? colors.accent : 'transparent',
                  paddingHorizontal: sp.md,
                  paddingVertical: sp.xs,
                }]}
              >
                <Text style={[typo.scale.label, {
                  fontFamily: typo.fonts.sansMed,
                  color: active ? colors.accent : colors.textMid,
                }]}>
                  {c}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Sub-filters: tier + specialisations + available toggle */}
      <View style={[{ backgroundColor: colors.bg, borderBottomColor: colors.border, borderBottomWidth: 1, paddingVertical: sp.sm, paddingBottom: sp.md }]}>
        {/* Tier row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: sp.base, gap: sp.sm, marginBottom: sp.sm }}>
          {TIERS.map(t => {
            const active = t.value === tier;
            const isMaster = t.value === 'master';
            const isPremium = t.value === 'premium';
            return (
              <Pressable
                key={t.value}
                onPress={() => setTier(t.value)}
                style={[{
                  backgroundColor: active
                    ? (isMaster ? colors.warning : isPremium ? colors.accent : colors.accentSubtle)
                    : colors.chipBg,
                  borderRadius: r.pill,
                  borderWidth: 1,
                  borderColor: active
                    ? (isMaster ? colors.warning : colors.accent)
                    : 'transparent',
                  paddingHorizontal: sp.md,
                  paddingVertical: sp.xs,
                }]}
              >
                <Text style={[typo.scale.label, {
                  fontFamily: typo.fonts.sansMed,
                  color: active
                    ? (t.value === 'standard' ? colors.accent : colors.textOnAccent)
                    : colors.textMid,
                }]}>
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Specialisation + available toggle row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: sp.base, gap: sp.sm, alignItems: 'center' }}>
          {SPECIALISATIONS.map(s => {
            const active = s === spec;
            return (
              <Pressable
                key={s}
                onPress={() => setSpec(active ? null : s)}
                style={[{
                  backgroundColor: active ? colors.accentSubtle : colors.chipBg,
                  borderRadius: r.pill,
                  borderWidth: 1,
                  borderColor: active ? colors.accent : 'transparent',
                  paddingHorizontal: sp.md,
                  paddingVertical: sp.xs,
                }]}
              >
                <Text style={[typo.scale.label, {
                  fontFamily: typo.fonts.sansMed,
                  color: active ? colors.accent : colors.textMid,
                }]}>
                  {s}
                </Text>
              </Pressable>
            );
          })}
          {/* Available now toggle */}
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
              onValueChange={setAvailableOnly}
              trackColor={{ false: colors.border, true: colors.success }}
              thumbColor={colors.elevated}
              style={{ transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] }}
            />
          </View>
        </ScrollView>
      </View>

      {/* Results count */}
      <View style={[{ paddingHorizontal: sp.base, paddingVertical: sp.sm }]}>
        <Text style={[typo.scale.caption, { color: colors.textMid, fontFamily: typo.fonts.sans }]}>
          {filtered.length} {filtered.length === 1 ? 'tailor' : 'tailors'} found
        </Text>
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={[{ paddingTop: sp.sm, paddingBottom: insets.bottom + sp['4xl'] }]}
        ListEmptyComponent={
          <View style={styles.empty}>
            <IconSymbol name="magnifyingglass" size={40} color={colors.textLow} />
            <Text style={[typo.scale.body, { color: colors.textMid, fontFamily: typo.fonts.sans, marginTop: sp.md, textAlign: 'center' }]}>
              No tailors found.{'\n'}Try a different filter.
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
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
});
