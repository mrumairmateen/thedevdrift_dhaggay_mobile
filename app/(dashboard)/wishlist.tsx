import { WishlistDesignCard } from '@features/dashboard/components/wishlist/WishlistDesignCard';
import { WishlistFabricCard } from '@features/dashboard/components/wishlist/WishlistFabricCard';
import { WishlistTabBar } from '@features/dashboard/components/wishlist/WishlistTabBar';
import { DashboardHeader } from '@features/dashboard/components/shared/DashboardHeader';
import { EmptyState } from '@features/dashboard/components/shared/EmptyState';
import { useTheme } from '@shared/theme';
import { useGetWishlistQuery } from '@services/wishlistApi';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

type Tab = 'fabrics' | 'designs';

export default function WishlistScreen() {
  const { colors, sp } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('fabrics');
  const { data, isLoading } = useGetWishlistQuery();

  const fabrics = data?.products ?? [];
  const designs = data?.designs ?? [];

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <DashboardHeader title="Wishlist" />

      <WishlistTabBar
        active={activeTab}
        onChange={setActiveTab}
        fabricCount={fabrics.length}
        designCount={designs.length}
      />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : activeTab === 'fabrics' ? (
        fabrics.length === 0 ? (
          <EmptyState
            icon="bag.fill"
            title="No saved fabrics"
            message="Browse the shop and save fabrics you love."
            ctaLabel="Browse Shop"
            onCta={() => router.push('/(tabs)/shop' as any)}
          />
        ) : (
          <FlatList
            data={fabrics}
            keyExtractor={(item) => item._id}
            numColumns={2}
            renderItem={({ item }) => <WishlistFabricCard product={item} />}
            contentContainerStyle={{ padding: sp.xs, paddingBottom: sp['3xl'] }}
            showsVerticalScrollIndicator={false}
          />
        )
      ) : designs.length === 0 ? (
        <EmptyState
          icon="paintbrush.fill"
          title="No saved designs"
          message="Browse design inspirations and save your favourites."
          ctaLabel="Browse Designs"
          onCta={() => router.push('/(tabs)/designs' as any)}
        />
      ) : (
        <FlatList
          data={designs}
          keyExtractor={(item) => item._id}
          numColumns={2}
          renderItem={({ item }) => <WishlistDesignCard design={item} />}
          contentContainerStyle={{ padding: sp.xs, paddingBottom: sp['3xl'] }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
