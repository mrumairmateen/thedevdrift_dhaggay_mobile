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
import { useSignOut } from '@shared/hooks/useSignOut';
import { useTheme } from '@shared/theme';
import { Avatar } from '@shared/components/ui';
import { IconSymbol } from '@shared/components/ui/icon-symbol';
import { DashHeader } from '@shared/components/DashHeader';

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

export interface InfoRowProps {
  label: string;
  value: string;
}

export const InfoRow = React.memo(function InfoRow({
  label,
  value,
}: InfoRowProps): React.JSX.Element {
  const { colors, sp, r, typo } = useTheme();

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

// ─── Note Row ─────────────────────────────────────────────────────────────────

export interface NoteRowProps {
  message: string;
}

export const NoteRow = React.memo(function NoteRow({
  message,
}: NoteRowProps): React.JSX.Element {
  const { colors, sp, r, typo } = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.panel,
      borderRadius: r.sm,
      padding: sp.md,
    },
    text: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SellerSettingsScreen(): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);
  const handleSignOut = useSignOut();

  const handleBrowseShop = useCallback(() => {
    router.push('/(tabs)' as never);
  }, [router]);

  const handleGoPromotions = useCallback(() => {
    router.push('/(seller)/promotions' as never);
  }, [router]);

  const handleGoReviews = useCallback(() => {
    router.push('/(seller)/reviews' as never);
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
    cardTitle: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.serifBold,
      color: colors.textHigh,
      marginBottom: sp.xs,
    },
    webNote: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textLow,
      fontStyle: 'italic',
      marginTop: sp.xs,
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
    navRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: sp.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    navRowLast: {
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
  });

  const userName = user?.name ?? 'Seller';
  const userPhone = user?.phone ?? '';

  return (
    <View style={styles.screen}>
      <DashHeader title="Store Settings" subtitle="Seller Dashboard" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Store Profile */}
        <View>
          <SectionLabel label="Store Profile" />
          <View style={styles.card}>
            <View style={styles.profileRow}>
              <Avatar name={userName} size={52} />
              <View style={styles.profileMeta}>
                <Text style={styles.profileName}>{userName}</Text>
                <Text style={styles.profileRole}>Seller</Text>
              </View>
            </View>
            <InfoRow label="Phone" value={userPhone} />
            <Text style={styles.webNote}>
              Edit store name, logo, and description from the web portal.
            </Text>
          </View>
        </View>

        {/* Business Info */}
        <View>
          <SectionLabel label="Business Info" />
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Location & Policy</Text>
            <NoteRow message="City, return policy, and delivery zones are managed from your web seller portal." />
          </View>
        </View>

        {/* Payout Info */}
        <View>
          <SectionLabel label="Payout Info" />
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Bank Details</Text>
            <NoteRow message="Bank account details for payouts are managed securely via the web portal. Payouts are processed every 7 days." />
          </View>
        </View>

        {/* Marketplace */}
        <View>
          <SectionLabel label="Marketplace" />
          <View style={styles.card}>
            <Pressable style={styles.navRowLast} onPress={handleBrowseShop}>
              <Text style={styles.navLabel}>Browse Marketplace</Text>
              <IconSymbol name="chevron.right" size={16} color={colors.textLow} />
            </Pressable>
          </View>
        </View>

        {/* Manage Store */}
        <View>
          <SectionLabel label="Manage Store" />
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Store Tools</Text>
            <Pressable style={styles.navRow} onPress={handleGoPromotions}>
              <Text style={styles.navLabel}>Promotions</Text>
              <IconSymbol name="chevron.right" size={16} color={colors.textLow} />
            </Pressable>
            <Pressable style={styles.navRowLast} onPress={handleGoReviews}>
              <Text style={styles.navLabel}>Reviews</Text>
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
              You will be signed out of your seller account on this device.
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
