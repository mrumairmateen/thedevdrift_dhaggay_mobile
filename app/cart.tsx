import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@shared/theme';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CartScreen() {
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
          Cart
        </Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Empty state */}
      <View style={styles.empty}>
        <View style={[styles.iconCircle, {
          backgroundColor: colors.panel,
          borderRadius: r.pill,
          width: 80,
          height: 80,
          marginBottom: sp.lg,
        }]}>
          <IconSymbol name="bag" size={36} color={colors.textLow} />
        </View>
        <Text style={[typo.scale.title3, { fontFamily: typo.fonts.serifBold, color: colors.textHigh, marginBottom: sp.sm }]}>
          Your cart is empty
        </Text>
        <Text style={[typo.scale.body, { fontFamily: typo.fonts.sans, color: colors.textMid, textAlign: 'center', marginBottom: sp.xl }]}>
          Add fabrics and designs{'\n'}to get started.
        </Text>
        <Pressable
          onPress={() => router.push('/(tabs)/shop')}
          style={[{
            backgroundColor: colors.accent,
            borderRadius: r.pill,
            paddingHorizontal: sp.xl,
            paddingVertical: sp.md,
          }]}
        >
          <Text style={[typo.scale.body, { fontFamily: typo.fonts.sansBold, color: colors.textOnAccent }]}>
            Browse Shop
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
