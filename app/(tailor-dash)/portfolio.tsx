import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useGetTailorDashboardQuery } from '@services/tailorDashApi';
import { useTheme } from '@shared/theme';
import { EmptyState, ErrorBanner, ScreenHeader, Skeleton } from '@shared/components/ui';
import { IconSymbol } from '@shared/components/ui/icon-symbol';

// ─── Quick stats row ──────────────────────────────────────────────────────────

interface QuickStatsRowProps {
  rating: number;
  reviewCount: number;
}

const QuickStatsRow = React.memo(function QuickStatsRow({
  rating,
  reviewCount,
}: QuickStatsRowProps): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();

  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: sp.sm,
      marginTop: sp.lg,
      paddingHorizontal: sp.base,
    },
    card: {
      flex: 1,
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: sp.md,
      alignItems: 'center',
      gap: sp.xs,
      ...elev.low,
    },
    value: {
      ...typo.scale.title2,
      fontFamily: typo.fonts.display,
      color: colors.accent,
    },
    label: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
    },
  });

  return (
    <View style={styles.row}>
      <View style={styles.card}>
        <IconSymbol name="star.fill" size={18} color={colors.warning} />
        <Text style={styles.value}>{rating.toFixed(1)}</Text>
        <Text style={styles.label}>Rating</Text>
      </View>
      <View style={styles.card}>
        <IconSymbol name="hand.thumbsup.fill" size={18} color={colors.accent} />
        <Text style={styles.value}>{reviewCount.toLocaleString()}</Text>
        <Text style={styles.label}>Reviews</Text>
      </View>
    </View>
  );
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PortfolioScreen(): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();

  const { data, isLoading, isError, refetch } = useGetTailorDashboardQuery();

  const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg },
    content: { paddingBottom: sp['4xl'] },
    infoCard: {
      marginHorizontal: sp.base,
      marginTop: sp.lg,
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: sp.md,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: sp.sm,
      ...elev.low,
    },
    infoText: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
      flex: 1,
    },
    emptySection: {
      marginTop: sp.xl,
      paddingHorizontal: sp.base,
    },
    skeletonStats: {
      flexDirection: 'row',
      gap: sp.sm,
      marginTop: sp.lg,
      paddingHorizontal: sp.base,
    },
    skeletonCard: {
      flex: 1,
      height: 80,
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    errorContainer: { padding: sp.base, marginTop: sp.lg },
  });

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="My Portfolio" />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.skeletonStats}>
            <View style={styles.skeletonCard} />
            <View style={styles.skeletonCard} />
          </View>
          <View style={{ padding: sp.base, marginTop: sp.lg }}>
            <Skeleton width="100%" height={64} radius={r.md} />
          </View>
        </ScrollView>
      </View>
    );
  }

  if (isError || data === undefined) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="My Portfolio" />
        <View style={styles.errorContainer}>
          <ErrorBanner
            message="Could not load portfolio data. Please try again."
            onRetry={refetch}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader title="My Portfolio" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Quick stats */}
        <QuickStatsRow
          rating={data.profile.rating}
          reviewCount={data.profile.reviewCount}
        />

        {/* Info card */}
        <View style={styles.infoCard}>
          <IconSymbol name="info.circle.fill" size={18} color={colors.accent} />
          <Text style={styles.infoText}>
            Showcase your work — portfolio management is available on the Dhaggay web portal.
          </Text>
        </View>

        {/* Empty state */}
        <View style={styles.emptySection}>
          <EmptyState
            icon={<IconSymbol name="paintbrush.fill" size={36} color={colors.textLow} />}
            title="No portfolio items yet"
            message="Your completed work will appear here once orders are delivered."
          />
        </View>
      </ScrollView>
    </View>
  );
}
