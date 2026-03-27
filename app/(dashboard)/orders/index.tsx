import { OrderListItem } from '@features/dashboard/components/orders/OrderListItem';
import { DashboardHeader } from '@features/dashboard/components/shared/DashboardHeader';
import { EmptyState } from '@features/dashboard/components/shared/EmptyState';
import type { OrderStatus } from '@features/dashboard/dashboard.types';
import { useTheme } from '@shared/theme';
import { useGetOrdersQuery } from '@services/ordersApi';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type FilterOption = 'all' | OrderStatus;

const FILTERS: { label: string; value: FilterOption }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'in_production' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
];

export default function OrdersScreen() {
  const { colors, sp, r, typo } = useTheme();
  const router = useRouter();
  const [filter, setFilter] = useState<FilterOption>('all');
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useGetOrdersQuery({
    page,
    limit: 15,
    status: filter === 'all' ? undefined : filter,
  });

  const handleOrderPress = (id: string) => {
    router.push(`/(dashboard)/orders/${id}` as any);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <DashboardHeader title="My Orders" />

      {/* Filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: sp.base,
          paddingVertical: sp.sm,
          gap: sp.sm,
        }}
        style={{ flexGrow: 0, borderBottomWidth: 1, borderBottomColor: colors.border }}
      >
        {FILTERS.map((f) => {
          const active = filter === f.value;
          return (
            <Pressable
              key={f.value}
              onPress={() => {
                setFilter(f.value);
                setPage(1);
              }}
              style={[
                styles.pill,
                {
                  backgroundColor: active ? colors.accentSubtle : colors.chipBg,
                  borderColor: active ? colors.accent : colors.border,
                  borderRadius: r.pill,
                  paddingHorizontal: sp.md,
                  paddingVertical: sp.xs,
                },
              ]}
            >
              <Text
                style={[
                  typo.scale.caption,
                  {
                    fontFamily: active ? typo.fonts.sansBold : typo.fonts.sans,
                    color: active ? colors.accent : colors.textMid,
                  },
                ]}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : !data?.orders.length ? (
        <EmptyState
          icon="shippingbox.fill"
          title="No orders yet"
          message="Your orders will appear here once you place them."
          ctaLabel="Start Shopping"
          onCta={() => router.push('/(tabs)/shop' as any)}
        />
      ) : (
        <>
          <FlatList
            data={data.orders}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <OrderListItem order={item} onPress={handleOrderPress} />
            )}
            contentContainerStyle={{ padding: sp.base, paddingBottom: sp['2xl'] }}
            showsVerticalScrollIndicator={false}
          />

          {/* Pagination */}
          {data.pages > 1 && (
            <View
              style={[
                styles.pagination,
                {
                  borderTopColor: colors.border,
                  paddingHorizontal: sp.base,
                  paddingVertical: sp.sm,
                },
              ]}
            >
              <Pressable
                onPress={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isFetching}
                style={[
                  styles.pageBtn,
                  {
                    backgroundColor: page === 1 ? colors.panel : colors.accentSubtle,
                    borderRadius: r.sm,
                    paddingHorizontal: sp.base,
                    paddingVertical: sp.xs,
                  },
                ]}
              >
                <Text
                  style={[
                    typo.scale.bodySmall,
                    { fontFamily: typo.fonts.sansMed, color: page === 1 ? colors.textLow : colors.accent },
                  ]}
                >
                  Prev
                </Text>
              </Pressable>

              <Text style={[typo.scale.caption, { fontFamily: typo.fonts.sans, color: colors.textMid }]}>
                {page} / {data.pages}
              </Text>

              <Pressable
                onPress={() => setPage((p) => Math.min(data.pages, p + 1))}
                disabled={page === data.pages || isFetching}
                style={[
                  styles.pageBtn,
                  {
                    backgroundColor: page === data.pages ? colors.panel : colors.accentSubtle,
                    borderRadius: r.sm,
                    paddingHorizontal: sp.base,
                    paddingVertical: sp.xs,
                  },
                ]}
              >
                <Text
                  style={[
                    typo.scale.bodySmall,
                    {
                      fontFamily: typo.fonts.sansMed,
                      color: page === data.pages ? colors.textLow : colors.accent,
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

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pill: { borderWidth: 1 },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
  },
  pageBtn: {},
});
