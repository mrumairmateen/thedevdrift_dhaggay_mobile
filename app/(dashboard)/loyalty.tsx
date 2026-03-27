import React, { useCallback } from 'react';
import {
  FlatList,
  ListRenderItem,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useGetLoyaltyDataQuery, useGetReferralDataQuery } from '@services/loyaltyApi';
import { useTheme } from '@shared/theme';
import { ErrorBanner, SectionHeader, Skeleton } from '@shared/components/ui';

import { DashboardHeader } from '@features/dashboard/components/shared/DashboardHeader';
import { LoyaltyBalanceHero } from '@features/dashboard/components/loyalty/LoyaltyBalanceHero';
import { HowToEarnTable } from '@features/dashboard/components/loyalty/HowToEarnTable';
import { ReferralCard } from '@features/dashboard/components/loyalty/ReferralCard';
import { TransactionRow } from '@features/dashboard/components/loyalty/TransactionRow';
import type { LoyaltyTransaction } from '@features/dashboard/dashboard.types';

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function LoyaltySkeleton(): React.JSX.Element {
  const { sp, r } = useTheme();
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={{ padding: sp.base, gap: sp.xl }}>
        <Skeleton width="100%" height={160} radius={r.xl} />
        <Skeleton width="100%" height={180} radius={r.lg} />
        <Skeleton width="100%" height={160} radius={r.lg} />
        <Skeleton width="100%" height={200} radius={r.lg} />
      </View>
    </ScrollView>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function LoyaltyScreen(): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();

  const {
    data: loyalty,
    isLoading: loadingLoyalty,
    isError: errorLoyalty,
    refetch: refetchLoyalty,
  } = useGetLoyaltyDataQuery();

  const {
    data: referrals,
    isLoading: loadingReferrals,
    isError: errorReferrals,
    refetch: refetchReferrals,
  } = useGetReferralDataQuery();

  const isLoading = loadingLoyalty || loadingReferrals;
  const isError = errorLoyalty || errorReferrals;

  const handleRetry = useCallback(() => {
    void refetchLoyalty();
    void refetchReferrals();
  }, [refetchLoyalty, refetchReferrals]);

  const renderTransaction = React.useCallback<ListRenderItem<LoyaltyTransaction>>(
    ({ item }) => <TransactionRow transaction={item} />,
    [],
  );

  const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg },
    content: { padding: sp.base, paddingBottom: sp['4xl'], gap: sp.xl },
    txCard: {
      backgroundColor: colors.elevated,
      borderRadius: r.lg,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: sp.base,
      paddingTop: sp.base,
      paddingBottom: sp.sm,
      ...elev.low,
    },
    sectionTitle: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansMed,
      color: colors.textLow,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: sp.sm,
    },
  });

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <DashboardHeader title="Loyalty Rewards" showBack={false} />
        <LoyaltySkeleton />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.screen}>
        <DashboardHeader title="Loyalty Rewards" showBack={false} />
        <View style={{ padding: sp.base, marginTop: sp.lg }}>
          <ErrorBanner
            message="Could not load loyalty data. Please try again."
            onRetry={handleRetry}
          />
        </View>
      </View>
    );
  }

  const transactions = (loyalty?.transactions ?? []).slice(0, 10);

  return (
    <View style={styles.screen}>
      <DashboardHeader title="Loyalty Rewards" showBack={false} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Tier hero card */}
        {loyalty?.balance !== undefined && (
          <View>
            <LoyaltyBalanceHero balance={loyalty.balance} />
          </View>
        )}

        {/* How to earn */}
        {loyalty?.earnRules !== undefined && loyalty.earnRules.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>How to Earn Points</Text>
            <HowToEarnTable rules={loyalty.earnRules} />
          </View>
        )}

        {/* Transaction history */}
        {transactions.length > 0 && (
          <View>
            <SectionHeader title="Recent Activity" />
            <View style={styles.txCard}>
              <FlatList
                data={transactions}
                keyExtractor={(item) => item._id}
                renderItem={renderTransaction}
                scrollEnabled={false}
              />
            </View>
          </View>
        )}

        {/* Referral card */}
        {referrals !== undefined && (
          <View>
            <Text style={styles.sectionTitle}>{'Refer & Earn'}</Text>
            <ReferralCard data={referrals} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
