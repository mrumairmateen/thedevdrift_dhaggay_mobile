import { HowToEarnTable } from '@features/dashboard/components/loyalty/HowToEarnTable';
import { LoyaltyBalanceHero } from '@features/dashboard/components/loyalty/LoyaltyBalanceHero';
import { ReferralCard } from '@features/dashboard/components/loyalty/ReferralCard';
import { TransactionRow } from '@features/dashboard/components/loyalty/TransactionRow';
import { DashboardHeader } from '@features/dashboard/components/shared/DashboardHeader';
import { useTheme } from '@shared/theme';
import { useGetLoyaltyQuery, useGetReferralsQuery } from '@services/loyaltyApi';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function LoyaltyScreen() {
  const { colors, sp, typo } = useTheme();
  const { data: loyalty, isLoading: loadingLoyalty } = useGetLoyaltyQuery();
  const { data: referrals, isLoading: loadingReferrals } = useGetReferralsQuery();

  const isLoading = loadingLoyalty || loadingReferrals;

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <DashboardHeader title="Loyalty & Rewards" />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: sp.base, paddingBottom: sp['4xl'], gap: sp.xl }}
        >
          {/* Balance hero */}
          {loyalty?.balance && <LoyaltyBalanceHero balance={loyalty.balance} />}

          {/* How to earn */}
          {loyalty?.earnRules && loyalty.earnRules.length > 0 && (
            <View>
              <SectionLabel label="How to Earn" />
              <HowToEarnTable rules={loyalty.earnRules} />
            </View>
          )}

          {/* Referral card */}
          {referrals && (
            <View>
              <SectionLabel label="Referral Program" />
              <ReferralCard data={referrals} />
            </View>
          )}

          {/* Transaction history */}
          {loyalty?.transactions && loyalty.transactions.length > 0 && (
            <View>
              <SectionLabel label="History" />
              <View>
                {loyalty.transactions.slice(0, 20).map((t) => (
                  <TransactionRow key={t._id} transaction={t} />
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

function SectionLabel({ label }: { label: string }) {
  const { colors, sp, typo } = useTheme();
  return (
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
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
