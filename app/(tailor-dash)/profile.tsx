import React, { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import {
  useGetTailorProfileQuery,
  useUpdateTailorProfileMutation,
} from '@services/tailorDashApi';
import type { TailorProfileData } from '@services/tailorDashApi';
import { useAppSelector } from '@store/index';
import { useTheme } from '@shared/theme';
import { useSignOut } from '@shared/hooks/useSignOut';
import {
  Avatar,
  Button,
  ErrorBanner,
  ScreenHeader,
  Skeleton,
  Tag,
} from '@shared/components/ui';
import { IconSymbol } from '@shared/components/ui/icon-symbol';
import { formatPkr } from '@shared/utils';

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_SPECIALISATIONS = [
  'shalwar_kameez',
  'suit',
  'bridal',
  'western',
  'uniform',
  'kids',
] as const;

type Specialisation = typeof ALL_SPECIALISATIONS[number];

function formatSpec(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function tierVariant(tier: 'standard' | 'premium' | 'master'): 'default' | 'accent' | 'warning' {
  if (tier === 'master') return 'warning';
  if (tier === 'premium') return 'accent';
  return 'default';
}

// ─── Specialisations section ──────────────────────────────────────────────────

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
      <Button
        label="Save Specialisations"
        onPress={handleSave}
        loading={isSaving}
        variant="primary"
        fullWidth
      />
    </View>
  );
}

// ─── Profile skeleton ─────────────────────────────────────────────────────────

function ProfileSkeleton(): React.JSX.Element {
  const { sp, r, colors } = useTheme();

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      borderWidth: 1,
      borderColor: colors.border,
      height: 96,
      marginBottom: sp.md,
    },
    content: { padding: sp.base, gap: sp.md, marginTop: sp.base },
  });

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={styles.card} />
        <Skeleton width="100%" height={80} radius={r.md} />
        <Skeleton width="100%" height={160} radius={r.md} />
        <Skeleton width="100%" height={120} radius={r.md} />
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

  const { data, isLoading, isError, refetch } = useGetTailorProfileQuery();

  const handleBrowseMarketplace = useCallback(() => {
    router.push('/(tabs)' as never);
  }, [router]);

  const handleGoCalendar = useCallback(() => {
    router.push('/(tailor-dash)/calendar' as never);
  }, [router]);

  const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg },
    content: { padding: sp.base, paddingBottom: sp['4xl'] },
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
    tagRow: { flexDirection: 'row', alignItems: 'center', gap: sp.xs, marginTop: sp.xs },
    verifiedText: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sansMed,
      color: colors.success,
    },
    statsRow: {
      flexDirection: 'row',
      gap: sp.sm,
      marginBottom: sp.md,
    },
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
        <ScreenHeader title="My Profile" />
        <ProfileSkeleton />
      </View>
    );
  }

  if (isError || data === undefined) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="My Profile" />
        <View style={styles.errorContainer}>
          <ErrorBanner
            message="Could not load profile. Please try again."
            onRetry={refetch}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader title="My Profile" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

          {/* Identity card */}
          <View style={styles.profileCard}>
            <Avatar
              uri={authUser?.avatarUrl ?? undefined}
              name={authUser?.name}
              size={56}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{authUser?.name ?? '—'}</Text>
              <View style={styles.tagRow}>
                <Tag
                  label={data.tier.toUpperCase()}
                  variant={tierVariant(data.tier)}
                />
                {data.isVerified && (
                  <Text style={styles.verifiedText}>✓ Verified</Text>
                )}
              </View>
            </View>
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{data.rating.toFixed(1)} ★</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{data.reviewCount}</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{data.completedOrders}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>

          {/* Specialisations */}
          <SpecialisationsSection current={data.specialisations} />

          {/* Pricing */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Pricing</Text>
            {(
              [
                ['Shalwar Kameez', data.pricing.shalwarKameez],
                ['Suit', data.pricing.suit],
                ['Bridal', data.pricing.bridal],
                ['Custom', data.pricing.custom],
              ] as Array<[string, number]>
            ).map(([label, price]) => (
              <View key={label} style={[styles.areaRow, { justifyContent: 'space-between' }]}>
                <Text style={styles.areaText}>{label}</Text>
                <Text style={[styles.areaText, { color: colors.accent, fontFamily: typo.fonts.sansBold }]}>
                  {formatPkr(price)}
                </Text>
              </View>
            ))}
          </View>

          {/* Service areas */}
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

          {/* Workshop address */}
          {data.workshopAddress !== null && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Workshop</Text>
              <View style={styles.workshopRow}>
                <IconSymbol name="building.2" size={14} color={colors.textLow} />
                <Text style={styles.workshopText}>
                  {data.workshopAddress.line1}, {data.workshopAddress.area !== null ? `${data.workshopAddress.area}, ` : ''}{data.workshopAddress.city}
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

          {/* Quick links */}
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

          {/* Logout */}
          <Button
            label="Log Out"
            onPress={handleSignOut}
            variant="danger"
            fullWidth
          />

        </View>
      </ScrollView>
    </View>
  );
}
