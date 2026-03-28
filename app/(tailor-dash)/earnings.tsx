import React, { useCallback } from 'react';
import {
  FlatList,
  ListRenderItem,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useGetEarningsQuery } from '@services/tailorDashApi';
import type { EarningsData, EarningsPayout } from '@services/tailorDashApi';
import { useTheme } from '@shared/theme';
import { EmptyState, ErrorBanner, Skeleton, ScreenHeader } from '@shared/components/ui';
import { IconSymbol } from '@shared/components/ui/icon-symbol';
import { formatPkr } from '@shared/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type EarningEntry = EarningsPayout;
type ChartEntry = EarningsData['months'][number];

// ─── Chart bar ────────────────────────────────────────────────────────────────

interface ChartBarProps {
  entry: ChartEntry;
  maxNet: number;
}

const ChartBar = React.memo(function ChartBar({
  entry,
  maxNet,
}: ChartBarProps): React.JSX.Element {
  const { colors, sp, r, typo } = useTheme();

  const heightPct = maxNet > 0 ? Math.round((entry.amount / maxNet) * 100) : 0;

  const styles = StyleSheet.create({
    col: { flex: 1, alignItems: 'center', gap: sp.xs },
    bar: {
      width: '80%',
      borderRadius: r.sharp,
      backgroundColor: colors.accent,
      minHeight: 4,
    },
    label: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sans,
      color: colors.textLow,
    },
  });

  return (
    <View style={styles.col}>
      <View style={[styles.bar, { height: Math.max(4, heightPct) }]} />
      <Text style={styles.label} numberOfLines={1}>{entry.label}</Text>
    </View>
  );
});

// ─── Earning entry card ───────────────────────────────────────────────────────

interface EarningEntryCardProps {
  entry: EarningEntry;
}

const EarningEntryCard = React.memo(function EarningEntryCard({
  entry,
}: EarningEntryCardProps): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();

  const variantColor: string =
    entry.status === 'paid'
      ? colors.success
      : entry.status === 'reversed'
        ? colors.error
        : colors.warning;

  const variantBg: string =
    entry.status === 'paid'
      ? colors.successSubtle
      : entry.status === 'reversed'
        ? colors.errorSubtle
        : colors.warningSubtle;

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: sp.md,
      marginBottom: sp.sm,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      ...elev.low,
    },
    left: { flex: 1 },
    orderNum: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.accent,
    },
    date: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textLow,
      marginTop: 2,
    },
    right: { alignItems: 'flex-end', gap: sp.xs },
    amount: {
      ...typo.scale.price,
      fontFamily: typo.fonts.sansBold,
      color: colors.textHigh,
    },
    statusBadge: {
      backgroundColor: variantBg,
      borderRadius: r.sharp,
      paddingHorizontal: sp.xs,
      paddingVertical: 2,
    },
    statusLabel: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansMed,
      color: variantColor,
    },
  });

  const paidLabel =
    entry.paidAt !== null
      ? new Date(entry.paidAt).toLocaleDateString('en-PK')
      : null;

  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <Text style={styles.orderNum}>#{entry.orderNumber}</Text>
        {paidLabel !== null && (
          <Text style={styles.date}>Paid: {paidLabel}</Text>
        )}
      </View>
      <View style={styles.right}>
        <Text style={styles.amount}>{formatPkr(entry.amount)}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusLabel}>{entry.status.toUpperCase()}</Text>
        </View>
      </View>
    </View>
  );
});

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function EarningsSkeleton(): React.JSX.Element {
  const { sp, r, colors } = useTheme();

  const styles = StyleSheet.create({
    balanceRow: {
      flexDirection: 'row',
      gap: sp.sm,
      paddingHorizontal: sp.base,
      marginTop: sp.lg,
    },
    balanceCard: {
      flex: 1,
      height: 80,
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    list: { padding: sp.base, gap: sp.sm, marginTop: sp.xl },
    listCard: {
      height: 64,
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
  });

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.balanceRow}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={styles.balanceCard} />
        ))}
      </View>
      <View style={styles.list}>
        <Skeleton width={120} height={16} />
        <View style={{ gap: sp.sm }}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={styles.listCard} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function EarningsScreen(): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();

  const { data, isLoading, isError, refetch } = useGetEarningsQuery();

  const renderEntry = useCallback<ListRenderItem<EarningsPayout>>(
    ({ item }) => <EarningEntryCard entry={item} />,
    [],
  );

  const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg },
    balanceRow: {
      flexDirection: 'row',
      gap: sp.sm,
      paddingHorizontal: sp.base,
      marginTop: sp.lg,
    },
    balanceCard: {
      flex: 1,
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      padding: sp.md,
      borderWidth: 1,
      borderColor: colors.border,
      gap: sp.xs,
      alignItems: 'center',
      ...elev.low,
    },
    balanceValue: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
    },
    balanceLabel: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
    },
    feeCard: {
      marginHorizontal: sp.base,
      marginTop: sp.md,
      backgroundColor: colors.warningSubtle,
      borderRadius: r.md,
      padding: sp.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: sp.sm,
    },
    feeText: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.warning,
      flex: 1,
    },
    chartSection: {
      paddingHorizontal: sp.base,
      marginTop: sp.xl,
    },
    chartTitle: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.textMid,
      marginBottom: sp.sm,
    },
    chartCard: {
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: sp.md,
      ...elev.low,
    },
    chartBars: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      height: 80,
      gap: sp.xs,
    },
    listSection: {
      paddingHorizontal: sp.base,
      marginTop: sp.xl,
      flex: 1,
    },
    sectionTitle: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.textMid,
      marginBottom: sp.sm,
    },
    listContent: { paddingBottom: sp['4xl'] },
    errorContainer: { padding: sp.base, marginTop: sp.lg },
  });

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Earnings" />
        <EarningsSkeleton />
      </View>
    );
  }

  if (isError || data === undefined) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Earnings" />
        <View style={styles.errorContainer}>
          <ErrorBanner
            message="Could not load earnings. Please try again."
            onRetry={refetch}
          />
        </View>
      </View>
    );
  }

  const maxAmount = data.months.reduce((max, entry) => Math.max(max, entry.amount), 1);

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Earnings" />

      {/* Balance cards */}
      <View style={styles.balanceRow}>
        <View style={styles.balanceCard}>
          <IconSymbol name="clock.fill" size={18} color={colors.warning} />
          <Text style={[styles.balanceValue, { color: colors.warning }]}>
            {formatPkr(data.thisMonth)}
          </Text>
          <Text style={styles.balanceLabel}>This Month</Text>
        </View>
        <View style={styles.balanceCard}>
          <IconSymbol name="banknote" size={18} color={colors.accent} />
          <Text style={[styles.balanceValue, { color: colors.accent }]}>
            {formatPkr(data.netPayout)}
          </Text>
          <Text style={styles.balanceLabel}>Net Payout</Text>
        </View>
        <View style={styles.balanceCard}>
          <IconSymbol name="percent" size={18} color={colors.textMid} />
          <Text style={[styles.balanceValue, { color: colors.textMid }]}>
            {formatPkr(data.platformFee)}
          </Text>
          <Text style={styles.balanceLabel}>Platform Fee</Text>
        </View>
      </View>

      {/* 6-month chart */}
      {data.months.length > 0 && (
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Last 6 Months</Text>
          <View style={styles.chartCard}>
            <View style={styles.chartBars}>
              {data.months.map((entry) => (
                <ChartBar key={entry.label} entry={entry} maxNet={maxAmount} />
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Payouts list */}
      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>Payouts</Text>
        {data.payouts.length === 0 ? (
          <EmptyState
            icon={<IconSymbol name="trophy.fill" size={32} color={colors.textLow} />}
            title="No payouts yet"
            message="Completed orders will generate payouts here."
          />
        ) : (
          <FlatList
            data={data.payouts}
            keyExtractor={(item) => item._id}
            renderItem={renderEntry}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews
          />
        )}
      </View>
    </View>
  );
}
