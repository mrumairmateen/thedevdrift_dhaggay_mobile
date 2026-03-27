import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme, useThemeControls } from '@shared/theme';
import type { ColorScheme } from '@shared/theme';
import { useRouter } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SCHEMES: Array<{ value: ColorScheme; label: string; accentLight: string; accentDark: string }> = [
  { value: 'cobalt', label: 'Cobalt', accentLight: '#1A4FCC', accentDark: '#5B8DEF' },
  { value: 'jungle', label: 'Jungle', accentLight: '#1A6B3C', accentDark: '#3D9A60' },
  { value: 'amethyst', label: 'Amethyst', accentLight: '#6D28D9', accentDark: '#8B5CF6' },
];

export default function SettingsScreen() {
  const { colors, sp, r, typo, elev } = useTheme();
  const { scheme, mode, setScheme, toggleMode } = useThemeControls();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, elev.high, {
        backgroundColor: colors.navSolid,
        paddingTop: insets.top + sp.sm,
        paddingHorizontal: sp.base,
        paddingBottom: sp.md,
        borderBottomColor: colors.border,
      }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <IconSymbol name="chevron.left" size={20} color={colors.textHigh} />
          <Text style={[typo.scale.body, { fontFamily: typo.fonts.sansMed, color: colors.textHigh }]}>Back</Text>
        </Pressable>
        <Text style={[typo.scale.title3, { fontFamily: typo.fonts.serifBold, color: colors.textHigh }]}>
          Settings
        </Text>
        {/* spacer to centre title */}
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + sp['4xl'], paddingTop: sp.xl }}
      >
        {/* Appearance section */}
        <View style={[styles.sectionLabel, { paddingHorizontal: sp.base, marginBottom: sp.sm }]}>
          <Text style={[typo.scale.label, { fontFamily: typo.fonts.sansMed, color: colors.textLow, letterSpacing: 1.5 }]}>
            APPEARANCE
          </Text>
        </View>

        <View style={[styles.card, elev.low, {
          backgroundColor: colors.elevated,
          borderColor: colors.border,
          borderRadius: r.lg,
          marginHorizontal: sp.base,
          overflow: 'hidden',
        }]}>
          {/* Dark mode toggle row */}
          <View style={[styles.row, {
            paddingHorizontal: sp.base,
            paddingVertical: sp.md,
            borderBottomColor: colors.border,
            borderBottomWidth: 1,
          }]}>
            <View style={styles.rowLeft}>
              <IconSymbol
                name={mode === 'dark' ? 'moon.stars.fill' : 'sun.max.fill'}
                size={20}
                color={colors.accent}
              />
              <View style={{ marginLeft: sp.md }}>
                <Text style={[typo.scale.body, { fontFamily: typo.fonts.sansMed, color: colors.textHigh }]}>
                  Dark Mode
                </Text>
                <Text style={[typo.scale.caption, { fontFamily: typo.fonts.sans, color: colors.textLow }]}>
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
          <View style={[{
            paddingHorizontal: sp.base,
            paddingVertical: sp.md,
          }]}>
            <Text style={[typo.scale.bodySmall, { fontFamily: typo.fonts.sansMed, color: colors.textHigh, marginBottom: sp.md }]}>
              Colour Scheme
            </Text>
            <View style={styles.schemePills}>
              {SCHEMES.map(s => {
                const active = s.value === scheme;
                const accentColor = mode === 'dark' ? s.accentDark : s.accentLight;
                return (
                  <Pressable
                    key={s.value}
                    onPress={() => setScheme(s.value)}
                    style={[styles.schemePill, {
                      borderRadius: r.pill,
                      borderWidth: active ? 2 : 1,
                      borderColor: active ? accentColor : colors.border,
                      paddingHorizontal: sp.lg,
                      paddingVertical: sp.sm,
                      backgroundColor: active ? accentColor + '22' : colors.chipBg,
                    }]}
                  >
                    {/* Color dot */}
                    <View style={[styles.colorDot, {
                      backgroundColor: accentColor,
                      borderRadius: r.pill,
                    }]} />
                    <Text style={[typo.scale.bodySmall, {
                      fontFamily: typo.fonts.sansMed,
                      color: active ? accentColor : colors.textMid,
                    }]}>
                      {s.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {/* App info */}
        <View style={[styles.sectionLabel, { paddingHorizontal: sp.base, marginBottom: sp.sm, marginTop: sp.xl }]}>
          <Text style={[typo.scale.label, { fontFamily: typo.fonts.sansMed, color: colors.textLow, letterSpacing: 1.5 }]}>
            ABOUT
          </Text>
        </View>
        <View style={[styles.card, elev.low, {
          backgroundColor: colors.elevated,
          borderColor: colors.border,
          borderRadius: r.lg,
          marginHorizontal: sp.base,
          overflow: 'hidden',
        }]}>
          <View style={[styles.row, {
            paddingHorizontal: sp.base,
            paddingVertical: sp.md,
          }]}>
            <Text style={[typo.scale.body, { fontFamily: typo.fonts.serifBold, color: colors.textHigh }]}>
              Dhaggay
            </Text>
            <Text style={[typo.scale.bodySmall, { fontFamily: typo.fonts.sans, color: colors.textLow }]}>
              v1.0.0
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, width: 60 },
  sectionLabel: {},
  card: { borderWidth: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  schemePills: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  schemePill: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  colorDot: { width: 12, height: 12 },
});
