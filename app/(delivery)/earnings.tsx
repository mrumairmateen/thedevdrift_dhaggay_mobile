import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useGetDeliveryDashboardQuery } from '@services/deliveryApi';
import { useTheme } from '@shared/theme';
import {
  ErrorBanner,
  Skeleton,
} from '@shared/components/ui';
import { IconSymbol } from '@shared/components/ui/icon-symbol';
import { formatPkr } from '@shared/utils';

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function EarningsSkeleton(): React.JSX.Element {
  const { colors, sp, r } = useTheme();

  const styles = StyleSheet.create({
    container: { paddingHorizontal: sp.base, paddingTop: sp.xl, gap: sp.md },
    card: {
      height: 90,
      backgroundColor: colors.elevated,
      borderRadius: r.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    infoCard: {
      height: 60,
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: sp.xl,
    },
    quickCard: {
      height: 80,
      backgroundColor: colors.elevated,
      borderRadius: r.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
  });

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <Skeleton width={120} height={18} />
        <View style={styles.card} />
        <View style={styles.card} />
        <View style={styles.card} />
        <View style={styles.infoCard} />
        <View style={styles.quickCard} />
      </View>
    </ScrollView>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function EarningsScreen(): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();
  const insets = useSafeAreaInsets();

  const { data, isLoading, isError, refetch } = useGetDeliveryDashboardQuery();

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
    headerTitle: {
      ...typo.scale.title2,
      fontFamily: typo.fonts.serifBold,
      color: colors.textHigh,
    },
    content: {
      paddingHorizontal: sp.base,
      paddingTop: sp.xl,
      paddingBottom: sp['4xl'],
      gap: sp.md,
    },
    sectionLabel: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansMed,
      color: colors.textLow,
    },
    metricCard: {
      backgroundColor: colors.elevated,
      borderRadius: r.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: sp.base,
      flexDirection: 'row',
      alignItems: 'center',
      gap: sp.md,
      ...elev.low,
    },
    metricIconWrap: {
      width: 44,
      height: 44,
      borderRadius: r.md,
      backgroundColor: colors.accentSubtle,
      alignItems: 'center',
      justifyContent: 'center',
    },
    metricInfo: {
      flex: 1,
    },
    metricValue: {
      ...typo.scale.title3,
      fontFamily: typo.fonts.display,
      color: colors.accent,
    },
    metricLabel: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
      marginTop: 2,
    },
    infoCard: {
      backgroundColor: colors.infoSubtle,
      borderRadius: r.md,
      borderWidth: 1,
      borderColor: colors.info,
      padding: sp.base,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: sp.md,
      marginTop: sp.sm,
    },
    infoText: {
      flex: 1,
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sans,
      color: colors.info,
    },
    quickCard: {
      backgroundColor: colors.elevated,
      borderRadius: r.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: sp.base,
      gap: sp.sm,
      ...elev.low,
    },
    quickTitle: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.textHigh,
    },
    quickRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    quickLabel: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
    },
    quickValue: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sansMed,
      color: colors.textHigh,
    },
  });

  const header = (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Earnings</Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.screen}>
        {header}
        <EarningsSkeleton />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.screen}>
        {header}
        <View style={{ padding: sp.base, marginTop: sp.lg }}>
          <ErrorBanner
            message="Could not load earnings data. Please try again."
            onRetry={refetch}
          />
        </View>
      </View>
    );
  }

  const { stats } = data;

  // Estimate daily rate: if there are today's deliveries, divide earnings by deliveries
  const estimatedPerDelivery =
    stats.todayDeliveries > 0
      ? stats.todayEarnings / stats.todayDeliveries
      : 0;

  const metricCards = [
    {
      icon: 'trophy.fill' as const,
      value: formatPkr(stats.todayEarnings),
      label: "Today's Earnings",
    },
    {
      icon: 'checkmark.seal.fill' as const,
      value: String(stats.totalDelivered),
      label: 'Total Deliveries Completed',
    },
    {
      icon: 'chart.bar.fill' as const,
      value: `${stats.successRate}%`,
      label: 'Overall Success Rate',
    },
  ];

  return (
    <View style={styles.screen}>
      {header}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.sectionLabel}>PERFORMANCE OVERVIEW</Text>

        {metricCards.map((card) => (
          <View key={card.label} style={styles.metricCard}>
            <View style={styles.metricIconWrap}>
              <IconSymbol name={card.icon} size={22} color={colors.accent} />
            </View>
            <View style={styles.metricInfo}>
              <Text style={styles.metricValue}>{card.value}</Text>
              <Text style={styles.metricLabel}>{card.label}</Text>
            </View>
          </View>
        ))}

        {/* Info card */}
        <View style={styles.infoCard}>
          <IconSymbol name="info.circle.fill" size={18} color={colors.info} />
          <Text style={styles.infoText}>
            Detailed payout history is available on the Dhaggay web portal. Log in at dhaggay.com to view full statements.
          </Text>
        </View>

        {/* Quick stats */}
        <View style={styles.quickCard}>
          <Text style={styles.quickTitle}>Today's Quick Stats</Text>
          <View style={styles.quickRow}>
            <Text style={styles.quickLabel}>Deliveries today</Text>
            <Text style={styles.quickValue}>{stats.todayDeliveries}</Text>
          </View>
          <View style={styles.quickRow}>
            <Text style={styles.quickLabel}>Est. per delivery</Text>
            <Text style={styles.quickValue}>
              {estimatedPerDelivery > 0 ? formatPkr(estimatedPerDelivery) : '—'}
            </Text>
          </View>
          <View style={styles.quickRow}>
            <Text style={styles.quickLabel}>Today's earnings</Text>
            <Text style={styles.quickValue}>{formatPkr(stats.todayEarnings)}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
