import React, { useCallback } from 'react';
import {
  FlatList,
  ListRenderItem,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useGetSellerAnalyticsQuery } from '@services/sellerApi';
import { useTheme } from '@shared/theme';
import {
  ErrorBanner,
  SectionHeader,
  Skeleton,
} from '@shared/components/ui';
import { formatPkr } from '@shared/utils';
import { DashHeader } from '@shared/components/DashHeader';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TopProduct {
  productId: string;
  title: string;
  totalSold: number;
  revenue: number;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function AnalyticsSkeleton(): React.JSX.Element {
  const { sp, r } = useTheme();
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={{ padding: sp.base, gap: sp.xl }}>
        <Skeleton width="100%" height={100} radius={r.lg} />
        <View style={{ gap: sp.sm }}>
          <Skeleton width={140} height={18} />
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} width="100%" height={60} radius={r.md} />
          ))}
        </View>
        <View style={{ gap: sp.sm }}>
          <Skeleton width={160} height={18} />
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} width="100%" height={44} radius={r.md} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

// ─── Top Product Row ──────────────────────────────────────────────────────────

export interface TopProductRowProps {
  item: TopProduct;
  rank: number;
}

export const TopProductRow = React.memo(function TopProductRow({
  item,
  rank,
}: TopProductRowProps): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();

  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: sp.md,
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: sp.md,
      marginBottom: sp.xs,
      ...elev.low,
    },
    rank: {
      width: 28,
      height: 28,
      borderRadius: r.sm,
      backgroundColor: colors.accentSubtle,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rankText: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.accent,
    },
    meta: { flex: 1 },
    title: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.textHigh,
    },
    sold: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
    },
    revenue: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.accent,
    },
  });

  return (
    <View style={styles.row}>
      <View style={styles.rank}>
        <Text style={styles.rankText}>{rank}</Text>
      </View>
      <View style={styles.meta}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.sold}>{item.totalSold} units sold</Text>
      </View>
      <Text style={styles.revenue}>{formatPkr(item.revenue)}</Text>
    </View>
  );
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SellerAnalyticsScreen(): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();

  const { data, isLoading, isError, refetch } = useGetSellerAnalyticsQuery();

  const renderTopProduct = useCallback<ListRenderItem<TopProduct>>(
    ({ item, index }) => <TopProductRow item={item} rank={index + 1} />,
    [],
  );

  const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg },
    content: { padding: sp.base, paddingBottom: sp['4xl'], gap: sp.xl },
    revenueCard: {
      backgroundColor: colors.elevated,
      borderRadius: r.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: sp.lg,
      alignItems: 'center',
      gap: sp.xs,
      ...elev.low,
    },
    revLabel: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansMed,
      color: colors.textMid,
    },
    revValue: {
      ...typo.scale.hero,
      fontFamily: typo.fonts.display,
      color: colors.accent,
    },
    section: { gap: sp.xs },
  });

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <DashHeader title="Analytics" subtitle="Seller Dashboard" />
        <AnalyticsSkeleton />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.screen}>
        <DashHeader title="Analytics" subtitle="Seller Dashboard" />
        <View style={{ padding: sp.base }}>
          <ErrorBanner
            message="Could not load analytics. Please try again."
            onRetry={refetch}
          />
        </View>
      </View>
    );
  }

  const totalRevenue = data.months.reduce((sum, m) => sum + m.amount, 0);

  return (
    <View style={styles.screen}>
      <DashHeader title="Analytics" subtitle="Seller Dashboard" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Revenue summary */}
        <View style={styles.revenueCard}>
          <Text style={styles.revLabel}>Total Revenue</Text>
          <Text style={styles.revValue}>{formatPkr(totalRevenue)}</Text>
          <Text
            style={[typo.scale.caption, { fontFamily: typo.fonts.sans, color: colors.textLow }]}
          >
            Across all time
          </Text>
        </View>

        {/* Top Products */}
        <View style={styles.section}>
          <SectionHeader title="Top Products" />
          {data.topProducts.length === 0 ? (
            <Text
              style={[
                typo.scale.bodySmall,
                { fontFamily: typo.fonts.sans, color: colors.textMid },
              ]}
            >
              No product data available yet.
            </Text>
          ) : (
            <FlatList
              data={data.topProducts}
              keyExtractor={(item) => item.productId}
              renderItem={renderTopProduct}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}
