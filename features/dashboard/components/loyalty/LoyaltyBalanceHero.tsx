import { useTheme } from '@shared/theme';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  balance: number;
}

/** Redemption value: floor(points / 500) * 50 PKR */
function redemptionValue(points: number): number {
  return Math.floor(points / 500) * 50;
}

export function LoyaltyBalanceHero({ balance }: Props): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();

  const redeem = redemptionValue(balance);

  const styles = StyleSheet.create({
    card: {
      borderWidth: 1,
      backgroundColor: colors.elevated,
      borderRadius: r.xl,
      padding: sp.xl,
      borderLeftWidth: 4,
      borderLeftColor: colors.accent,
      borderColor: colors.border,
    },
    points: {
      ...typo.scale.hero,
      fontFamily: typo.fonts.display,
      color: colors.accent,
    },
    pointsLabel: {
      ...typo.scale.body,
      fontFamily: typo.fonts.sansMed,
      color: colors.textMid,
      marginBottom: sp.sm,
    },
    redemptionNote: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sansMed,
      color: colors.textLow,
    },
    redemptionValue: {
      color: colors.success,
    },
  });

  return (
    <View style={[styles.card, elev.mid]}>
      <Text style={styles.points}>{balance.toLocaleString()}</Text>
      <Text style={styles.pointsLabel}>Points Balance</Text>
      <Text style={styles.redemptionNote}>
        {'Worth '}
        <Text style={styles.redemptionValue}>PKR {redeem.toLocaleString()}</Text>
        {'  •  500 pts = PKR 50 off (min 500 pts)'}
      </Text>
    </View>
  );
}
