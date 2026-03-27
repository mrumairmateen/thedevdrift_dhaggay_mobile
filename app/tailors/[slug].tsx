import { IconSymbol } from '@/components/ui/icon-symbol';
import { TAILOR_FIXTURES } from '@features/tailors/tailors.fixtures';
import { useTheme } from '@shared/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PORTFOLIO_GAP = 8;
const H_PAD = 16;
const PORTFOLIO_COL_W = (SCREEN_WIDTH - H_PAD * 2 - PORTFOLIO_GAP) / 2;

type ProfileTab = 'portfolio' | 'pricing' | 'reviews';

export default function TailorProfileScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { colors, sp, r, typo, elev } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ProfileTab>('portfolio');

  const tailor = TAILOR_FIXTURES.find(t => t.slug === slug);

  if (!tailor) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.bg }]}>
        <View style={[styles.header, {
          backgroundColor: colors.navSolid,
          paddingTop: insets.top + sp.sm,
          paddingHorizontal: sp.base,
          paddingBottom: sp.md,
          borderBottomColor: colors.border,
        }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
            <IconSymbol name="chevron.left" size={20} color={colors.textHigh} />
            <Text style={[typo.scale.body, { fontFamily: typo.fonts.sansMed, color: colors.textHigh }]}>Tailors</Text>
          </Pressable>
        </View>
        <View style={styles.notFound}>
          <Text style={[typo.scale.body, { color: colors.textMid, fontFamily: typo.fonts.sans }]}>Tailor not found.</Text>
        </View>
      </View>
    );
  }

  const stars = Math.round(tailor.rating);
  const tierBg =
    tailor.tier === 'master' ? colors.warning :
    tailor.tier === 'premium' ? colors.accent :
    colors.chipBg;
  const tierText = tailor.tier === 'standard' ? colors.textMid : colors.textOnAccent;
  const city = tailor.serviceAreas[0]?.city ?? '';
  const area = tailor.serviceAreas[0]?.area;
  const name = typeof tailor.userId === 'object' && tailor.userId !== null ? tailor.userId.name : tailor.initials;

  const PROFILE_TABS: Array<{ key: ProfileTab; label: string }> = [
    { key: 'portfolio', label: 'Portfolio' },
    { key: 'pricing', label: 'Pricing' },
    { key: 'reviews', label: 'Reviews' },
  ];

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
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <IconSymbol name="chevron.left" size={20} color={colors.textHigh} />
          <Text style={[typo.scale.body, { fontFamily: typo.fonts.sansMed, color: colors.textHigh }]}>Tailors</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + sp['4xl'] }}>
        {/* Profile header card */}
        <View style={[styles.profileCard, {
          backgroundColor: colors.elevated,
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
          padding: sp.base,
          paddingBottom: sp.lg,
        }]}>
          {/* Avatar + name + tier */}
          <View style={[styles.avatarRow, { marginBottom: sp.md }]}>
            <View style={[styles.bigAvatar, {
              backgroundColor: tailor.avatarColor,
              borderRadius: r.pill,
              width: 72,
              height: 72,
            }]}>
              <Text style={[typo.scale.title3, { fontFamily: typo.fonts.sansBold, color: colors.textOnAccent }]}>
                {tailor.initials}
              </Text>
            </View>
            <View style={styles.profileNameBlock}>
              <Text style={[typo.scale.title3, { fontFamily: typo.fonts.serifBold, color: colors.textHigh }]}>
                {name}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
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
                    <Text style={[typo.scale.caption, { fontFamily: typo.fonts.sansMed, color: colors.success }]}>Available now</Text>
                  </View>
                ) : (
                  <View style={styles.availRow}>
                    <View style={[styles.availDot, { backgroundColor: colors.warning }]} />
                    <Text style={[typo.scale.caption, { fontFamily: typo.fonts.sansMed, color: colors.warning }]}>Currently busy</Text>
                  </View>
                )}
              </View>
              <View style={[styles.cityRow, { marginTop: 4 }]}>
                <IconSymbol name="location.fill" size={11} color={colors.textLow} />
                <Text style={[typo.scale.caption, { fontFamily: typo.fonts.sans, color: colors.textLow }]}>
                  {' '}{area ? `${area}, ${city}` : city}
                </Text>
              </View>
            </View>
          </View>

          {/* Stats row */}
          <View style={[styles.statsRow, {
            backgroundColor: colors.panel,
            borderRadius: r.md,
            padding: sp.md,
            marginBottom: sp.md,
          }]}>
            <View style={styles.statItem}>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map(i => (
                  <Text key={i} style={{ fontSize: 12, color: i <= stars ? colors.warning : colors.border }}>★</Text>
                ))}
              </View>
              <Text style={[typo.scale.caption, { fontFamily: typo.fonts.sans, color: colors.textMid }]}>
                {tailor.rating} ({tailor.reviewCount})
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[typo.scale.title3, { fontFamily: typo.fonts.serifBold, color: colors.textHigh }]}>
                {tailor.completedOrders}
              </Text>
              <Text style={[typo.scale.caption, { fontFamily: typo.fonts.sans, color: colors.textMid }]}>Orders</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[typo.scale.title3, { fontFamily: typo.fonts.serifBold, color: colors.textHigh }]}>
                {tailor.specialisations.length}
              </Text>
              <Text style={[typo.scale.caption, { fontFamily: typo.fonts.sans, color: colors.textMid }]}>Specialties</Text>
            </View>
          </View>

          {/* Book Now CTA */}
          <Pressable
            onPress={() => router.push(`/orders/new?tailorId=${tailor._id}` as any)}
            style={[styles.bookBtn, {
              backgroundColor: colors.accent,
              borderRadius: r.pill,
              paddingVertical: sp.md,
            }]}
          >
            <Text style={[typo.scale.body, { fontFamily: typo.fonts.sansBold, color: colors.textOnAccent, textAlign: 'center' }]}>
              Book Now
            </Text>
          </Pressable>
        </View>

        {/* Tab bar */}
        <View style={[styles.tabBar, {
          backgroundColor: colors.navSolid,
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
        }]}>
          {PROFILE_TABS.map(tab => {
            const active = tab.key === activeTab;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={[styles.tabItem, {
                  borderBottomWidth: active ? 2 : 0,
                  borderBottomColor: colors.accent,
                  paddingVertical: sp.md,
                }]}
              >
                <Text style={[typo.scale.label, {
                  fontFamily: typo.fonts.sansBold,
                  color: active ? colors.accent : colors.textMid,
                  letterSpacing: 1,
                }]}>
                  {tab.label.toUpperCase()}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Tab content */}
        {activeTab === 'portfolio' && (
          <View style={[styles.portfolioGrid, { padding: H_PAD, gap: PORTFOLIO_GAP }]}>
            {(tailor.portfolio ?? []).length === 0 && (
              <Text style={[typo.scale.body, { color: colors.textMid, fontFamily: typo.fonts.sans, textAlign: 'center', paddingVertical: sp['3xl'] }]}>
                No portfolio items yet.
              </Text>
            )}
            {(tailor.portfolio ?? []).map((item, idx) => (
              <View key={idx} style={[styles.portfolioItem, {
                width: PORTFOLIO_COL_W,
                borderRadius: r.md,
                overflow: 'hidden',
                backgroundColor: item.imageColor,
              }]}>
                <View style={{ height: PORTFOLIO_COL_W, backgroundColor: item.imageColor }} />
                {item.caption && (
                  <View style={{ padding: sp.sm, backgroundColor: colors.elevated }}>
                    <Text style={[typo.scale.caption, { fontFamily: typo.fonts.sans, color: colors.textMid }]} numberOfLines={1}>
                      {item.caption}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {activeTab === 'pricing' && (
          <View style={{ padding: sp.base }}>
            {tailor.categoryPricing && tailor.categoryPricing.length > 0 ? (
              <View style={[{
                backgroundColor: colors.elevated,
                borderRadius: r.md,
                borderWidth: 1,
                borderColor: colors.border,
                overflow: 'hidden',
              }]}>
                {tailor.categoryPricing.map((item, idx) => (
                  <View key={item.garmentCategoryId} style={[styles.priceRow, {
                    borderBottomWidth: idx < tailor.categoryPricing!.length - 1 ? 1 : 0,
                    borderBottomColor: colors.border,
                    paddingHorizontal: sp.base,
                    paddingVertical: sp.md,
                    backgroundColor: idx % 2 === 0 ? colors.elevated : colors.panel,
                  }]}>
                    <Text style={[typo.scale.body, { fontFamily: typo.fonts.sans, color: colors.textHigh }]}>
                      {item.garmentCategorySlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </Text>
                    <Text style={[typo.scale.price, { fontFamily: typo.fonts.sansBold, color: colors.accent }]}>
                      PKR {item.price.toLocaleString('en-PK')}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={[typo.scale.body, { color: colors.textMid, fontFamily: typo.fonts.sans, textAlign: 'center', paddingVertical: sp['3xl'] }]}>
                No pricing info available.
              </Text>
            )}
          </View>
        )}

        {activeTab === 'reviews' && (
          <View style={[styles.reviewsEmpty, { paddingVertical: sp['3xl'] }]}>
            <IconSymbol name="star" size={40} color={colors.textLow} />
            <Text style={[typo.scale.body, { color: colors.textMid, fontFamily: typo.fonts.sans, marginTop: sp.md, textAlign: 'center' }]}>
              No reviews yet.{'\n'}Be the first to book and review!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { borderBottomWidth: 1 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  profileCard: {},
  avatarRow: { flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  bigAvatar: { alignItems: 'center', justifyContent: 'center' },
  profileNameBlock: { flex: 1 },
  availRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  availDot: { width: 7, height: 7, borderRadius: 3.5 },
  cityRow: { flexDirection: 'row', alignItems: 'center' },
  statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  statItem: { alignItems: 'center', gap: 4 },
  starsRow: { flexDirection: 'row' },
  statDivider: { width: 1, height: 36 },
  bookBtn: {},
  tabBar: { flexDirection: 'row' },
  tabItem: { flex: 1, alignItems: 'center' },
  portfolioGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  portfolioItem: { marginBottom: PORTFOLIO_GAP },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reviewsEmpty: { alignItems: 'center' },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
