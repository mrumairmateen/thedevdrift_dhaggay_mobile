import React, { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import {
  useGetTailorMeQuery,
  useUpdateTailorProfileMutation,
} from '@services/tailorDashApi';
import type { TailorPortfolioEntry, TailorProfileData } from '@services/tailorDashApi';
import { useAppSelector } from '@store/index';
import { useTheme } from '@shared/theme';
import { useSignOut } from '@shared/hooks/useSignOut';
import {
  Avatar,
  Button,
  ErrorBanner,
  Skeleton,
  Tag,
} from '@shared/components/ui';
import { DashHeader } from '@shared/components/DashHeader';
import { IconSymbol } from '@shared/components/ui/icon-symbol';
import { formatPkr } from '@shared/utils';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ALL_SPECIALISATIONS = [
  'shalwar_kameez',
  'suit',
  'bridal',
  'western',
  'uniform',
  'kids',
] as const;

type Specialisation = (typeof ALL_SPECIALISATIONS)[number];

const GENDER_LABELS: Record<string, string> = {
  male: 'Men',
  female: 'Women',
  kids: 'Kids',
};

function formatSpec(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatCategorySlug(slug: string): string {
  const parts = slug.split('_');
  const last = parts[parts.length - 1] ?? '';
  if (last in GENDER_LABELS) {
    const base = parts
      .slice(0, -1)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(' ');
    return `${base} (${GENDER_LABELS[last] ?? last})`;
  }
  return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
}

function tierVariant(tier: 'standard' | 'premium' | 'master'): 'default' | 'accent' | 'warning' {
  if (tier === 'master') return 'warning';
  if (tier === 'premium') return 'accent';
  return 'default';
}

// ─── Portfolio strip ──────────────────────────────────────────────────────────

interface PortfolioStripProps {
  items: TailorPortfolioEntry[];
}

const PortfolioStrip = React.memo(function PortfolioStrip({
  items,
}: PortfolioStripProps): React.JSX.Element {
  const { colors, sp, r, typo } = useTheme();

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: sp.md,
      marginBottom: sp.md,
    },
    sectionTitle: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansBold,
      color: colors.textMid,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: sp.sm,
    },
    strip: { gap: sp.sm },
    item: { width: 140 },
    thumb: {
      width: 140,
      height: 140,
      borderRadius: r.md,
      backgroundColor: colors.panel,
      marginBottom: sp.xs,
    },
    caption: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
    },
  });

  if (items.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Portfolio</Text>
        <Text style={[typo.scale.caption, { fontFamily: typo.fonts.sans, color: colors.textLow }]}>
          No portfolio items yet. Add work via the web dashboard.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Portfolio</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
        {items.map((item) => (
          <View key={item._id} style={styles.item}>
            <Image source={{ uri: item.imageUrl }} style={styles.thumb} resizeMode="cover" />
            {item.caption !== null && item.caption.length > 0 && (
              <Text style={styles.caption} numberOfLines={2}>
                {item.caption}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
});

// ─── Category pricing card ────────────────────────────────────────────────────

interface CategoryPricingCardProps {
  items: TailorProfileData['categoryPricing'];
}

const CategoryPricingCard = React.memo(function CategoryPricingCard({
  items,
}: CategoryPricingCardProps): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: sp.md,
      marginBottom: sp.md,
      ...elev.low,
    },
    sectionTitle: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansBold,
      color: colors.textMid,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: sp.sm,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: sp.xs,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    lastRow: {
      borderBottomWidth: 0,
    },
    label: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sans,
      color: colors.textHigh,
    },
    price: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.accent,
    },
    empty: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textLow,
    },
  });

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Category Pricing</Text>
      {items.length === 0 ? (
        <Text style={styles.empty}>No category pricing set. Configure via web dashboard.</Text>
      ) : (
        items.map((cp, idx) => (
          <View key={cp.garmentCategoryId} style={[styles.row, idx === items.length - 1 && styles.lastRow]}>
            <Text style={styles.label}>{formatCategorySlug(cp.garmentCategorySlug)}</Text>
            <Text style={styles.price}>{formatPkr(cp.price)}</Text>
          </View>
        ))
      )}
    </View>
  );
});

// ─── Specialisations (editable) ───────────────────────────────────────────────

interface SpecialisationsSectionProps {
  current: string[];
}

function SpecialisationsSection({ current }: SpecialisationsSectionProps): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();
  const [selected, setSelected] = useState<Set<string>>(new Set(current));
  const [updateProfile, { isLoading: isSaving }] = useUpdateTailorProfileMutation();

  const toggleSpec = useCallback((spec: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(spec)) {
        next.delete(spec);
      } else {
        next.add(spec);
      }
      return next;
    });
  }, []);

  const handleSave = useCallback(() => {
    void updateProfile({ specialisations: Array.from(selected) })
      .unwrap()
      .then(() => {
        Alert.alert('Saved', 'Your specialisations have been updated.');
      })
      .catch(() => {
        Alert.alert('Error', 'Could not save specialisations. Please try again.');
      });
  }, [updateProfile, selected]);

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: sp.md,
      marginBottom: sp.md,
      ...elev.low,
    },
    sectionTitle: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansBold,
      color: colors.textMid,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: sp.sm,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: sp.sm,
      marginBottom: sp.md,
    },
    chip: {
      borderWidth: 1,
      borderRadius: r.pill,
      paddingHorizontal: sp.md,
      paddingVertical: sp.xs,
    },
    chipLabel: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sansMed,
    },
  });

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Specialisations</Text>
      <View style={styles.chipRow}>
        {ALL_SPECIALISATIONS.map((spec: Specialisation) => {
          const isActive = selected.has(spec);
          return (
            <Pressable
              key={spec}
              onPress={() => toggleSpec(spec)}
              style={[
                styles.chip,
                {
                  backgroundColor: isActive ? colors.accentSubtle : colors.chipBg,
                  borderColor: isActive ? colors.accent : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipLabel,
                  {
                    color: isActive ? colors.accent : colors.textMid,
                    fontFamily: isActive ? typo.fonts.sansBold : typo.fonts.sansMed,
                  },
                ]}
              >
                {formatSpec(spec)}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Button label="Save Specialisations" onPress={handleSave} loading={isSaving} variant="primary" fullWidth />
    </View>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ProfileSkeleton(): React.JSX.Element {
  const { sp, r, colors } = useTheme();

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: sp.md,
    },
    content: { padding: sp.base, gap: sp.md, marginTop: sp.base },
  });

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={[styles.card, { height: 96 }]} />
        <Skeleton width="100%" height={56} radius={r.md} />
        <Skeleton width="100%" height={160} radius={r.md} />
        <Skeleton width="100%" height={120} radius={r.md} />
        <Skeleton width="100%" height={100} radius={r.md} />
      </View>
    </ScrollView>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function TailorProfileScreen(): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();
  const router = useRouter();
  const handleSignOut = useSignOut();
  const authUser = useAppSelector((s) => s.auth.user);

  const { data, isLoading, isError, refetch } = useGetTailorMeQuery();

  const handleGoCalendar = useCallback(() => {
    router.push('/(tailor-dash)/calendar' as never);
  }, [router]);

  const handleBrowseMarketplace = useCallback(() => {
    router.push('/(tabs)' as never);
  }, [router]);

  const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg },
    content: { padding: sp.base, paddingBottom: sp['4xl'] },

    // Identity card
    profileCard: {
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: sp.md,
      marginBottom: sp.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: sp.md,
      ...elev.low,
    },
    profileInfo: { flex: 1 },
    profileName: {
      ...typo.scale.body,
      fontFamily: typo.fonts.sansBold,
      color: colors.textHigh,
    },
    tagRow: { flexDirection: 'row', alignItems: 'center', gap: sp.xs, marginTop: sp.xs, flexWrap: 'wrap' },
    verifiedText: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sansMed,
      color: colors.success,
    },
    availableDot: {
      width: 8,
      height: 8,
      borderRadius: r.pill,
      marginRight: sp.xs,
    },
    availableRow: { flexDirection: 'row', alignItems: 'center', marginTop: sp.xs },
    availableLabel: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
    },

    // Stats row
    statsRow: { flexDirection: 'row', gap: sp.sm, marginBottom: sp.md },
    statCard: {
      flex: 1,
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: sp.sm,
      alignItems: 'center',
      gap: sp.xs,
      ...elev.low,
    },
    statValue: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.accent,
    },
    statLabel: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
      textAlign: 'center',
    },

    // Generic section card
    sectionCard: {
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: sp.md,
      marginBottom: sp.md,
      ...elev.low,
    },
    sectionTitle: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansBold,
      color: colors.textMid,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: sp.sm,
    },

    // Chip rows (read-only gender chips)
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: sp.sm },
    chip: {
      borderWidth: 1,
      borderRadius: r.pill,
      paddingHorizontal: sp.md,
      paddingVertical: sp.xs,
      backgroundColor: colors.accentSubtle,
      borderColor: colors.accent,
    },
    chipLabel: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sansMed,
      color: colors.accent,
    },

    // Service areas / workshop
    areaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: sp.xs,
      paddingVertical: sp.xs,
    },
    areaText: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sans,
      color: colors.textHigh,
    },
    workshopRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: sp.sm,
      marginBottom: sp.xs,
    },
    workshopText: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sans,
      color: colors.textHigh,
      flex: 1,
    },

    // Account links
    linkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: sp.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    linkText: {
      ...typo.scale.body,
      fontFamily: typo.fonts.sans,
      color: colors.textHigh,
    },

    errorContainer: { padding: sp.base, marginTop: sp.lg },
  });

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <DashHeader title="My Profile" subtitle="Tailor Dashboard" />
        <ProfileSkeleton />
      </View>
    );
  }

  if (isError || data === undefined) {
    return (
      <View style={styles.screen}>
        <DashHeader title="My Profile" subtitle="Tailor Dashboard" />
        <View style={styles.errorContainer}>
          <ErrorBanner message="Could not load profile. Please try again." onRetry={refetch} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <DashHeader title="My Profile" subtitle="Tailor Dashboard" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

          {/* ── Identity card ─────────────────────────────────────────────── */}
          <View style={styles.profileCard}>
            <Avatar uri={authUser?.avatarUrl ?? undefined} name={authUser?.name} size={56} />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{authUser?.name ?? '—'}</Text>
              <View style={styles.tagRow}>
                <Tag label={data.tier.toUpperCase()} variant={tierVariant(data.tier)} />
                {data.isVerified && <Text style={styles.verifiedText}>✓ Verified</Text>}
              </View>
              <View style={styles.availableRow}>
                <View
                  style={[
                    styles.availableDot,
                    { backgroundColor: data.isAvailable ? colors.success : colors.textLow },
                  ]}
                />
                <Text
                  style={[
                    styles.availableLabel,
                    { color: data.isAvailable ? colors.success : colors.textLow },
                  ]}
                >
                  {data.isAvailable ? 'Accepting orders' : 'Not accepting orders'}
                </Text>
              </View>
            </View>
          </View>

          {/* ── Stats ─────────────────────────────────────────────────────── */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{data.completedOrders}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{data.currentLoad}</Text>
              <Text style={styles.statLabel}>Active Orders</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{data.weeklyCapacity}</Text>
              <Text style={styles.statLabel}>Weekly Cap</Text>
            </View>
          </View>

          {/* ── Portfolio ─────────────────────────────────────────────────── */}
          <PortfolioStrip items={data.portfolio} />

          {/* ── Genders served (read-only) ────────────────────────────────── */}
          {data.gendersServed.length > 0 && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Genders Served</Text>
              <View style={styles.chipRow}>
                {data.gendersServed.map((g) => (
                  <View key={g} style={styles.chip}>
                    <Text style={styles.chipLabel}>{GENDER_LABELS[g] ?? g}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ── Specialisations (editable) ────────────────────────────────── */}
          <SpecialisationsSection current={data.specialisations} />

          {/* ── Category pricing ──────────────────────────────────────────── */}
          <CategoryPricingCard items={data.categoryPricing} />

          {/* ── Service areas ─────────────────────────────────────────────── */}
          {data.serviceAreas.length > 0 && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Service Areas</Text>
              {data.serviceAreas.map((area) => (
                <View key={area._id} style={styles.areaRow}>
                  <IconSymbol name="mappin" size={12} color={colors.textLow} />
                  <Text style={styles.areaText}>
                    {area.area !== null ? `${area.area}, ${area.city}` : area.city}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* ── Workshop address ──────────────────────────────────────────── */}
          {data.workshopAddress !== null && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Workshop</Text>
              <View style={styles.workshopRow}>
                <IconSymbol name="building.2" size={14} color={colors.textLow} />
                <Text style={styles.workshopText}>
                  {data.workshopAddress.line1}
                  {data.workshopAddress.area !== null ? `, ${data.workshopAddress.area}` : ''}
                  {`, ${data.workshopAddress.city}`}
                </Text>
              </View>
              {data.workshopAddress.phone !== null && (
                <View style={styles.workshopRow}>
                  <IconSymbol name="phone" size={14} color={colors.textLow} />
                  <Text style={styles.workshopText}>{data.workshopAddress.phone}</Text>
                </View>
              )}
            </View>
          )}

          {/* ── Account links ─────────────────────────────────────────────── */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Account</Text>
            <Pressable style={styles.linkRow} onPress={handleGoCalendar}>
              <Text style={styles.linkText}>Calendar & Capacity</Text>
              <IconSymbol name="chevron.right" size={16} color={colors.textLow} />
            </Pressable>
            <Pressable style={[styles.linkRow, { borderBottomWidth: 0 }]} onPress={handleBrowseMarketplace}>
              <Text style={styles.linkText}>Browse Marketplace</Text>
              <IconSymbol name="chevron.right" size={16} color={colors.textLow} />
            </Pressable>
          </View>

          {/* ── Logout ────────────────────────────────────────────────────── */}
          <Button label="Log Out" onPress={handleSignOut} variant="danger" fullWidth />

        </View>
      </ScrollView>
    </View>
  );
}
