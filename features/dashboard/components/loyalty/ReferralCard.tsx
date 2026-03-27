import { IconSymbol } from '@/components/ui/icon-symbol';
import type { ReferralData } from '@features/dashboard/dashboard.types';
import { useTheme } from '@shared/theme';
import { Alert, Pressable, Share, StyleSheet, Text, View } from 'react-native';

interface Props {
  data: ReferralData;
}

export function ReferralCard({ data }: Props) {
  const { colors, sp, r, typo, elev } = useTheme();

  const copyCode = async () => {
    try {
      await Share.share({ message: data.code, title: 'My Dhaggay Referral Code' });
    } catch {
      Alert.alert('Your Code', data.code);
    }
  };

  const shareLink = async () => {
    try {
      await Share.share({ message: `Join Dhaggay with my referral link: ${data.link}` });
    } catch {
      // user cancelled share sheet
    }
  };

  return (
    <View
      style={[
        styles.card,
        elev.low,
        {
          backgroundColor: colors.elevated,
          borderColor: colors.border,
          borderRadius: r.lg,
          padding: sp.base,
        },
      ]}
    >
      {/* Code box */}
      <Text
        style={[
          typo.scale.label,
          {
            fontFamily: typo.fonts.sansMed,
            color: colors.textLow,
            textTransform: 'uppercase',
            letterSpacing: 1,
            marginBottom: sp.sm,
          },
        ]}
      >
        Your Referral Code
      </Text>
      <View
        style={[
          styles.codeBox,
          {
            backgroundColor: colors.inputBg,
            borderColor: colors.borderStrong,
            borderRadius: r.sm,
            paddingHorizontal: sp.base,
            paddingVertical: sp.md,
            marginBottom: sp.base,
          },
        ]}
      >
        <Text
          style={[
            typo.scale.title3,
            { fontFamily: typo.fonts.serifBold, color: colors.textHigh, letterSpacing: 4 },
          ]}
        >
          {data.code}
        </Text>
      </View>

      {/* Action buttons */}
      <View style={[styles.actions, { gap: sp.sm }]}>
        <Pressable
          onPress={copyCode}
          style={({ pressed }) => [
            styles.btn,
            {
              backgroundColor: colors.accentSubtle,
              borderColor: colors.accent,
              borderRadius: r.md,
              paddingVertical: sp.md,
              flex: 1,
              opacity: pressed ? 0.75 : 1,
            },
          ]}
        >
          <IconSymbol name="doc.on.doc.fill" size={16} color={colors.accent} />
          <Text
            style={[typo.scale.bodySmall, { fontFamily: typo.fonts.sansBold, color: colors.accent }]}
          >
            Copy Code
          </Text>
        </Pressable>
        <Pressable
          onPress={shareLink}
          style={({ pressed }) => [
            styles.btn,
            {
              backgroundColor: colors.accent,
              borderRadius: r.md,
              paddingVertical: sp.md,
              flex: 1,
              opacity: pressed ? 0.75 : 1,
            },
          ]}
        >
          <IconSymbol name="square.and.arrow.up" size={16} color={colors.textOnAccent} />
          <Text
            style={[typo.scale.bodySmall, { fontFamily: typo.fonts.sansBold, color: colors.textOnAccent }]}
          >
            Share Link
          </Text>
        </Pressable>
      </View>

      {/* Stats */}
      <View style={[styles.stats, { marginTop: sp.base, paddingTop: sp.sm, borderTopColor: colors.border }]}>
        <View style={styles.statItem}>
          <Text style={[typo.scale.title3, { fontFamily: typo.fonts.display, color: colors.accent }]}>
            {(data.totalReferrals ?? 0).toLocaleString()}
          </Text>
          <Text style={[typo.scale.caption, { fontFamily: typo.fonts.sans, color: colors.textLow }]}>
            Referred
          </Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[typo.scale.title3, { fontFamily: typo.fonts.display, color: colors.accent }]}>
            {(data.earnedPoints ?? 0).toLocaleString()}
          </Text>
          <Text style={[typo.scale.caption, { fontFamily: typo.fonts.sans, color: colors.textLow }]}>
            Points Earned
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1 },
  codeBox: { borderWidth: 1, alignItems: 'center' },
  actions: { flexDirection: 'row' },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1 },
  stats: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1 },
  statItem: { alignItems: 'center', flex: 1 },
  divider: { width: 1, alignSelf: 'stretch' },
});
