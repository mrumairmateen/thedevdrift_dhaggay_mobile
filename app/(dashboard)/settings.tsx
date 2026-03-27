import React, { useCallback } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { useGetProfileQuery } from '@services/userApi';
import { useSignOut } from '@shared/hooks/useSignOut';
import { useTheme } from '@shared/theme';
import { ErrorBanner, Skeleton } from '@shared/components/ui';
import { IconSymbol } from '@shared/components/ui/icon-symbol';

import { DashboardHeader } from '@features/dashboard/components/shared/DashboardHeader';
import { ProfileSection } from '@features/dashboard/components/settings/ProfileSection';
import { PasswordSection } from '@features/dashboard/components/settings/PasswordSection';
import { NotificationToggles } from '@features/dashboard/components/settings/NotificationToggles';
import { AddressList } from '@features/dashboard/components/settings/AddressList';

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SettingsSkeleton(): React.JSX.Element {
  const { sp, r } = useTheme();
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={{ padding: sp.base, gap: sp.xl }}>
        <Skeleton width="100%" height={220} radius={r.lg} />
        <Skeleton width="100%" height={60} radius={r.lg} />
        <Skeleton width="100%" height={150} radius={r.lg} />
        <Skeleton width="100%" height={120} radius={r.lg} />
      </View>
    </ScrollView>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }): React.JSX.Element {
  const { colors, sp, typo } = useTheme();
  const styles = StyleSheet.create({
    text: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansMed,
      color: colors.textLow,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: sp.sm,
    },
  });
  return <Text style={styles.text}>{label}</Text>;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SettingsScreen(): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();
  const router = useRouter();
  const handleSignOut = useSignOut();

  const { data: profile, isLoading, isError, refetch } = useGetProfileQuery();

  const handleBrowseShop = useCallback(() => {
    router.push('/(tabs)' as never);
  }, [router]);

  const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg },
    content: { padding: sp.base, paddingBottom: sp['4xl'], gap: sp.xl },
    card: {
      backgroundColor: colors.elevated,
      borderRadius: r.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: sp.base,
      gap: sp.sm,
      ...elev.low,
    },
    marketplaceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: sp.sm,
    },
    marketplaceLabel: {
      ...typo.scale.body,
      fontFamily: typo.fonts.sans,
      color: colors.textHigh,
    },
    signOutBtn: {
      backgroundColor: colors.error,
      borderRadius: r.md,
      paddingVertical: sp.md,
      alignItems: 'center',
    },
    signOutLabel: {
      ...typo.scale.body,
      fontFamily: typo.fonts.sansBold,
      color: colors.textOnAccent,
    },
    dangerCard: {
      backgroundColor: colors.errorSubtle,
      borderRadius: r.lg,
      borderWidth: 1,
      borderColor: colors.error,
      padding: sp.base,
      gap: sp.md,
      ...elev.low,
    },
    dangerHeading: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.serifBold,
      color: colors.error,
    },
    dangerBody: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
    },
  });

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <DashboardHeader title="Settings" showBack={false} onSignOut={handleSignOut} />
        <SettingsSkeleton />
      </View>
    );
  }

  if (isError || !profile) {
    return (
      <View style={styles.screen}>
        <DashboardHeader title="Settings" showBack={false} onSignOut={handleSignOut} />
        <View style={{ padding: sp.base, marginTop: sp.lg }}>
          <ErrorBanner
            message="Could not load your profile. Please try again."
            onRetry={refetch}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <DashboardHeader title="Settings" showBack={false} onSignOut={handleSignOut} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile */}
        <View>
          <SectionLabel label="Profile" />
          <ProfileSection profile={profile} />
        </View>

        {/* Security */}
        <View>
          <SectionLabel label="Security" />
          <PasswordSection />
        </View>

        {/* Notifications */}
        <View>
          <SectionLabel label="Notifications" />
          <NotificationToggles prefs={profile.notifications ?? { whatsapp: false, email: false, push: false }} />
        </View>

        {/* Addresses */}
        <View>
          <SectionLabel label="Saved Addresses" />
          <AddressList addresses={profile.addresses ?? []} />
        </View>

        {/* Marketplace */}
        <View>
          <SectionLabel label="Marketplace" />
          <View style={styles.card}>
            <Pressable style={styles.marketplaceRow} onPress={handleBrowseShop}>
              <Text style={styles.marketplaceLabel}>Browse Marketplace</Text>
              <IconSymbol name="chevron.right" size={16} color={colors.textLow} />
            </Pressable>
          </View>
        </View>

        {/* Danger zone: Log Out */}
        <View>
          <SectionLabel label="Account" />
          <View style={styles.dangerCard}>
            <Text style={styles.dangerHeading}>Log Out</Text>
            <Text style={styles.dangerBody}>
              You will be signed out of your account on this device.
            </Text>
            <Pressable
              onPress={handleSignOut}
              style={({ pressed }) => [
                styles.signOutBtn,
                { opacity: pressed ? 0.75 : 1 },
              ]}
            >
              <Text style={styles.signOutLabel}>Log Out</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
