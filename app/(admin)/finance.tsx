import React, { useCallback } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useGetFinanceDataQuery } from '@services/adminApi';
import { useTheme } from '@shared/theme';
import {
  ErrorBanner,
  SectionHeader,
  Skeleton,
} from '@shared/components/ui';
import { formatPkr } from '@shared/utils/pkr';
import type { BadgeVariant } from '@shared/components/ui';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MetricCard {
  label: string;
  value: string;
  colorKey: 'success' | 'accent' | 'info' | 'error';
}

interface DayRevenue {
  date: string;
  revenue: number;
}

// ─── Metric Card ──────────────────────────────────────────────────────────────

interface MetricCardProps {
  card: MetricCard;
}

const FinanceMetricCard = React.memo(function FinanceMetricCard({
  card,
}: MetricCardProps): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();

  const colorMap: Record<MetricCard['colorKey'], string> = {
    success: colors.success,
    accent: colors.accent,
    info: colors.info,
    error: colors.error,
  };
  const subtleMap: Record<MetricCard['colorKey'], string> = {
    success: colors.successSubtle,
    accent: colors.accentSubtle,
    info: colors.infoSubtle,
    error: colors.errorSubtle,
  };

  const highlight = colorMap[card.colorKey];
  const subtleBg = subtleMap[card.colorKey];

  const styles = StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      padding: sp.md,
      borderWidth: 1,
      borderColor: colors.border,
      gap: sp.xs,
      ...elev.low,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: highlight,
      marginBottom: sp.xs,
    },
    value: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: highlight,
    },
    label: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
    },
  });

  return (
    <View style={styles.card}>
      <View style={styles.dot} />
      <Text style={styles.value}>{card.value}</Text>
      <Text style={styles.label}>{card.label}</Text>
    </View>
  );
});

// ─── Revenue Day Row ──────────────────────────────────────────────────────────

interface RevenueDayRowProps {
  item: DayRevenue;
  maxRevenue: number;
}

const RevenueDayRow = React.memo(function RevenueDayRow({
  item,
  maxRevenue,
}: RevenueDayRowProps): React.JSX.Element {
  const { colors, sp, r, typo } = useTheme();

  const proportion = maxRevenue > 0 ? item.revenue / maxRevenue : 0;
  const barWidthPercent = `${Math.round(proportion * 100)}%` as `${number}%`;

  const displayDate = new Date(item.date).toLocaleDateString('en-PK', {
    day: '2-digit',
    month: 'short',
  });

  const styles = StyleSheet.create({
    row: {
      marginBottom: sp.sm,
      gap: sp.xs,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    date: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sansMed,
      color: colors.textMid,
    },
    amount: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sansBold,
      color: colors.accent,
    },
    barTrack: {
      height: 6,
      backgroundColor: colors.panel,
      borderRadius: r.pill,
      overflow: 'hidden',
    },
    barFill: {
      height: 6,
      backgroundColor: colors.accent,
      borderRadius: r.pill,
      width: barWidthPercent,
    },
  });

  return (
    <View style={styles.row}>
      <View style={styles.topRow}>
        <Text style={styles.date}>{displayDate}</Text>
        <Text style={styles.amount}>{formatPkr(item.revenue)}</Text>
      </View>
      <View style={styles.barTrack}>
        <View style={styles.barFill} />
      </View>
    </View>
  );
});

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function FinanceSkeleton(): React.JSX.Element {
  const { colors, sp, r } = useTheme();

  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: sp.sm,
      paddingHorizontal: sp.base,
      marginTop: sp.lg,
    },
    card: {
      flex: 1,
      height: 88,
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    section: { paddingHorizontal: sp.base, marginTop: sp.xl },
    trendItem: {
      height: 40,
      backgroundColor: colors.elevated,
      borderRadius: r.sm,
      marginBottom: sp.sm,
    },
  });

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.row}>
        <View style={styles.card} />
        <View style={styles.card} />
      </View>
      <View style={styles.row}>
        <View style={styles.card} />
        <View style={styles.card} />
      </View>
      <View style={styles.row}>
        <View style={styles.card} />
        <View style={styles.card} />
      </View>
      <View style={styles.section}>
        <Skeleton width={140} height={18} />
        <View style={{ marginTop: sp.md }}>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <View key={i} style={styles.trendItem} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AdminFinanceScreen(): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();
  const insets = useSafeAreaInsets();

  const { data, isLoading, isError, refetch } = useGetFinanceDataQuery();

  const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg },
    header: {
      backgroundColor: colors.navSolid,
      paddingTop: insets.top + sp.sm,
      paddingHorizontal: sp.base,
      paddingBottom: sp.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      ...elev.high,
    },
    title: {
      ...typo.scale.title3,
      fontFamily: typo.fonts.serifBold,
      color: colors.textHigh,
    },
    content: { paddingBottom: sp['4xl'] },
    metricRow: {
      flexDirection: 'row',
      gap: sp.sm,
      paddingHorizontal: sp.base,
      marginTop: sp.lg,
    },
    section: { paddingHorizontal: sp.base, marginTop: sp.xl },
    footer: {
      paddingHorizontal: sp.base,
      paddingVertical: sp.lg,
      marginTop: sp.lg,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    footerText: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textLow,
      textAlign: 'center',
    },
    errorWrap: { padding: sp.base },
  });

  const header = (
    <View style={styles.header}>
      <Text style={styles.title}>Platform Finance</Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.screen}>
        {header}
        <FinanceSkeleton />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.screen}>
        {header}
        <View style={styles.errorWrap}>
          <ErrorBanner
            message="Could not load finance data. Please try again."
            onRetry={refetch}
          />
        </View>
      </View>
    );
  }

  const metrics: MetricCard[] = [
    { label: 'Total Revenue', value: formatPkr(data.totalRevenue), colorKey: 'success' },
    { label: 'Platform Fees', value: formatPkr(data.platformFees), colorKey: 'accent' },
    { label: 'Seller Payouts', value: formatPkr(data.sellerPayouts), colorKey: 'info' },
    { label: 'Tailor Payouts', value: formatPkr(data.tailorPayouts), colorKey: 'info' },
    { label: 'Refunds Issued', value: formatPkr(data.refundsIssued), colorKey: 'error' },
  ];

  const metricPairs: MetricCard[][] = [];
  for (let i = 0; i < metrics.length; i += 2) {
    const first = metrics[i];
    const second = metrics[i + 1];
    if (first !== undefined) {
      metricPairs.push(second !== undefined ? [first, second] : [first]);
    }
  }

  const maxRevenue = (data.revenueByDay ?? []).reduce(
    (max, d) => (d.revenue > max ? d.revenue : max),
    0,
  );

  const renderDayRow = useCallback(
    ({ item }: { item: { date: string; revenue: number } }) => (
      <RevenueDayRow item={item} maxRevenue={maxRevenue} />
    ),
    [maxRevenue],
  );

  return (
    <View style={styles.screen}>
      {header}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Metric cards — 2-column grid */}
        {metricPairs.map((pair, pairIdx) => (
          <View key={pairIdx} style={styles.metricRow}>
            {pair.map((card) => (
              <FinanceMetricCard key={card.label} card={card} />
            ))}
            {/* If odd number of cards, fill remaining slot */}
            {pair.length === 1 && <View style={{ flex: 1 }} />}
          </View>
        ))}

        {/* Revenue Trend */}
        <View style={styles.section}>
          <SectionHeader title="Revenue by Day" />
          {(data.revenueByDay ?? []).length === 0 ? (
            <Text
              style={{
                ...typo.scale.caption,
                fontFamily: typo.fonts.sans,
                color: colors.textLow,
                marginTop: sp.md,
              }}
            >
              No daily revenue data available.
            </Text>
          ) : (
            <FlatList
              data={data.revenueByDay ?? []}
              keyExtractor={(item) => item.date}
              renderItem={renderDayRow}
              scrollEnabled={false}
              style={{ marginTop: sp.md }}
            />
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Detailed financial reports are available on the web portal.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
