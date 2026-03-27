import React, { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import {
  useGetPlatformSettingsQuery,
  useUpdatePlatformSettingsMutation,
} from '@services/adminApi';
import type { PlatformSettings } from '@services/adminApi';
import { useTheme } from '@shared/theme';
import {
  ErrorBanner,
  ScreenHeader,
  Skeleton,
} from '@shared/components/ui';

// ─── Section Card ─────────────────────────────────────────────────────────────

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
}

function SectionCard({ title, children }: SectionCardProps): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      padding: sp.md,
      borderWidth: 1,
      borderColor: colors.border,
      gap: sp.md,
      ...elev.low,
    },
    title: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.serifBold,
      color: colors.textHigh,
    },
  });

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}

// ─── Field Row ────────────────────────────────────────────────────────────────

interface FieldRowProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  hint?: string;
  keyboardType?: 'decimal-pad' | 'number-pad';
}

function FieldRow({ label, value, onChangeText, hint, keyboardType = 'decimal-pad' }: FieldRowProps): React.JSX.Element {
  const { colors, sp, r, typo } = useTheme();

  const styles = StyleSheet.create({
    wrap: { gap: sp.xs },
    label: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sansMed,
      color: colors.textMid,
    },
    input: {
      backgroundColor: colors.inputBg,
      borderRadius: r.sm,
      borderWidth: 1,
      borderColor: colors.border,
      padding: sp.sm,
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sans,
      color: colors.textHigh,
    },
    hint: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textLow,
    },
  });

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholderTextColor={colors.textLow}
      />
      {hint !== undefined && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SettingsSkeleton(): React.JSX.Element {
  const { colors, sp, r } = useTheme();

  const styles = StyleSheet.create({
    block: {
      height: 120,
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: sp.md,
    },
  });

  return (
    <View style={{ padding: sp.base, gap: sp.md }}>
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={styles.block}>
          <Skeleton width={120} height={16} />
        </View>
      ))}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PlatformSettingsScreen(): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();
  const router = useRouter();

  const { data, isLoading, isError, refetch } = useGetPlatformSettingsQuery();
  const [updatePlatformSettings, { isLoading: isSaving }] = useUpdatePlatformSettingsMutation();

  // Form state
  const [commissionRate, setCommissionRate] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [loyaltyConversionRate, setLoyaltyConversionRate] = useState('');
  const [loyaltyExpiryDays, setLoyaltyExpiryDays] = useState('');
  const [minRedemptionPts, setMinRedemptionPts] = useState('');
  const [tierPremium, setTierPremium] = useState('');
  const [tierMaster, setTierMaster] = useState('');
  const [saved, setSaved] = useState(false);

  // Hydrate form from API data
  useEffect(() => {
    if (data === undefined) return;
    const pct = Math.round(data.commissionRate * 100);
    setCommissionRate(String(pct));
    setMaintenanceMode(data.maintenanceMode);
    setLoyaltyConversionRate(String(data.loyaltyConversionRate));
    setLoyaltyExpiryDays(String(data.loyaltyExpiryDays));
    setMinRedemptionPts(String(data.minRedemptionPts));
    if (data.tierThresholds !== undefined) {
      setTierPremium(String(data.tierThresholds.premium));
      setTierMaster(String(data.tierThresholds.master));
    }
  }, [data]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleSave = useCallback(() => {
    const rate = parseFloat(commissionRate);
    const payload: Partial<PlatformSettings> = {
      commissionRate: isNaN(rate) ? undefined : rate / 100,
      maintenanceMode,
      loyaltyConversionRate: parseInt(loyaltyConversionRate, 10) || undefined,
      loyaltyExpiryDays: parseInt(loyaltyExpiryDays, 10) || undefined,
      minRedemptionPts: parseInt(minRedemptionPts, 10) || undefined,
      tierThresholds: {
        premium: parseInt(tierPremium, 10) || 50,
        master: parseInt(tierMaster, 10) || 200,
      },
    };
    void updatePlatformSettings(payload).then(() => {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  }, [
    updatePlatformSettings,
    commissionRate,
    maintenanceMode,
    loyaltyConversionRate,
    loyaltyExpiryDays,
    minRedemptionPts,
    tierPremium,
    tierMaster,
  ]);

  const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg },
    scroll: { flex: 1 },
    content: { padding: sp.base, gap: sp.md, paddingBottom: sp['4xl'] },
    maintenanceCard: {
      borderRadius: r.md,
      padding: sp.md,
      borderWidth: 1,
      gap: sp.sm,
      ...elev.low,
    },
    maintenanceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    maintenanceTitle: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
    },
    maintenanceDesc: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      flex: 1,
      marginRight: sp.sm,
    },
    warningBanner: {
      backgroundColor: colors.errorSubtle,
      borderRadius: r.sm,
      padding: sp.sm,
      borderWidth: 1,
      borderColor: colors.error,
    },
    warningText: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sansBold,
      color: colors.error,
      textAlign: 'center',
    },
    saveBtn: {
      backgroundColor: colors.accent,
      borderRadius: r.sm,
      paddingVertical: sp.md,
      alignItems: 'center',
    },
    saveBtnLabel: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.textOnAccent,
    },
    successBanner: {
      backgroundColor: colors.successSubtle,
      borderRadius: r.sm,
      padding: sp.sm,
      borderWidth: 1,
      borderColor: colors.success,
    },
    successText: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sansBold,
      color: colors.success,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Platform Settings" onBack={handleBack} />

      {isLoading ? (
        <SettingsSkeleton />
      ) : isError ? (
        <View style={{ padding: sp.base }}>
          <ErrorBanner
            message="Could not load platform settings. Please try again."
            onRetry={refetch}
          />
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Maintenance mode */}
          <View
            style={[
              styles.maintenanceCard,
              {
                backgroundColor: maintenanceMode ? colors.errorSubtle : colors.elevated,
                borderColor: maintenanceMode ? colors.error : colors.border,
              },
            ]}
          >
            <View style={styles.maintenanceRow}>
              <Text
                style={[
                  styles.maintenanceTitle,
                  { color: maintenanceMode ? colors.error : colors.textHigh },
                ]}
              >
                Maintenance Mode
              </Text>
              <Switch
                value={maintenanceMode}
                onValueChange={setMaintenanceMode}
                trackColor={{ false: colors.border, true: colors.error }}
                thumbColor={maintenanceMode ? colors.textOnAccent : colors.textLow}
              />
            </View>
            <Text
              style={[
                styles.maintenanceDesc,
                { color: maintenanceMode ? colors.error : colors.textMid },
              ]}
            >
              {maintenanceMode
                ? 'Platform is in maintenance mode. Non-admin users see a maintenance page.'
                : 'When enabled, non-admin users will see a maintenance page.'}
            </Text>
            {maintenanceMode && (
              <View style={styles.warningBanner}>
                <Text style={styles.warningText}>MAINTENANCE MODE ACTIVE</Text>
              </View>
            )}
          </View>

          {/* Revenue */}
          <SectionCard title="Revenue">
            <FieldRow
              label="Platform Commission (%)"
              value={commissionRate}
              onChangeText={setCommissionRate}
              hint="Applied to stitching fee per order. Default: 17"
            />
          </SectionCard>

          {/* Loyalty */}
          <SectionCard title="Loyalty Programme">
            <FieldRow
              label="Points for PKR 50 off"
              value={loyaltyConversionRate}
              onChangeText={setLoyaltyConversionRate}
              hint="Number of points equivalent to PKR 50 discount"
              keyboardType="number-pad"
            />
            <FieldRow
              label="Points Expiry (days)"
              value={loyaltyExpiryDays}
              onChangeText={setLoyaltyExpiryDays}
              keyboardType="number-pad"
            />
            <FieldRow
              label="Minimum Redemption (points)"
              value={minRedemptionPts}
              onChangeText={setMinRedemptionPts}
              keyboardType="number-pad"
            />
          </SectionCard>

          {/* Tier Thresholds */}
          <SectionCard title="Tailor Tier Thresholds (Orders)">
            <FieldRow
              label="Standard → Premium (orders)"
              value={tierPremium}
              onChangeText={setTierPremium}
              keyboardType="number-pad"
            />
            <FieldRow
              label="Premium → Master (orders)"
              value={tierMaster}
              onChangeText={setTierMaster}
              keyboardType="number-pad"
            />
          </SectionCard>

          {/* Success banner */}
          {saved && (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>Settings saved successfully.</Text>
            </View>
          )}

          {/* Save */}
          <Pressable
            style={[styles.saveBtn, isSaving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text style={styles.saveBtnLabel}>{isSaving ? 'Saving...' : 'Save Settings'}</Text>
          </Pressable>
        </ScrollView>
      )}
    </View>
  );
}
