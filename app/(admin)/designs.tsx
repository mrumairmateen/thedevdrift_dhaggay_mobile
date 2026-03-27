import React, { useCallback } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import {
  useGetAdminDesignsQuery,
  useToggleDesignTrendingMutation,
} from '@services/adminApi';
import type { AdminDesign } from '@services/adminApi';
import { useTheme } from '@shared/theme';
import {
  Badge,
  ErrorBanner,
  ScreenHeader,
} from '@shared/components/ui';
import { IconSymbol } from '@shared/components/ui/icon-symbol';

// ─── Design Row ───────────────────────────────────────────────────────────────

interface DesignRowProps {
  design: AdminDesign;
}

const DesignRow = React.memo(function DesignRow({ design }: DesignRowProps): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();
  const [toggleDesignTrending, { isLoading }] = useToggleDesignTrendingMutation();

  const handleToggle = useCallback(
    (value: boolean) => {
      void toggleDesignTrending({ id: design._id, isTrending: value });
    },
    [toggleDesignTrending, design._id],
  );

  const styles = StyleSheet.create({
    row: {
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      padding: sp.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: sp.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: sp.sm,
      ...elev.low,
    },
    thumbnail: {
      width: 48,
      height: 48,
      borderRadius: r.sm,
      backgroundColor: colors.panel,
    },
    info: { flex: 1, gap: sp.xs },
    title: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.textHigh,
    },
    meta: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
    },
    usageRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: sp.xs,
    },
    usageText: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textLow,
    },
    right: {
      alignItems: 'center',
      gap: sp.xs,
    },
  });

  return (
    <View style={styles.row}>
      {design.imageUrl !== null ? (
        <Image
          source={{ uri: design.imageUrl }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.thumbnail}>
          <IconSymbol name="paintbrush.fill" size={24} color={colors.textLow} />
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {design.title}
        </Text>
        <Text style={styles.meta}>
          {design.garmentCategorySlug} · {design.gender}
        </Text>
        <View style={styles.usageRow}>
          <IconSymbol name="person.fill" size={12} color={colors.textLow} />
          <Text style={styles.usageText}>{design.usageCount} uses</Text>
          {design.isTrending && (
            <Badge label="Trending" variant="warning" size="sm" />
          )}
        </View>
      </View>
      <View style={styles.right}>
        <Switch
          value={design.isTrending}
          onValueChange={handleToggle}
          disabled={isLoading}
          trackColor={{ false: colors.border, true: colors.accentMid }}
          thumbColor={design.isTrending ? colors.accent : colors.textLow}
        />
      </View>
    </View>
  );
});

// ─── Skeleton Row ─────────────────────────────────────────────────────────────

function DesignRowSkeleton(): React.JSX.Element {
  const { colors, sp, r } = useTheme();

  const styles = StyleSheet.create({
    row: {
      height: 80,
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: sp.sm,
    },
  });

  return <View style={styles.row} />;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AdminDesignsScreen(): React.JSX.Element {
  const { colors, sp } = useTheme();
  const router = useRouter();

  const { data, isLoading, isError, refetch } = useGetAdminDesignsQuery({ page: 1, limit: 50 });

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const renderDesign = useCallback(
    ({ item }: { item: AdminDesign }) => <DesignRow design={item} />,
    [],
  );

  const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg },
    list: { flex: 1 },
    listContent: { padding: sp.base, paddingBottom: sp['4xl'] },
    errorWrap: { padding: sp.base },
    skeletonWrap: { padding: sp.base },
    emptyWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: sp['2xl'],
      gap: sp.md,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600' as const,
      color: colors.textHigh,
    },
    emptyMsg: {
      fontSize: 14,
      color: colors.textMid,
      textAlign: 'center' as const,
    },
  });

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Designs" onBack={handleBack} />

      {isLoading ? (
        <View style={styles.skeletonWrap}>
          {[0, 1, 2, 3, 4].map((i) => (
            <DesignRowSkeleton key={i} />
          ))}
        </View>
      ) : isError ? (
        <View style={styles.errorWrap}>
          <ErrorBanner
            message="Could not load designs. Please try again."
            onRetry={refetch}
          />
        </View>
      ) : (
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={data?.designs ?? []}
          keyExtractor={(item) => item._id}
          renderItem={renderDesign}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <IconSymbol name="paintbrush.fill" size={40} color={colors.textLow} />
              <Text style={styles.emptyTitle}>No designs</Text>
              <Text style={styles.emptyMsg}>No designs found in the catalogue.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
