import { IconSymbol } from '@shared/components/ui/icon-symbol';
import type { ReferralData } from '@features/dashboard/dashboard.types';
import { useTheme } from '@shared/theme';
import { Alert, Pressable, Share, StyleSheet, Text, View } from 'react-native';

interface Props {
  data: ReferralData;
}

export function ReferralCard({ data }: Props): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();

  const copyCode = async (): Promise<void> => {
    try {
      await Share.share({ message: data.referralCode, title: 'My Dhaggay Referral Code' });
    } catch {
      Alert.alert('Your Code', data.referralCode);
    }
  };

  const shareLink = async (): Promise<void> => {
    try {
      await Share.share({ message: `Join Dhaggay with my referral link: ${data.referralLink}` });
    } catch {
      // user cancelled share sheet — no-op
    }
  };

  const styles = StyleSheet.create({
    card: {
      borderWidth: 1,
      backgroundColor: colors.elevated,
      borderColor: colors.border,
      borderRadius: r.lg,
      padding: sp.base,
    },
    label: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansMed,
      color: colors.textLow,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: sp.sm,
    },
    codeBox: {
      borderWidth: 1,
      alignItems: 'center',
      backgroundColor: colors.inputBg,
      borderColor: colors.borderStrong,
      borderRadius: r.sm,
      paddingHorizontal: sp.base,
      paddingVertical: sp.md,
      marginBottom: sp.base,
    },
    codeText: {
      ...typo.scale.title3,
      fontFamily: typo.fonts.serifBold,
      color: colors.textHigh,
      letterSpacing: 4,
    },
    actions: {
      flexDirection: 'row',
      gap: sp.sm,
    },
    btnCopy: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      borderWidth: 1,
      flex: 1,
      backgroundColor: colors.accentSubtle,
      borderColor: colors.accent,
      borderRadius: r.md,
      paddingVertical: sp.md,
    },
    btnCopyText: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.accent,
    },
    btnShare: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      borderWidth: 0,
      flex: 1,
      backgroundColor: colors.accent,
      borderRadius: r.md,
      paddingVertical: sp.md,
    },
    btnShareText: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.textOnAccent,
    },
    stats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      borderTopWidth: 1,
      borderTopColor: colors.border,
      marginTop: sp.base,
      paddingTop: sp.sm,
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
    },
    statValue: {
      ...typo.scale.title3,
      fontFamily: typo.fonts.display,
      color: colors.accent,
    },
    statLabel: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textLow,
    },
    divider: {
      width: 1,
      alignSelf: 'stretch',
      backgroundColor: colors.border,
    },
  });

  return (
    <View style={[styles.card, elev.low]}>
      {/* Code box */}
      <Text style={styles.label}>Your Referral Code</Text>
      <View style={styles.codeBox}>
        <Text style={styles.codeText}>{data.referralCode}</Text>
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <Pressable
          onPress={copyCode}
          style={({ pressed }) => [styles.btnCopy, { opacity: pressed ? 0.75 : 1 }]}
        >
          <IconSymbol name="doc.on.doc.fill" size={16} color={colors.accent} />
          <Text style={styles.btnCopyText}>Copy Code</Text>
        </Pressable>
        <Pressable
          onPress={shareLink}
          style={({ pressed }) => [styles.btnShare, { opacity: pressed ? 0.75 : 1 }]}
        >
          <IconSymbol name="square.and.arrow.up" size={16} color={colors.textOnAccent} />
          <Text style={styles.btnShareText}>Share Link</Text>
        </Pressable>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {data.referredCount.toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>Referred</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {data.pointsEarned.toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>Points Earned</Text>
        </View>
      </View>
    </View>
  );
}
