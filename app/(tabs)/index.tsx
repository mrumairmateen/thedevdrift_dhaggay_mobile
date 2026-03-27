import { IconSymbol } from '@/components/ui/icon-symbol';
import { CategoryRow } from '@features/home/components/CategoryRow';
import { EidBanner } from '@features/home/components/EidBanner';
import { FeaturedTailors } from '@features/home/components/FeaturedTailors';
import { HeroBanner } from '@features/home/components/HeroBanner';
import { HowItWorks } from '@features/home/components/HowItWorks';
import { SectionHeader } from '@features/home/components/SectionHeader';
import { TrendingDesigns } from '@features/home/components/TrendingDesigns';
import { TrendingFabrics } from '@features/home/components/TrendingFabrics';
import { TrustStats } from '@features/home/components/TrustStats';
import { useTheme } from '@shared/theme';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '@store/index';
import { openAuthSheet } from '@store/authSlice';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function Divider({ size = '2xl' }: { size?: '2xl' | 'xl' | 'lg' }) {
  const { sp } = useTheme();
  const heights: Record<string, number> = { '2xl': sp['2xl'], xl: sp.xl, lg: sp.lg };
  return <View style={{ height: heights[size] }} />;
}

export default function HomeScreen() {
  const { colors, sp, r, typo, elev } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);

  // Redirect to dashboard when user logs in from this screen
  const prevUserRef = useRef(user);
  useEffect(() => {
    if (!prevUserRef.current && user) {
      router.push('/(dashboard)' as any);
    }
    prevUserRef.current = user;
  }, [user]);

  const initials = user?.name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase() ?? '';

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      {/* ─── Fixed sticky header ───────────────────────────────────────── */}
      <View
        style={[
          styles.header,
          elev.high,
          {
            backgroundColor: colors.navSolid,
            paddingTop: insets.top + sp.sm,
            paddingBottom: sp.md,
            paddingHorizontal: sp.base,
            borderBottomColor: colors.border,
          },
        ]}
      >
        {/* Brand + location */}
        <View style={styles.brandBlock}>
          <Text
            style={[
              typo.scale.title3,
              { fontFamily: typo.fonts.serifBold, color: colors.textHigh },
            ]}
          >
            Dhaggay
          </Text>
          <Pressable style={styles.locationRow} hitSlop={6}>
            <IconSymbol name="location.fill" size={10} color={colors.accent} />
            <Text
              style={[
                typo.scale.caption,
                { fontFamily: typo.fonts.sansMed, color: colors.accent },
              ]}
            >
              {' '}Lahore
            </Text>
            <IconSymbol name="chevron.down" size={8} color={colors.accent} />
          </Pressable>
        </View>

        {/* Actions */}
        <View style={styles.headerActions}>
          <Pressable hitSlop={8}>
            <IconSymbol name="bell" size={22} color={colors.textHigh} />
          </Pressable>
          <Pressable onPress={() => router.push('/cart' as any)} hitSlop={8}>
            <IconSymbol name="bag" size={22} color={colors.textHigh} />
          </Pressable>
          <Pressable
            onPress={() => user ? router.push('/(dashboard)' as any) : dispatch(openAuthSheet('login'))}
            hitSlop={8}
          >
            {user ? (
              <View style={[
                styles.avatar,
                { backgroundColor: colors.accentSubtle, borderRadius: r.pill },
              ]}>
                <Text style={[
                  typo.scale.caption,
                  { fontFamily: typo.fonts.sansBold, color: colors.accent, fontSize: 11 },
                ]}>
                  {initials}
                </Text>
              </View>
            ) : (
              <IconSymbol name="person" size={22} color={colors.textHigh} />
            )}
          </Pressable>
          <Pressable onPress={() => router.push('/settings' as any)} hitSlop={8}>
            <IconSymbol name="gearshape.fill" size={22} color={colors.textHigh} />
          </Pressable>
        </View>
      </View>

      {/* ─── Scrollable content ────────────────────────────────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + sp['4xl'] },
        ]}
      >
        {/* Hero */}
        <HeroBanner />

        <Divider />

        {/* Fabric categories */}
        <SectionHeader label="SHOP BY FABRIC" title="Browse Categories" />
        <CategoryRow
          onPress={(slug) => router.push(`/(tabs)/shop?category=${slug}` as any)}
        />

        <Divider />

        {/* Trending fabrics */}
        <SectionHeader
          label="DISCOVER"
          title="Trending Fabrics"
          onSeeAll={() => router.push('/(tabs)/shop')}
        />
        <TrendingFabrics />

        <Divider />

        {/* How it works */}
        <SectionHeader label="THE PROCESS" title="How It Works" />
        <HowItWorks />

        <Divider />

        {/* Featured tailors */}
        <SectionHeader
          label="MASTER CRAFTSMEN"
          title="Featured Tailors"
          onSeeAll={() => router.push('/(tabs)/tailors' as any)}
        />
        <FeaturedTailors />

        <Divider />

        {/* Eid collection promotional banner */}
        <EidBanner />

        <Divider />

        {/* Trending designs */}
        <SectionHeader
          label="COLLECTIONS"
          title="Trending Designs"
          onSeeAll={() => router.push('/(tabs)/designs' as any)}
        />
        <TrendingDesigns />

        <Divider />

        {/* Trust stats */}
        <TrustStats />

        <Divider size="lg" />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  brandBlock: {
    gap: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {},
});
