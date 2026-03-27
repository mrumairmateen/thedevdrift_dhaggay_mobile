import { ActiveOrderCard } from '@features/dashboard/components/overview/ActiveOrderCard';
import { QuickActions } from '@features/dashboard/components/overview/QuickActions';
import { StatsRow } from '@features/dashboard/components/overview/StatsRow';
import { DashboardHeader } from '@features/dashboard/components/shared/DashboardHeader';
import { EmptyState } from '@features/dashboard/components/shared/EmptyState';
import { useTheme } from '@shared/theme';
import { useAppSelector } from '@store/index';
import { useGetDashboardQuery } from '@services/dashboardApi';
import { useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

function Skeleton() {
  const { colors, sp, r } = useTheme();
  return (
    <View style={{ padding: sp.base, gap: sp.sm }}>
      {/* Stats skeleton */}
      <View style={{ flexDirection: 'row', gap: sp.sm }}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={{ flex: 1, height: 88, backgroundColor: colors.panel, borderRadius: r.lg }}
          />
        ))}
      </View>
      {/* Order skeleton */}
      <View style={{ height: 120, backgroundColor: colors.panel, borderRadius: r.lg, marginTop: sp.sm }} />
      <View style={{ height: 120, backgroundColor: colors.panel, borderRadius: r.lg }} />
    </View>
  );
}

export default function OverviewScreen() {
  const { colors, sp, typo } = useTheme();
  const user = useAppSelector((s) => s.auth.user);
  const router = useRouter();
  const { data, isLoading } = useGetDashboardQuery();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const quickActions = [
    {
      icon: 'bag.fill',
      label: 'Browse Fabrics',
      onPress: () => router.push('/(tabs)/shop' as any),
    },
    {
      icon: 'scissors',
      label: 'Find a Tailor',
      onPress: () => router.push('/(tabs)/tailors' as any),
    },
    {
      icon: 'paintbrush.fill',
      label: 'My Designs',
      onPress: () => router.push('/(dashboard)/wishlist' as any),
    },
    {
      icon: 'ruler.fill',
      label: 'Measurements',
      onPress: () =>
        Alert.alert('Coming Soon', 'Measurements management will be available in the next update.'),
    },
  ];

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <DashboardHeader title="My Dashboard" />

      {isLoading ? (
        <Skeleton />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: sp['3xl'] }}
        >
          {/* Greeting */}
          <View style={{ padding: sp.base, paddingBottom: sp.sm }}>
            <Text
              style={[typo.scale.title2, { fontFamily: typo.fonts.serifBold, color: colors.textHigh }]}
            >
              {greeting()}, {data?.user?.name?.split(' ')[0] ?? user?.name?.split(' ')[0] ?? 'there'}
            </Text>
            <Text
              style={[
                typo.scale.body,
                { fontFamily: typo.fonts.sans, color: colors.textMid, marginTop: 2 },
              ]}
            >
              Here's your Dhaggay overview
            </Text>
          </View>

          {/* Stats */}
          {data?.stats && (
            <View style={{ paddingHorizontal: sp.base, marginBottom: sp.base }}>
              <StatsRow stats={data.stats} />
            </View>
          )}

          {/* Active Orders */}
          <View style={{ paddingHorizontal: sp.base, marginBottom: sp.base }}>
            <View style={[styles.sectionHeader, { marginBottom: sp.sm }]}>
              <Text
                style={[
                  typo.scale.label,
                  {
                    fontFamily: typo.fonts.sansMed,
                    color: colors.textLow,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  },
                ]}
              >
                In Progress
              </Text>
              <Text
                onPress={() => router.push('/(dashboard)/orders' as any)}
                style={[
                  typo.scale.caption,
                  { fontFamily: typo.fonts.sansMed, color: colors.accent },
                ]}
              >
                See all
              </Text>
            </View>

            {data?.activeOrders && data.activeOrders.length > 0 ? (
              data.activeOrders.slice(0, 2).map((order) => (
                <ActiveOrderCard key={order._id} order={order} />
              ))
            ) : (
              <EmptyState
                icon="shippingbox.fill"
                title="No active orders"
                message="Your in-progress orders will appear here."
                ctaLabel="Start Shopping"
                onCta={() => router.push('/(tabs)/shop' as any)}
              />
            )}
          </View>

          {/* Quick Actions */}
          <View style={{ paddingHorizontal: sp.base }}>
            <Text
              style={[
                typo.scale.label,
                {
                  fontFamily: typo.fonts.sansMed,
                  color: colors.textLow,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  marginBottom: sp.sm,
                },
              ]}
            >
              Quick Actions
            </Text>
            <QuickActions actions={quickActions} />
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
