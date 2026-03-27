import { IconSymbol } from '@/components/ui/icon-symbol';
import { DESIGN_FIXTURES } from '@features/designs/designs.fixtures';
import type { Design } from '@features/designs/designs.types';
import { useTheme } from '@shared/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
const IMAGE_HEIGHT = Math.round(SCREEN_WIDTH * 0.75);

function RelatedCard({ design }: { design: Design }) {
  const { colors, sp, r, typo, elev } = useTheme();
  const router = useRouter();
  const CARD_W = 140;

  return (
    <Pressable
      onPress={() => router.push(`/designs/${design.slug}` as any)}
      style={[elev.low, {
        width: CARD_W,
        backgroundColor: colors.elevated,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: r.md,
        overflow: 'hidden',
      }]}
    >
      <View style={{ height: Math.round(CARD_W * 1.2), backgroundColor: design.imageColor }}>
        {design.isTrending && (
          <View style={{
            position: 'absolute', top: 6, left: 6,
            backgroundColor: colors.warning,
            borderRadius: r.sharp,
            paddingHorizontal: sp.sm, paddingVertical: 2,
          }}>
            <Text style={[typo.scale.label, { fontFamily: typo.fonts.sansBold, color: '#fff', fontSize: 9 }]}>
              TRENDING
            </Text>
          </View>
        )}
      </View>
      <View style={{ padding: sp.sm }}>
        <Text style={[typo.scale.caption, { fontFamily: typo.fonts.sansMed, color: colors.accentMid, marginBottom: 2 }]}>
          {design.occasion[0]?.toUpperCase() ?? ''}
        </Text>
        <Text numberOfLines={2} style={[typo.scale.caption, { fontFamily: typo.fonts.serifBold, color: colors.textHigh }]}>
          {design.title}
        </Text>
      </View>
    </Pressable>
  );
}

export default function DesignDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { colors, sp, r, typo, elev } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const design = DESIGN_FIXTURES.find(d => d.slug === slug);
  const related = DESIGN_FIXTURES.filter(d => d.slug !== slug && d.occasion.some(o => design?.occasion.includes(o))).slice(0, 6);

  if (!design) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
        <View style={[styles.header, {
          backgroundColor: colors.navSolid,
          paddingTop: sp.sm,
          paddingHorizontal: sp.base,
          paddingBottom: sp.md,
          borderBottomColor: colors.border,
        }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
            <IconSymbol name="chevron.left" size={20} color={colors.textHigh} />
            <Text style={[typo.scale.body, { fontFamily: typo.fonts.sansMed, color: colors.textHigh }]}>Designs</Text>
          </Pressable>
        </View>
        <View style={styles.notFound}>
          <Text style={[typo.scale.body, { color: colors.textMid, fontFamily: typo.fonts.sans }]}>Design not found.</Text>
        </View>
      </View>
    );
  }

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
          <Text style={[typo.scale.body, { fontFamily: typo.fonts.sansMed, color: colors.textHigh }]}>Designs</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + sp['4xl'] }}
      >
        {/* Hero image */}
        <View style={[styles.heroImage, { height: IMAGE_HEIGHT, backgroundColor: design.imageColor }]}>
          {design.isTrending && (
            <View style={[styles.trendingBadge, {
              backgroundColor: colors.warning,
              borderRadius: r.sharp,
              paddingHorizontal: sp.md,
              paddingVertical: 4,
            }]}>
              <Text style={[typo.scale.label, { fontFamily: typo.fonts.sansBold, color: '#fff' }]}>
                TRENDING
              </Text>
            </View>
          )}
        </View>

        {/* Info section */}
        <View style={[styles.infoSection, { padding: sp.base }]}>
          {/* Category + gender row */}
          <View style={[styles.metaRow, { marginBottom: sp.sm }]}>
            <View style={[styles.metaChip, {
              backgroundColor: colors.accentSubtle,
              borderRadius: r.sharp,
              paddingHorizontal: sp.sm,
              paddingVertical: 3,
            }]}>
              <Text style={[typo.scale.label, { fontFamily: typo.fonts.sansMed, color: colors.accent }]}>
                {design.garmentCategorySlug.replace(/-/g, ' ').toUpperCase()}
              </Text>
            </View>
            <View style={[styles.metaChip, {
              backgroundColor: colors.chipBg,
              borderRadius: r.sharp,
              paddingHorizontal: sp.sm,
              paddingVertical: 3,
            }]}>
              <Text style={[typo.scale.label, { fontFamily: typo.fonts.sansMed, color: colors.textMid }]}>
                {design.gender.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text style={[typo.scale.title2, { fontFamily: typo.fonts.serifBold, color: colors.textHigh, marginBottom: sp.sm }]}>
            {design.title}
          </Text>

          {/* Occasion tags */}
          <View style={[styles.tagsRow, { marginBottom: sp.base }]}>
            {design.occasion.map(occ => (
              <View key={occ} style={[styles.tag, {
                backgroundColor: colors.panel,
                borderRadius: r.sharp,
                borderColor: colors.border,
                paddingHorizontal: sp.sm,
                paddingVertical: 3,
              }]}>
                <Text style={[typo.scale.label, { fontFamily: typo.fonts.sansMed, color: colors.textMid }]}>
                  {occ}
                </Text>
              </View>
            ))}
          </View>

          {/* Custom tags */}
          {design.tags && design.tags.length > 0 && (
            <View style={[styles.tagsRow, { marginBottom: sp.lg }]}>
              {design.tags.map(tag => (
                <View key={tag} style={[styles.tag, {
                  backgroundColor: 'transparent',
                  borderRadius: r.pill,
                  borderColor: colors.border,
                  paddingHorizontal: sp.sm,
                  paddingVertical: 3,
                }]}>
                  <Text style={[typo.scale.label, { fontFamily: typo.fonts.sans, color: colors.textLow }]}>
                    #{tag}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* CTA */}
          <Pressable
            onPress={() => router.push(`/orders/new?designId=${design._id}` as any)}
            style={[styles.ctaBtn, {
              backgroundColor: colors.accent,
              borderRadius: r.pill,
              paddingVertical: sp.md,
            }]}
          >
            <Text style={[typo.scale.body, { fontFamily: typo.fonts.sansBold, color: colors.textOnAccent, textAlign: 'center' }]}>
              Order This Design
            </Text>
          </Pressable>

          {/* Share row */}
          <View style={[styles.shareRow, { marginTop: sp.base }]}>
            <Pressable style={[styles.shareBtn, {
              backgroundColor: colors.surface,
              borderRadius: r.sm,
              borderColor: colors.border,
              paddingVertical: sp.sm,
              paddingHorizontal: sp.base,
            }]}>
              <IconSymbol name="square.and.arrow.up" size={16} color={colors.textMid} />
              <Text style={[typo.scale.label, { fontFamily: typo.fonts.sansMed, color: colors.textMid }]}>Share</Text>
            </Pressable>
          </View>
        </View>

        {/* Related designs */}
        {related.length > 0 && (
          <View style={{ marginTop: sp.xl }}>
            <View style={{ paddingHorizontal: sp.base, marginBottom: sp.md }}>
              <Text style={[typo.scale.label, { fontFamily: typo.fonts.sansMed, color: colors.textLow, letterSpacing: 1.2 }]}>
                SIMILAR DESIGNS
              </Text>
              <Text style={[typo.scale.subtitle, { fontFamily: typo.fonts.serifBold, color: colors.textHigh }]}>
                You May Also Like
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: sp.base, gap: sp.md }}
            >
              {related.map(d => <RelatedCard key={d._id} design={d} />)}
            </ScrollView>
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
  heroImage: { width: SCREEN_WIDTH, overflow: 'hidden' },
  trendingBadge: { position: 'absolute', top: 16, left: 16 },
  infoSection: {},
  metaRow: { flexDirection: 'row', gap: 8 },
  metaChip: {},
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { borderWidth: 1 },
  ctaBtn: { alignItems: 'center' },
  shareRow: { flexDirection: 'row' },
  shareBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
