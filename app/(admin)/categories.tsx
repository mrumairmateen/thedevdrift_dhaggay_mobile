import React, { useCallback } from 'react';
import {
  FlatList,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import {
  useGetAdminCategoriesQuery,
  useToggleCategoryActiveMutation,
} from '@services/adminApi';
import type { AdminCategory } from '@services/adminApi';
import { useTheme } from '@shared/theme';
import {
  Badge,
  ErrorBanner,
  ScreenHeader,
} from '@shared/components/ui';
import { IconSymbol } from '@shared/components/ui/icon-symbol';

// ─── Category Row ─────────────────────────────────────────────────────────────

interface CategoryRowProps {
  category: AdminCategory;
}

const CategoryRow = React.memo(function CategoryRow({
  category,
}: CategoryRowProps): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();
  const [toggleCategoryActive, { isLoading }] = useToggleCategoryActiveMutation();

  const handleToggle = useCallback(
    (value: boolean) => {
      void toggleCategoryActive({ id: category._id, isActive: value });
    },
    [toggleCategoryActive, category._id],
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
      alignItems: 'flex-start',
      gap: sp.sm,
      ...elev.low,
    },
    info: { flex: 1, gap: sp.xs },
    name: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.textHigh,
    },
    slug: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textLow,
    },
    meta: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
    },
    badgeRow: {
      flexDirection: 'row',
      gap: sp.xs,
      flexWrap: 'wrap',
      marginTop: sp.xs,
    },
    right: {
      alignItems: 'center',
      gap: sp.xs,
      paddingTop: sp.xs,
    },
  });

  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.name}>{category.name}</Text>
        <Text style={styles.slug}>{category.slug}</Text>
        <Text style={styles.meta}>
          {category.gender} · {category.tailorSpecialisation}
        </Text>
        <View style={styles.badgeRow}>
          <Badge
            label={category.isActive ? 'Active' : 'Inactive'}
            variant={category.isActive ? 'success' : 'neutral'}
            size="sm"
          />
          <Badge
            label={`${category.measurementFields.length} fields`}
            variant="info"
            size="sm"
          />
        </View>
      </View>
      <View style={styles.right}>
        <Switch
          value={category.isActive}
          onValueChange={handleToggle}
          disabled={isLoading}
          trackColor={{ false: colors.border, true: colors.accentMid }}
          thumbColor={category.isActive ? colors.accent : colors.textLow}
        />
      </View>
    </View>
  );
});

// ─── Skeleton Row ─────────────────────────────────────────────────────────────

function CategoryRowSkeleton(): React.JSX.Element {
  const { colors, sp, r } = useTheme();

  const styles = StyleSheet.create({
    row: {
      height: 100,
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

export default function AdminCategoriesScreen(): React.JSX.Element {
  const { colors, sp } = useTheme();
  const router = useRouter();

  const { data, isLoading, isError, refetch } = useGetAdminCategoriesQuery();

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const renderCategory = useCallback(
    ({ item }: { item: AdminCategory }) => <CategoryRow category={item} />,
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
      <ScreenHeader title="Garment Categories" onBack={handleBack} />

      {isLoading ? (
        <View style={styles.skeletonWrap}>
          {[0, 1, 2, 3, 4].map((i) => (
            <CategoryRowSkeleton key={i} />
          ))}
        </View>
      ) : isError ? (
        <View style={styles.errorWrap}>
          <ErrorBanner
            message="Could not load categories. Please try again."
            onRetry={refetch}
          />
        </View>
      ) : (
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={data ?? []}
          keyExtractor={(item) => item._id}
          renderItem={renderCategory}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <IconSymbol name="square.grid.2x2" size={40} color={colors.textLow} />
              <Text style={styles.emptyTitle}>No categories</Text>
              <Text style={styles.emptyMsg}>No garment categories found.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
