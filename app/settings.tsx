import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@shared/components/ui/icon-symbol';
import { ScreenHeader } from '@shared/components/ui/ScreenHeader';
import { useTheme, useThemeControls } from '@shared/theme';
import type { ColorScheme } from '@shared/theme';
import { useAppDispatch, useAppSelector } from '@store/index';
import { openAuthSheet } from '@store/authSlice';

// Color swatch hex values are legitimate UI data — they ARE the swatches, not style tokens.
const COLOR_SCHEMES: ReadonlyArray<{
  value: ColorScheme;
  label: string;
  hex: string;
}> = [
  { value: 'cobalt',    label: 'Cobalt',    hex: '#1E4FCC' },
  { value: 'jungle',    label: 'Jungle',    hex: '#1A6B3C' },
  { value: 'amethyst',  label: 'Amethyst',  hex: '#6D28D9' },
] as const;

export default function SettingsScreen(): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();
  const { scheme, mode, setScheme, toggleMode } = useThemeControls();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const user = useAppSelector(s => s.auth.user);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleSignIn = useCallback(() => {
    dispatch(openAuthSheet('login'));
  }, [dispatch]);

  const handleDashboard = useCallback(() => {
    router.push('/(dashboard)' as never);
  }, [router]);

  const handlePrivacyPolicy = useCallback(() => {
    router.push('/modal' as never);
  }, [router]);

  const handleTerms = useCallback(() => {
    router.push('/modal' as never);
  }, [router]);

  const handleScheme = useCallback((s: ColorScheme) => {
    setScheme(s);
  }, [setScheme]);

  const styles = StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    scrollContent: {
      paddingBottom: insets.bottom + sp['4xl'],
    },
    // ── Section header ───────────────────────────────────────────────────
    sectionLabel: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansMed,
      color: colors.textLow,
      paddingHorizontal: sp.base,
      paddingVertical: sp.sm,
      backgroundColor: colors.surface,
    },
    // ── Settings rows ────────────────────────────────────────────────────
    settingsCard: {
      backgroundColor: colors.elevated,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: r.lg,
      marginHorizontal: sp.base,
      overflow: 'hidden',
      ...elev.low,
    },
    settingsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: sp.base,
      paddingVertical: sp.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.elevated,
    },
    settingsRowLast: {
      borderBottomWidth: 0,
    },
    rowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    rowIconWrap: {
      width: 32,
      height: 32,
      borderRadius: r.sm,
      backgroundColor: colors.accentSubtle,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: sp.md,
    },
    rowLabel: {
      ...typo.scale.body,
      fontFamily: typo.fonts.sansMed,
      color: colors.textHigh,
    },
    rowSublabel: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textLow,
    },
    rowValueText: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sans,
      color: colors.textLow,
    },
    // ── Scheme picker ────────────────────────────────────────────────────
    schemePicker: {
      paddingHorizontal: sp.base,
      paddingVertical: sp.md,
      backgroundColor: colors.elevated,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    schemePickerLabel: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansMed,
      color: colors.textHigh,
      marginBottom: sp.md,
    },
    schemeSwatches: {
      flexDirection: 'row',
      gap: sp['2xl'],
    },
    swatchItem: {
      alignItems: 'center',
      gap: sp.xs,
    },
    swatchCircle: {
      width: 36,
      height: 36,
      borderRadius: r.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    swatchCheckmark: {
      // checkmark icon rendered inside
    },
    swatchLabel: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sansMed,
      color: colors.textMid,
    },
    swatchLabelActive: {
      color: colors.textHigh,
    },
    // ── Account rows ─────────────────────────────────────────────────────
    phoneText: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sans,
      color: colors.textLow,
    },
    signInLink: {
      ...typo.scale.body,
      fontFamily: typo.fonts.sansMed,
      color: colors.accent,
    },
    // ── Version ──────────────────────────────────────────────────────────
    versionText: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sans,
      color: colors.textLow,
    },
    spacer: {
      height: sp.xl,
    },
  });

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Settings" onBack={handleBack} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Appearance ── */}
        <View style={styles.spacer} />
        <Text style={styles.sectionLabel}>APPEARANCE</Text>

        <View style={styles.settingsCard}>
          {/* Dark / Light mode toggle */}
          <View style={styles.settingsRow}>
            <View style={styles.rowLeft}>
              <View style={styles.rowIconWrap}>
                <IconSymbol
                  name={mode === 'dark' ? 'moon.stars.fill' : 'sun.max.fill'}
                  size={18}
                  color={colors.accent}
                />
              </View>
              <View>
                <Text style={styles.rowLabel}>Dark Mode</Text>
                <Text style={styles.rowSublabel}>
                  {mode === 'dark' ? 'Currently dark' : 'Currently light'}
                </Text>
              </View>
            </View>
            <Switch
              value={mode === 'dark'}
              onValueChange={toggleMode}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor={colors.elevated}
            />
          </View>

          {/* Colour scheme picker */}
          <View style={[styles.schemePicker, styles.settingsRowLast]}>
            <Text style={styles.schemePickerLabel}>Colour Scheme</Text>
            <View style={styles.schemeSwatches}>
              {COLOR_SCHEMES.map(s => {
                const active = s.value === scheme;
                return (
                  <Pressable
                    key={s.value}
                    style={styles.swatchItem}
                    onPress={() => handleScheme(s.value)}
                  >
                    <View
                      style={[
                        styles.swatchCircle,
                        {
                          backgroundColor: s.hex,
                          borderWidth: active ? 3 : 2,
                          borderColor: active ? colors.borderStrong : colors.border,
                        },
                      ]}
                    >
                      {active && (
                        <IconSymbol name="checkmark.seal.fill" size={16} color={colors.textOnAccent} />
                      )}
                    </View>
                    <Text style={[styles.swatchLabel, active && styles.swatchLabelActive]}>
                      {s.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {/* ── Account ── */}
        <View style={styles.spacer} />
        <Text style={styles.sectionLabel}>ACCOUNT</Text>

        <View style={styles.settingsCard}>
          {user !== null ? (
            <>
              <View style={styles.settingsRow}>
                <View style={styles.rowLeft}>
                  <View style={styles.rowIconWrap}>
                    <IconSymbol name="person.fill" size={18} color={colors.accent} />
                  </View>
                  <View>
                    <Text style={styles.rowLabel}>{user.name}</Text>
                    <Text style={styles.phoneText}>{user.phone}</Text>
                  </View>
                </View>
              </View>
              <Pressable
                style={[styles.settingsRow, styles.settingsRowLast]}
                onPress={handleDashboard}
              >
                <View style={styles.rowLeft}>
                  <View style={styles.rowIconWrap}>
                    <IconSymbol name="chart.bar.fill" size={18} color={colors.accent} />
                  </View>
                  <Text style={styles.rowLabel}>Go to Dashboard</Text>
                </View>
                <IconSymbol name="chevron.right" size={14} color={colors.textLow} />
              </Pressable>
            </>
          ) : (
            <Pressable
              style={[styles.settingsRow, styles.settingsRowLast]}
              onPress={handleSignIn}
            >
              <View style={styles.rowLeft}>
                <View style={styles.rowIconWrap}>
                  <IconSymbol name="person.fill" size={18} color={colors.accent} />
                </View>
                <Text style={styles.signInLink}>Sign In</Text>
              </View>
              <IconSymbol name="chevron.right" size={14} color={colors.textLow} />
            </Pressable>
          )}
        </View>

        {/* ── About ── */}
        <View style={styles.spacer} />
        <Text style={styles.sectionLabel}>ABOUT</Text>

        <View style={styles.settingsCard}>
          <View style={styles.settingsRow}>
            <View style={styles.rowLeft}>
              <View style={styles.rowIconWrap}>
                <IconSymbol name="sparkles" size={18} color={colors.accent} />
              </View>
              <Text style={styles.rowLabel}>Dhaggay</Text>
            </View>
            <Text style={styles.versionText}>v1.0.0</Text>
          </View>

          <Pressable style={styles.settingsRow} onPress={handlePrivacyPolicy}>
            <View style={styles.rowLeft}>
              <View style={styles.rowIconWrap}>
                <IconSymbol name="doc.on.doc.fill" size={18} color={colors.accent} />
              </View>
              <Text style={styles.rowLabel}>Privacy Policy</Text>
            </View>
            <IconSymbol name="chevron.right" size={14} color={colors.textLow} />
          </Pressable>

          <Pressable style={[styles.settingsRow, styles.settingsRowLast]} onPress={handleTerms}>
            <View style={styles.rowLeft}>
              <View style={styles.rowIconWrap}>
                <IconSymbol name="doc.on.doc.fill" size={18} color={colors.accent} />
              </View>
              <Text style={styles.rowLabel}>Terms of Service</Text>
            </View>
            <IconSymbol name="chevron.right" size={14} color={colors.textLow} />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
