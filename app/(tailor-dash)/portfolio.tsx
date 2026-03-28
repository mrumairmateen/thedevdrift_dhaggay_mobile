import React, { useCallback } from 'react';
import {
  FlatList,
  ListRenderItem,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';

import { useGetTailorMeQuery } from '@services/tailorDashApi';
import type { TailorPortfolioEntry } from '@services/tailorDashApi';
import { useTheme } from '@shared/theme';
import { EmptyState, ErrorBanner, Skeleton } from '@shared/components/ui';
import { DashHeader } from '@shared/components/DashHeader';
import { IconSymbol } from '@shared/components/ui/icon-symbol';

// ─── Portfolio card ────────────────────────────────────────────────────────────

const COLUMN_GAP = 10;
// Fixed card width: assumes ~390pt screen, 2 × sp.base padding, 1 gap
const CARD_WIDTH = (390 - 32 - COLUMN_GAP) / 2;

interface PortfolioCardProps {
  item: TailorPortfolioEntry;
}

const PortfolioCard = React.memo(function PortfolioCard({
  item,
}: PortfolioCardProps): React.JSX.Element {
  const { colors, sp, r, typo } = useTheme();

  const styles = StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      aspectRatio: 1,
      backgroundColor: colors.panel,
    },
    meta: {
      padding: sp.sm,
    },
    caption: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sansMed,
      color: colors.textHigh,
    },
    date: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textLow,
      marginTop: 2,
    },
  });

  const dateStr = new Date(item.createdAt).toLocaleDateString('en-PK', {
    month: 'short',
    year: 'numeric',
  });

  return (
    <View style={styles.card}>
      <Image source={{ uri: item.imageUrl }} style={styles.image} contentFit="cover" />
      <View style={styles.meta}>
        {item.caption !== null && item.caption.length > 0 && (
          <Text style={styles.caption} numberOfLines={2}>
            {item.caption}
          </Text>
        )}
        <Text style={styles.date}>{dateStr}</Text>
      </View>
    </View>
  );
});

// ─── Stats row ────────────────────────────────────────────────────────────────

interface StatsRowProps {
  completedOrders: number;
  portfolioCount: number;
  currentLoad: number;
  weeklyCapacity: number;
}

const StatsRow = React.memo(function StatsRow({
  completedOrders,
  portfolioCount,
  currentLoad,
  weeklyCapacity,
}: StatsRowProps): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();

  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: sp.sm,
      paddingHorizontal: sp.base,
      marginTop: sp.lg,
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
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.row}>
      <View style={styles.card}>
        <IconSymbol name="checkmark.seal.fill" size={18} color={colors.accent} />
        <Text style={styles.value}>{completedOrders}</Text>
        <Text style={styles.label}>Completed</Text>
      </View>
      <View style={styles.card}>
        <IconSymbol name="photo.on.rectangle" size={18} color={colors.accent} />
        <Text style={styles.value}>{portfolioCount}</Text>
        <Text style={styles.label}>Portfolio</Text>
      </View>
      <View style={styles.card}>
        <IconSymbol name="gauge" size={18} color={colors.accent} />
        <Text style={styles.value}>{currentLoad}/{weeklyCapacity}</Text>
        <Text style={styles.label}>Load</Text>
      </View>
    </View>
  );
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PortfolioScreen(): React.JSX.Element {
  const { colors, sp, r, typo } = useTheme();

  const { data, isLoading, isError, refetch } = useGetTailorMeQuery();

  const renderItem = useCallback<ListRenderItem<TailorPortfolioEntry>>(
    ({ item }) => <PortfolioCard item={item} />,
    [],
  );

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
    },
    infoText: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
      flex: 1,
    },
    grid: {
      paddingHorizontal: sp.base,
      marginTop: sp.lg,
    },
    columnWrapper: {
      gap: COLUMN_GAP,
      marginBottom: COLUMN_GAP,
    },
    emptySection: {
      marginTop: sp.xl,
      paddingHorizontal: sp.base,
    },
    skeletonRow: {
      flexDirection: 'row',
      gap: sp.sm,
      paddingHorizontal: sp.base,
      marginTop: sp.lg,
    },
    skeletonStat: {
      flex: 1,
      height: 80,
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    skeletonGrid: {
      flexDirection: 'row',
      gap: COLUMN_GAP,
      paddingHorizontal: sp.base,
      marginTop: sp.lg,
    },
    skeletonItem: {
      flex: 1,
      height: 200,
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
        <DashHeader title="My Portfolio" subtitle="Tailor Dashboard" />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.skeletonRow}>
            <View style={styles.skeletonStat} />
            <View style={styles.skeletonStat} />
            <View style={styles.skeletonStat} />
          </View>
          <View style={styles.skeletonGrid}>
            <View style={styles.skeletonItem} />
            <View style={styles.skeletonItem} />
          </View>
          <View style={[styles.skeletonGrid, { marginTop: COLUMN_GAP }]}>
            <View style={styles.skeletonItem} />
            <View style={styles.skeletonItem} />
          </View>
        </ScrollView>
      </View>
    );
  }

  if (isError || data === undefined) {
    return (
      <View style={styles.screen}>
        <DashHeader title="My Portfolio" subtitle="Tailor Dashboard" />
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
      <DashHeader title="My Portfolio" subtitle="Tailor Dashboard" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Stats */}
        <StatsRow
          completedOrders={data.completedOrders}
          portfolioCount={data.portfolio.length}
          currentLoad={data.currentLoad}
          weeklyCapacity={data.weeklyCapacity}
        />

        {/* Info banner */}
        <View style={styles.infoCard}>
          <IconSymbol name="info.circle.fill" size={18} color={colors.accent} />
          <Text style={styles.infoText}>
            Portfolio management is available on the Dhaggay web portal.
          </Text>
        </View>

        {/* Portfolio grid or empty state */}
        {data.portfolio.length === 0 ? (
          <View style={styles.emptySection}>
            <EmptyState
              icon={<IconSymbol name="paintbrush.fill" size={36} color={colors.textLow} />}
              title="No portfolio items yet"
              message="Add your work via the Dhaggay web portal to showcase here."
            />
          </View>
        ) : (
          <FlatList
            data={data.portfolio}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            scrollEnabled={false}
            style={styles.grid}
          />
        )}

      </ScrollView>
    </View>
  );
}
