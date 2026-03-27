import type { LoyaltyBalance, LoyaltyTier } from '@features/dashboard/dashboard.types';
import { useTheme } from '@shared/theme';
import { StyleSheet, Text, View } from 'react-native';

const TIER_LABELS: Record<LoyaltyTier, string> = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
};

interface Props {
  balance: LoyaltyBalance;
}

/** Redemption value: floor(points / 500) * 50 PKR */
function redemptionValue(points: number): number {
  return Math.floor(points / 500) * 50;
}

export function LoyaltyBalanceHero({ balance }: Props): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();

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
    tier: {
      backgroundColor: colors.accentSubtle,
      borderRadius: r.sharp,
      paddingHorizontal: sp.sm,
      paddingVertical: 2,
      alignSelf: 'flex-start',
      marginBottom: sp.sm,
    },
    tierText: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansBold,
      color: colors.accent,
      textTransform: 'uppercase',
      letterSpacing: 1,
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
      marginBottom: sp.base,
    },
    redemptionValue: {
      color: colors.success,
    },
    progressTrack: {
      height: 6,
      overflow: 'hidden' as const,
      backgroundColor: colors.panel,
      borderRadius: r.pill,
      marginBottom: sp.xs,
    },
    progressFill: {
      height: '100%' as const,
      backgroundColor: colors.accent,
      borderRadius: r.pill,
    },
    nextTierText: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textLow,
    },
  });

  const redeem = redemptionValue(balance.points ?? 0);

  return (
    <View style={[styles.card, elev.mid]}>
      {/* Tier badge */}
      <View style={styles.tier}>
        <Text style={styles.tierText}>
          {TIER_LABELS[balance.tier] ?? balance.tier}
        </Text>
      </View>

      {/* Points */}
      <Text style={styles.points}>
        {(balance.points ?? 0).toLocaleString()}
      </Text>
      <Text style={styles.pointsLabel}>Points Balance</Text>

      {/* Redemption value */}
      <Text style={styles.redemptionNote}>
        {'Worth '}
        <Text style={styles.redemptionValue}>PKR {redeem.toLocaleString()}</Text>
        {'  •  500 pts = PKR 50 off (min 500 pts)'}
      </Text>

      {/* Progress to next tier */}
      {balance.nextTierPoints > 0 && (
        <>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(balance.progressPercent, 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.nextTierText}>
            {Math.max(0, (balance.nextTierPoints ?? 0) - (balance.points ?? 0)).toLocaleString()} pts to {balance.nextTier ?? ''}
          </Text>
        </>
      )}
    </View>
  );
}
