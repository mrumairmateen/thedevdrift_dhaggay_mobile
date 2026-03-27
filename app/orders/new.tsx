import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@shared/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const STEPS = [
  { icon: 'tshirt.fill' as const, title: 'Choose a Design', desc: 'Browse our catalog or describe your vision' },
  { icon: 'scissors' as const, title: 'Pick a Tailor', desc: 'Match with a verified master craftsman near you' },
  { icon: 'ruler' as const, title: 'Share Measurements', desc: 'Enter or scan your measurements in-app' },
  { icon: 'shippingbox.fill' as const, title: 'Fabric Delivered', desc: 'Tailor picks up or you drop off the fabric' },
  { icon: 'checkmark.seal.fill' as const, title: 'Collect Your Outfit', desc: 'Delivered to your door, quality guaranteed' },
];

export default function NewOrderScreen() {
  const { colors, sp, r, typo, elev } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { tailorId, designId } = useLocalSearchParams<{ tailorId?: string; designId?: string }>();

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
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: sp.base, paddingTop: sp['2xl'], paddingBottom: insets.bottom + sp['4xl'] }}
      >
        {/* Headline */}
        <Text style={[typo.scale.label, { fontFamily: typo.fonts.sansMed, color: colors.accent, marginBottom: sp.sm }]}>
          CUSTOM ORDER
        </Text>
        <Text style={[typo.scale.title2, { fontFamily: typo.fonts.serifBold, color: colors.textHigh, marginBottom: sp.xs }]}>
          Start Your{'\n'}Custom Outfit
        </Text>
        <Text style={[typo.scale.body, { fontFamily: typo.fonts.sans, color: colors.textMid, marginBottom: sp['2xl'], lineHeight: 24 }]}>
          Pakistan's first end-to-end custom clothing experience — fabric, tailor, and delivery in one seamless flow.
        </Text>

        {/* Process steps */}
        {STEPS.map((step, idx) => (
          <View key={idx} style={[styles.stepRow, { marginBottom: sp.lg }]}>
            <View style={[styles.stepIcon, {
              backgroundColor: colors.accentSubtle,
              borderRadius: r.md,
              width: 48,
              height: 48,
            }]}>
              <IconSymbol name={step.icon} size={22} color={colors.accent} />
            </View>
            <View style={styles.stepText}>
              <Text style={[typo.scale.bodySmall, { fontFamily: typo.fonts.sansBold, color: colors.textHigh, marginBottom: 2 }]}>
                {idx + 1}. {step.title}
              </Text>
              <Text style={[typo.scale.caption, { fontFamily: typo.fonts.sans, color: colors.textMid }]}>
                {step.desc}
              </Text>
            </View>
          </View>
        ))}

        {/* Divider */}
        <View style={[{ height: 1, backgroundColor: colors.border, marginVertical: sp.xl }]} />

        {/* CTA */}
        <Text style={[typo.scale.body, { fontFamily: typo.fonts.sans, color: colors.textMid, textAlign: 'center', marginBottom: sp.lg }]}>
          Ready to get started? Browse designs or find a tailor.
        </Text>
        <View style={styles.ctaRow}>
          <Pressable
            onPress={() => router.push('/(tabs)/designs' as any)}
            style={[styles.ctaBtn, { backgroundColor: colors.accent, borderRadius: r.pill, flex: 1 }]}
          >
            <Text style={[typo.scale.label, { fontFamily: typo.fonts.sansBold, color: colors.textOnAccent, textAlign: 'center' }]}>
              BROWSE DESIGNS
            </Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/(tabs)/tailors' as any)}
            style={[styles.ctaBtn, { borderColor: colors.border, borderWidth: 1, borderRadius: r.pill }]}
          >
            <Text style={[typo.scale.label, { fontFamily: typo.fonts.sansMed, color: colors.textMid, textAlign: 'center' }]}>
              FIND TAILOR
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { borderBottomWidth: 1 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  stepIcon: { alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stepText: { flex: 1, paddingTop: 2 },
  ctaRow: { flexDirection: 'row', gap: 12 },
  ctaBtn: { paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
});
