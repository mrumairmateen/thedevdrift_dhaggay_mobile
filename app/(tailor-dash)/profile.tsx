import React, { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import {
  useGetTailorDashboardQuery,
  useGetTailorCalendarQuery,
  useUpdateTailorProfileMutation,
} from '@services/tailorDashApi';
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

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Valid specialisation values per docs:
 * shalwar_kameez | suit | bridal | western | uniform | kids
 */
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

// ─── Capacity & Eid section ───────────────────────────────────────────────────

interface CapacitySectionProps {
  initialCapacity: number;
}

function CapacitySection({ initialCapacity }: CapacitySectionProps): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();
  const [weeklyCapacity, setWeeklyCapacity] = useState(initialCapacity);
  const [eidOptIn, setEidOptIn] = useState(false);
  const [updateProfile, { isLoading: isSaving }] = useUpdateTailorProfileMutation();

  const increment = useCallback(() => {
    setWeeklyCapacity((n) => Math.min(30, n + 1));
  }, []);

  const decrement = useCallback(() => {
    setWeeklyCapacity((n) => Math.max(1, n - 1));
  }, []);

  const toggleEid = useCallback((value: boolean) => {
    setEidOptIn(value);
  }, []);

  const handleSave = useCallback(() => {
    void updateProfile({ weeklyCapacity, eidOptIn })
      .unwrap()
      .then(() => {
        Alert.alert('Saved', 'Capacity settings updated.');
      })
      .catch(() => {
        Alert.alert('Error', 'Could not save settings. Please try again.');
      });
  }, [updateProfile, weeklyCapacity, eidOptIn]);

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
      marginBottom: sp.md,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: sp.md,
    },
    label: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sans,
      color: colors.textHigh,
    },
    hint: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textLow,
    },
    counterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: sp.sm,
    },
    counterBtn: {
      width: 32,
      height: 32,
      borderRadius: r.sm,
      backgroundColor: colors.accentSubtle,
      borderWidth: 1,
      borderColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    counterBtnDisabled: {
      backgroundColor: colors.panel,
      borderColor: colors.border,
    },
    counterValue: {
      ...typo.scale.body,
      fontFamily: typo.fonts.sansBold,
      color: colors.accent,
      minWidth: 28,
      textAlign: 'center',
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginBottom: sp.md,
    },
  });

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Capacity & Availability</Text>

      {/* Weekly capacity counter */}
      <View style={styles.row}>
        <View>
          <Text style={styles.label}>Weekly Capacity</Text>
          <Text style={styles.hint}>Max orders per week (1–30)</Text>
        </View>
        <View style={styles.counterRow}>
          <Pressable
            onPress={decrement}
            disabled={weeklyCapacity <= 1}
            style={[styles.counterBtn, weeklyCapacity <= 1 && styles.counterBtnDisabled]}
          >
            <IconSymbol name="minus" size={16} color={weeklyCapacity <= 1 ? colors.textLow : colors.accent} />
          </Pressable>
          <Text style={styles.counterValue}>{weeklyCapacity}</Text>
          <Pressable
            onPress={increment}
            disabled={weeklyCapacity >= 30}
            style={[styles.counterBtn, weeklyCapacity >= 30 && styles.counterBtnDisabled]}
          >
            <IconSymbol name="plus" size={16} color={weeklyCapacity >= 30 ? colors.textLow : colors.accent} />
          </Pressable>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Eid opt-in toggle */}
      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: sp.md }}>
          <Text style={styles.label}>Eid Rush Opt-in</Text>
          <Text style={styles.hint}>Accept pre-bookings during Eid season</Text>
        </View>
        <Switch
          value={eidOptIn}
          onValueChange={toggleEid}
          trackColor={{ false: colors.panel, true: colors.accentMid }}
          thumbColor={eidOptIn ? colors.accent : colors.textLow}
        />
      </View>

      <Button
        label="Save Settings"
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
        <Skeleton width="100%" height={160} radius={r.md} />
        <Skeleton width="100%" height={180} radius={r.md} />
        <Skeleton width="100%" height={80} radius={r.md} />
      </View>
    </ScrollView>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function TailorProfileScreen(): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();
  const router = useRouter();
  const handleSignOut = useSignOut();

  const { data, isLoading, isError, refetch } = useGetTailorDashboardQuery();
  const { data: calendarData } = useGetTailorCalendarQuery();

  const handleBrowseMarketplace = useCallback(() => {
    router.push('/(tabs)' as never);
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
    profileCity: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
      marginTop: 2,
    },
    tierRow: { flexDirection: 'row', marginTop: sp.xs },
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
    serviceAreaNote: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textLow,
      marginTop: sp.xs,
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

  const { profile } = data;

  return (
    <View style={styles.screen}>
      <ScreenHeader title="My Profile" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

          {/* Profile card */}
          <View style={styles.profileCard}>
            <Avatar
              uri={profile.avatarUrl ?? undefined}
              name={profile.name}
              size={56}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile.name}</Text>
              {profile.city !== null && (
                <Text style={styles.profileCity}>{profile.city}</Text>
              )}
              <View style={styles.tierRow}>
                <Tag
                  label={profile.tier.toUpperCase()}
                  variant={tierVariant(profile.tier)}
                />
              </View>
            </View>
          </View>

          {/* Specialisations */}
          <SpecialisationsSection current={profile.specialisations} />

          {/* Capacity & Eid opt-in */}
          {calendarData !== undefined ? (
            <CapacitySection initialCapacity={calendarData.weeklyCapacity} />
          ) : (
            <Skeleton width="100%" height={180} radius={r.md} />
          )}

          {/* Service areas */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Service Areas</Text>
            <Text style={styles.serviceAreaNote}>
              Manage your service areas on the Dhaggay web portal.
            </Text>
          </View>

          {/* Account section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Account</Text>
            <Pressable style={styles.linkRow} onPress={handleBrowseMarketplace}>
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
