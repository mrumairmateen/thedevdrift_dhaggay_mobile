import React, { useCallback, useState } from 'react';
import {
  FlatList,
  ListRenderItem,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { useGetOrdersQuery } from '@services/ordersApi';
import { useTheme } from '@shared/theme';
import {
  EmptyState,
  ErrorBanner,
  Skeleton,
} from '@shared/components/ui';
import { IconSymbol } from '@shared/components/ui/icon-symbol';
import { DashboardHeader } from '@features/dashboard/components/shared/DashboardHeader';
import { OrderListItem } from '@features/dashboard/components/orders/OrderListItem';
import type { Order, OrderStatus } from '@features/dashboard/dashboard.types';

// ─── Filter config ────────────────────────────────────────────────────────────

type FilterTab = 'all' | 'active' | 'delivered' | 'cancelled';

interface FilterConfig {
  label: string;
  tab: FilterTab;
  status: OrderStatus | undefined;
}

const FILTER_TABS: FilterConfig[] = [
  { label: 'All', tab: 'all', status: undefined },
  { label: 'Active', tab: 'active', status: 'tailor_working' },
  { label: 'Delivered', tab: 'delivered', status: 'delivered_to_customer' },
  { label: 'Cancelled', tab: 'cancelled', status: 'cancelled_by_customer' },
];

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function OrdersListSkeleton(): React.JSX.Element {
  const { sp, r } = useTheme();
  return (
    <View style={{ padding: sp.base, gap: sp.sm }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Skeleton key={i} width="100%" height={86} radius={r.lg} />
      ))}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function OrdersScreen(): React.JSX.Element {
  const { colors, sp, r, typo } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [page, setPage] = useState(1);

  const filterStatus: OrderStatus | undefined =
    FILTER_TABS.find((f) => f.tab === activeTab)?.status;

  const { data, isLoading, isError, refetch } = useGetOrdersQuery({
    page,
    limit: 20,
    ...(filterStatus !== undefined ? { status: filterStatus } : {}),
  });

  const handleTabChange = useCallback((tab: FilterTab) => {
    setActiveTab(tab);
    setPage(1);
  }, []);

  const handleOrderPress = useCallback(
    (id: string) => {
      router.push(`/(dashboard)/orders/${id}` as never);
    },
    [router],
  );

  const renderItem = useCallback<ListRenderItem<Order>>(
    ({ item }) => <OrderListItem order={item} onPress={handleOrderPress} />,
    [handleOrderPress],
  );

  const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg },
    filterBar: {
      flexGrow: 0,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    filterContent: {
      paddingHorizontal: sp.base,
      paddingVertical: sp.sm,
      gap: sp.sm,
    },
    pill: {
      borderWidth: 1,
      borderRadius: r.pill,
      paddingHorizontal: sp.md,
      paddingVertical: sp.xs,
    },
    listContent: { padding: sp.base, paddingBottom: sp['2xl'] },
    pagination: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingHorizontal: sp.base,
      paddingVertical: sp.sm,
    },
    pageBtn: {
      borderRadius: r.sm,
      paddingHorizontal: sp.base,
      paddingVertical: sp.xs,
    },
  });

  return (
    <View style={styles.screen}>
      <DashboardHeader title="My Orders" showBack={false} />

      {/* Filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterContent}
      >
        {FILTER_TABS.map((f) => {
          const isActive = activeTab === f.tab;
          return (
            <Pressable
              key={f.tab}
              onPress={() => handleTabChange(f.tab)}
              style={[
                styles.pill,
                {
                  backgroundColor: isActive ? colors.accentSubtle : colors.chipBg,
                  borderColor: isActive ? colors.accent : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  typo.scale.caption,
                  {
                    fontFamily: isActive ? typo.fonts.sansBold : typo.fonts.sans,
                    color: isActive ? colors.accent : colors.textMid,
                  },
                ]}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Async states */}
      {isLoading ? (
        <OrdersListSkeleton />
      ) : isError ? (
        <View style={{ padding: sp.base }}>
          <ErrorBanner
            message="Could not load your orders. Please try again."
            onRetry={refetch}
          />
        </View>
      ) : !data || data.orders.length === 0 ? (
        <EmptyState
          icon={
            <IconSymbol name="shippingbox.fill" size={32} color={colors.textLow} />
          }
          title="No orders yet"
          message="Your orders will appear here once you place them."
        />
      ) : (
        <>
          <FlatList
            data={data.orders}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews
          />

          {/* Pagination */}
          {data.pages > 1 && (
            <View style={styles.pagination}>
              <Pressable
                onPress={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={[
                  styles.pageBtn,
                  {
                    backgroundColor:
                      page === 1 ? colors.panel : colors.accentSubtle,
                  },
                ]}
              >
                <Text
                  style={[
                    typo.scale.bodySmall,
                    {
                      fontFamily: typo.fonts.sansMed,
                      color: page === 1 ? colors.textLow : colors.accent,
                    },
                  ]}
                >
                  Prev
                </Text>
              </Pressable>

              <Text
                style={[
                  typo.scale.caption,
                  { fontFamily: typo.fonts.sans, color: colors.textMid },
                ]}
              >
                {page} / {data.pages}
              </Text>

              <Pressable
                onPress={() =>
                  setPage((p) => Math.min(data.pages, p + 1))
                }
                disabled={page === data.pages}
                style={[
                  styles.pageBtn,
                  {
                    backgroundColor:
                      page === data.pages ? colors.panel : colors.accentSubtle,
                  },
                ]}
              >
                <Text
                  style={[
                    typo.scale.bodySmall,
                    {
                      fontFamily: typo.fonts.sansMed,
                      color:
                        page === data.pages ? colors.textLow : colors.accent,
                    },
                  ]}
                >
                  Next
                </Text>
              </Pressable>
            </View>
          )}
        </>
      )}
    </View>
  );
}
