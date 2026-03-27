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

export function LoyaltyBalanceHero({ balance }: Props) {
  const { colors, sp, r, typo, elev } = useTheme();

  return (
    <View
      style={[
        styles.card,
        elev.mid,
        {
          backgroundColor: colors.elevated,
          borderRadius: r.xl,
          padding: sp.xl,
          borderLeftWidth: 4,
          borderLeftColor: colors.accent,
          borderColor: colors.border,
        },
      ]}
    >
      {/* Tier badge */}
      <View
        style={[
          styles.tier,
          {
            backgroundColor: colors.accentSubtle,
            borderRadius: r.sharp,
            paddingHorizontal: sp.sm,
            paddingVertical: 2,
            alignSelf: 'flex-start',
            marginBottom: sp.sm,
          },
        ]}
      >
        <Text
          style={[
            typo.scale.label,
            { fontFamily: typo.fonts.sansBold, color: colors.accent, textTransform: 'uppercase', letterSpacing: 1 },
          ]}
        >
          {TIER_LABELS[balance.tier] ?? balance.tier}
        </Text>
      </View>

      {/* Points */}
      <Text style={[typo.scale.hero, { fontFamily: typo.fonts.display, color: colors.accent }]}>
        {(balance.points ?? 0).toLocaleString()}
      </Text>
      <Text
        style={[
          typo.scale.body,
          { fontFamily: typo.fonts.sansMed, color: colors.textMid, marginBottom: sp.base },
        ]}
      >
        Points Balance
      </Text>

      {/* Progress to next tier */}
      {balance.nextTierPoints > 0 && (
        <>
          <View
            style={[
              styles.progressTrack,
              { backgroundColor: colors.panel, borderRadius: r.pill, marginBottom: sp.xs },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: colors.accent,
                  borderRadius: r.pill,
                  width: `${Math.min(balance.progressPercent, 100)}%`,
                },
              ]}
            />
          </View>
          <Text style={[typo.scale.caption, { fontFamily: typo.fonts.sans, color: colors.textLow }]}>
            {((balance.nextTierPoints ?? 0) - (balance.points ?? 0)).toLocaleString()} pts to {balance.nextTier ?? ''}
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1 },
  tier: {},
  progressTrack: { height: 6, overflow: 'hidden' },
  progressFill: { height: '100%' },
});
