import React, { useCallback, useState } from 'react';
import {
  FlatList,
  ListRenderItem,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { useGetWishlistQuery } from '@services/wishlistApi';
import { useTheme } from '@shared/theme';
import { EmptyState, ErrorBanner, Skeleton } from '@shared/components/ui';
import { IconSymbol } from '@shared/components/ui/icon-symbol';

import { DashboardHeader } from '@features/dashboard/components/shared/DashboardHeader';
import { WishlistTabBar } from '@features/dashboard/components/wishlist/WishlistTabBar';
import { WishlistFabricCard } from '@features/dashboard/components/wishlist/WishlistFabricCard';
import { WishlistDesignCard } from '@features/dashboard/components/wishlist/WishlistDesignCard';
import type { WishlistDesign, WishlistProduct } from '@features/dashboard/dashboard.types';

type Tab = 'fabrics' | 'designs';

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function WishlistSkeleton(): React.JSX.Element {
  const { sp, r } = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: sp.xs, gap: sp.xs }}>
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} width="48%" height={200} radius={r.lg} />
      ))}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function WishlistScreen(): React.JSX.Element {
  const { colors, sp } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('fabrics');

  const { data, isLoading, isError, refetch } = useGetWishlistQuery();

  const fabrics = data?.products ?? [];
  const designs = data?.designs ?? [];

  const handleTabChange = useCallback((tab: Tab) => {
    setActiveTab(tab);
  }, []);

  const handleBrowseShop = useCallback(() => {
    router.push('/(tabs)/shop' as never);
  }, [router]);

  const handleBrowseDesigns = useCallback(() => {
    router.push('/(tabs)/designs' as never);
  }, [router]);

  const renderFabric = useCallback<ListRenderItem<WishlistProduct>>(
    ({ item }) => <WishlistFabricCard product={item} />,
    [],
  );

  const renderDesign = useCallback<ListRenderItem<WishlistDesign>>(
    ({ item }) => <WishlistDesignCard design={item} />,
    [],
  );

  const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg },
    listContent: { padding: sp.xs, paddingBottom: sp['3xl'] },
  });

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <DashboardHeader title="Wishlist" showBack={false} />
        <WishlistTabBar
          active={activeTab}
          onChange={handleTabChange}
          fabricCount={0}
          designCount={0}
        />
        <ScrollView showsVerticalScrollIndicator={false}>
          <WishlistSkeleton />
        </ScrollView>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.screen}>
        <DashboardHeader title="Wishlist" showBack={false} />
        <View style={{ padding: sp.base, marginTop: sp.lg }}>
          <ErrorBanner
            message="Could not load your wishlist. Please try again."
            onRetry={refetch}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <DashboardHeader title="Wishlist" showBack={false} />

      <WishlistTabBar
        active={activeTab}
        onChange={handleTabChange}
        fabricCount={fabrics.length}
        designCount={designs.length}
      />

      {activeTab === 'fabrics' ? (
        fabrics.length === 0 ? (
          <EmptyState
            icon={
              <IconSymbol name="bag.fill" size={32} color={colors.textLow} />
            }
            title="No saved fabrics"
            message="Browse the shop and save fabrics you love."
            action={{ label: 'Browse Shop', onPress: handleBrowseShop }}
          />
        ) : (
          <FlatList
            data={fabrics}
            keyExtractor={(item) => item._id}
            numColumns={2}
            renderItem={renderFabric}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews
          />
        )
      ) : designs.length === 0 ? (
        <EmptyState
          icon={
            <IconSymbol name="paintbrush.fill" size={32} color={colors.textLow} />
          }
          title="No saved designs"
          message="Browse design inspirations and save your favourites."
          action={{ label: 'Browse Designs', onPress: handleBrowseDesigns }}
        />
      ) : (
        <FlatList
          data={designs}
          keyExtractor={(item) => item._id}
          numColumns={2}
          renderItem={renderDesign}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
        />
      )}
    </View>
  );
}
