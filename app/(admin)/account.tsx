import React, { useCallback } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { useAppSelector } from '@store/index';
import { useTheme } from '@shared/theme';
import { Avatar } from '@shared/components/ui';
import { DashboardHeader } from '@features/dashboard/components/shared/DashboardHeader';
import { IconSymbol } from '@shared/components/ui/icon-symbol';
import { useSignOut } from '@shared/hooks/useSignOut';

// ─── Section Label ─────────────────────────────────────────────────────────────

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

// ─── Info Row ─────────────────────────────────────────────────────────────────

interface InfoRowProps {
  label: string;
  value: string;
}

const InfoRow = React.memo(function InfoRow({
  label,
  value,
}: InfoRowProps): React.JSX.Element {
  const { colors, sp, typo } = useTheme();

  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: sp.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    label: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
    },
    value: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansMed,
      color: colors.textHigh,
      flex: 1,
      textAlign: 'right',
    },
  });

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value} numberOfLines={1}>{value}</Text>
    </View>
  );
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AdminAccountScreen(): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);
  const handleSignOut = useSignOut();

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
    profileRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: sp.md,
      paddingBottom: sp.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    profileMeta: { flex: 1 },
    profileName: {
      ...typo.scale.subtitle,
      fontFamily: typo.fonts.serifBold,
      color: colors.textHigh,
    },
    profileRole: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
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
    logoutBtn: {
      backgroundColor: colors.error,
      borderRadius: r.md,
      paddingVertical: sp.md,
      alignItems: 'center',
    },
    logoutLabel: {
      ...typo.scale.body,
      fontFamily: typo.fonts.sansBold,
      color: colors.textOnAccent,
    },
  });

  return (
    <View style={styles.screen}>
      <DashboardHeader title="Account" showBack={false} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile */}
        <View>
          <SectionLabel label="Profile" />
          <View style={styles.card}>
            <View style={styles.profileRow}>
              <Avatar name={user?.name ?? 'Admin'} size={52} />
              <View style={styles.profileMeta}>
                <Text style={styles.profileName}>{user?.name ?? 'Admin'}</Text>
                <Text style={styles.profileRole}>Administrator</Text>
              </View>
            </View>
            <InfoRow label="Phone" value={user?.phone ?? '—'} />
            <InfoRow label="Role" value="Administrator" />
            <InfoRow label="Access" value="Full Platform" />
          </View>
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

        {/* Danger Zone */}
        <View>
          <SectionLabel label="Account" />
          <View style={styles.dangerCard}>
            <Text style={styles.dangerHeading}>Log Out</Text>
            <Text style={styles.dangerBody}>
              You will be signed out of your admin account on this device.
            </Text>
            <Pressable
              onPress={handleSignOut}
              style={({ pressed }) => [
                styles.logoutBtn,
                { opacity: pressed ? 0.75 : 1 },
              ]}
            >
              <Text style={styles.logoutLabel}>Log Out</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
