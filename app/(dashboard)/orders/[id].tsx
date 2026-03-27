import { OrderDetailView } from '@features/dashboard/components/orders/OrderDetailView';
import { DashboardHeader } from '@features/dashboard/components/shared/DashboardHeader';
import { useTheme } from '@shared/theme';
import { useGetOrderByIdQuery } from '@services/ordersApi';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';

export default function OrderDetailScreen() {
  const { colors, sp, typo } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: order, isLoading, isError } = useGetOrderByIdQuery(id ?? '');

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <DashboardHeader title={order ? `Order #${order.orderNumber}` : 'Order Detail'} />

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : isError || !order ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: sp.base }}>
          <Text style={[typo.scale.body, { fontFamily: typo.fonts.sans, color: colors.textMid }]}>
            Could not load order details.
          </Text>
        </View>
      ) : (
        <OrderDetailView order={order} />
      )}
    </View>
  );
}
