import React, { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useAppSelector } from '@store/index';
import { useTheme } from '@shared/theme';
import { useSignOut } from '@shared/hooks/useSignOut';
import { Avatar } from '@shared/components/ui';
import { IconSymbol } from '@shared/components/ui/icon-symbol';

// ─── Section Label ─────────────────────────────────────────────────────────────

function SectionLabel({ text }: { text: string }): React.JSX.Element {
  const { colors, sp, typo } = useTheme();

  const styles = StyleSheet.create({
    label: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansMed,
      color: colors.textLow,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: sp.sm,
    },
  });

  return <Text style={styles.label}>{text}</Text>;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function DeliveryProfileScreen(): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);
  const handleSignOut = useSignOut();

  const handleBrowseShop = useCallback(() => {
    router.push('/(tabs)' as never);
  }, [router]);

  const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg },
    header: {
      backgroundColor: colors.navSolid,
      paddingTop: insets.top + sp.sm,
      paddingHorizontal: sp.base,
      paddingBottom: sp.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      ...elev.high,
    },
    headerTitle: {
      ...typo.scale.title3,
      fontFamily: typo.fonts.serifBold,
      color: colors.textHigh,
    },
    content: {
      padding: sp.base,
      paddingBottom: sp['4xl'],
      gap: sp.xl,
    },
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
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: sp.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    infoLabel: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
    },
    infoValue: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansMed,
      color: colors.textHigh,
    },
    navRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: sp.sm,
    },
    navLabel: {
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Section 1 — Rider Profile */}
        <View>
          <SectionLabel text="Rider Profile" />
          <View style={styles.card}>
            {/* Profile row */}
            <View style={styles.profileRow}>
              <Avatar size={52} name={user?.name ?? 'Rider'} />
              <View>
                <Text style={styles.profileName}>{user?.name ?? 'Rider'}</Text>
                <Text style={styles.profileRole}>Delivery Rider</Text>
              </View>
            </View>

            {/* Info rows */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{user?.phone ?? '—'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Role</Text>
              <Text style={styles.infoValue}>Delivery Rider</Text>
            </View>
          </View>
        </View>

        {/* Section 2 — Marketplace */}
        <View>
          <SectionLabel text="Marketplace" />
          <View style={styles.card}>
            <Pressable style={styles.navRow} onPress={handleBrowseShop}>
              <Text style={styles.navLabel}>Browse Marketplace</Text>
              <IconSymbol name="chevron.right" size={16} color={colors.textLow} />
            </Pressable>
          </View>
        </View>

        {/* Section 3 — Account / Sign Out */}
        <View>
          <SectionLabel text="Account" />
          <View style={styles.dangerCard}>
            <Text style={styles.dangerHeading}>Log Out</Text>
            <Text style={styles.dangerBody}>
              You will be signed out of your rider account on this device.
            </Text>
            <Pressable
              onPress={handleSignOut}
              style={({ pressed }) => [styles.logoutBtn, { opacity: pressed ? 0.75 : 1 }]}
            >
              <Text style={styles.logoutLabel}>Log Out</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
