import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@shared/theme';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AccountScreen() {
  const { colors, sp, r, typo, elev } = useTheme();
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
          Account
        </Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Sign in prompt */}
      <View style={styles.empty}>
        <View style={[styles.iconCircle, {
          backgroundColor: colors.panel,
          borderRadius: r.pill,
          width: 80,
          height: 80,
          marginBottom: sp.lg,
        }]}>
          <IconSymbol name="person.fill" size={36} color={colors.textLow} />
        </View>
        <Text style={[typo.scale.title3, { fontFamily: typo.fonts.serifBold, color: colors.textHigh, marginBottom: sp.sm }]}>
          Sign in to Dhaggay
        </Text>
        <Text style={[typo.scale.body, { fontFamily: typo.fonts.sans, color: colors.textMid, textAlign: 'center', marginBottom: sp.xl }]}>
          Track orders, save designs,{'\n'}and manage your profile.
        </Text>
        <Pressable
          style={[{
            backgroundColor: colors.accent,
            borderRadius: r.pill,
            paddingHorizontal: sp.xl,
            paddingVertical: sp.md,
            marginBottom: sp.md,
            minWidth: 200,
            alignItems: 'center',
          }]}
        >
          <Text style={[typo.scale.body, { fontFamily: typo.fonts.sansBold, color: colors.textOnAccent }]}>
            Sign In
          </Text>
        </Pressable>
        <Pressable
          style={[{
            borderWidth: 1,
            borderColor: colors.accent,
            borderRadius: r.pill,
            paddingHorizontal: sp.xl,
            paddingVertical: sp.md,
            minWidth: 200,
            alignItems: 'center',
          }]}
        >
          <Text style={[typo.scale.body, { fontFamily: typo.fonts.sansMed, color: colors.accent }]}>
            Create Account
          </Text>
        </Pressable>
      </View>
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
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  iconCircle: { alignItems: 'center', justifyContent: 'center' },
});
