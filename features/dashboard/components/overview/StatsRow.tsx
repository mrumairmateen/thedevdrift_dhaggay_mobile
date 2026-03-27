import { StatCard } from '@features/dashboard/components/shared/StatCard';
import type { DashboardStats } from '@features/dashboard/dashboard.types';
import { useTheme } from '@shared/theme';
import { StyleSheet, View } from 'react-native';

interface Props {
  stats: DashboardStats;
}

export function StatsRow({ stats }: Props) {
  const { sp } = useTheme();

  return (
    <View style={[styles.grid, { gap: sp.sm }]}>
      <StatCard value={stats.totalOrders} label="Total Orders" />
      <StatCard value={stats.activeOrders} label="Active" />
      <StatCard value={(stats.loyaltyPoints ?? 0).toLocaleString()} label="Points" />
      <StatCard value={stats.referralCount} label="Referrals" />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
