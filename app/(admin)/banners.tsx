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
  useGetAdminBannersQuery,
  useToggleBannerMutation,
} from '@services/adminApi';
import type { AdminBanner } from '@services/adminApi';
import { useTheme } from '@shared/theme';
import {
  Badge,
  ErrorBanner,
  ScreenHeader,
} from '@shared/components/ui';
import { IconSymbol } from '@shared/components/ui/icon-symbol';

// ─── Banner Row ───────────────────────────────────────────────────────────────

interface BannerRowProps {
  banner: AdminBanner;
}

const BannerRow = React.memo(function BannerRow({ banner }: BannerRowProps): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();
  const [toggleBanner, { isLoading }] = useToggleBannerMutation();

  const handleToggle = useCallback(
    (value: boolean) => {
      void toggleBanner({ id: banner._id, isActive: value });
    },
    [toggleBanner, banner._id],
  );

  const formatDate = (iso: string | null): string => {
    if (iso === null) return '—';
    return new Date(iso).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const styles = StyleSheet.create({
    row: {
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      padding: sp.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: sp.sm,
      gap: sp.sm,
      ...elev.low,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: sp.sm,
    },
    preview: {
      width: 64,
      height: 40,
      borderRadius: r.sm,
      backgroundColor: colors.panel,
    },
    previewPlaceholder: {
      width: 64,
      height: 40,
      borderRadius: r.sm,
      backgroundColor: colors.panel,
      alignItems: 'center',
      justifyContent: 'center',
    },
    info: { flex: 1, gap: sp.xs },
    title: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.textHigh,
    },
    link: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.accent,
    },
    meta: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
    },
    bottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    badgeRow: {
      flexDirection: 'row',
      gap: sp.xs,
      alignItems: 'center',
    },
  });

  return (
    <View style={styles.row}>
      <View style={styles.topRow}>
        {banner.imageUrl.length > 0 ? (
          <Image
            source={{ uri: banner.imageUrl }}
            style={styles.preview}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.previewPlaceholder}>
            <IconSymbol name="square.and.arrow.up" size={20} color={colors.textLow} />
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{banner.title}</Text>
          {banner.linkUrl !== null && (
            <Text style={styles.link} numberOfLines={1}>{banner.linkUrl}</Text>
          )}
          <Text style={styles.meta}>
            {formatDate(banner.startsAt)} → {formatDate(banner.endsAt)}
          </Text>
          <Text style={styles.meta}>Order #{banner.order}</Text>
        </View>
      </View>
      <View style={styles.bottomRow}>
        <View style={styles.badgeRow}>
          <Badge
            label={banner.isActive ? 'Active' : 'Inactive'}
            variant={banner.isActive ? 'success' : 'neutral'}
            size="sm"
          />
        </View>
        <Switch
          value={banner.isActive}
          onValueChange={handleToggle}
          disabled={isLoading}
          trackColor={{ false: colors.border, true: colors.accentMid }}
          thumbColor={banner.isActive ? colors.accent : colors.textLow}
        />
      </View>
    </View>
  );
});

// ─── Skeleton Row ─────────────────────────────────────────────────────────────

function BannerRowSkeleton(): React.JSX.Element {
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

export default function AdminBannersScreen(): React.JSX.Element {
  const { colors, sp } = useTheme();
  const router = useRouter();

  const { data, isLoading, isError, refetch } = useGetAdminBannersQuery();

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const renderBanner = useCallback(
    ({ item }: { item: AdminBanner }) => <BannerRow banner={item} />,
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
      <ScreenHeader title="Banners" onBack={handleBack} />

      {isLoading ? (
        <View style={styles.skeletonWrap}>
          {[0, 1, 2, 3].map((i) => (
            <BannerRowSkeleton key={i} />
          ))}
        </View>
      ) : isError ? (
        <View style={styles.errorWrap}>
          <ErrorBanner
            message="Could not load banners. Please try again."
            onRetry={refetch}
          />
        </View>
      ) : (
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={data ?? []}
          keyExtractor={(item) => item._id}
          renderItem={renderBanner}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <IconSymbol name="square.and.arrow.up" size={40} color={colors.textLow} />
              <Text style={styles.emptyTitle}>No banners</Text>
              <Text style={styles.emptyMsg}>No promotional banners have been created yet.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
