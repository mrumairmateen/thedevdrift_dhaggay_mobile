import React, { useCallback } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useGetOrderByIdQuery } from '@services/ordersApi';
import { useTheme } from '@shared/theme';
import { ErrorBanner, Skeleton } from '@shared/components/ui';
import { IconSymbol } from '@shared/components/ui/icon-symbol';
import { OrderDetailView } from '@features/dashboard/components/orders/OrderDetailView';

// ─── Full-screen skeleton ─────────────────────────────────────────────────────

function OrderDetailSkeleton(): React.JSX.Element {
  const { colors, sp, r } = useTheme();
  const styles = StyleSheet.create({
    content: { padding: sp.base, gap: sp.base },
  });
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Skeleton width="100%" height={80} radius={r.lg} />
        <Skeleton width="100%" height={110} radius={r.lg} />
        <Skeleton width="100%" height={80} radius={r.lg} />
        <Skeleton width="100%" height={80} radius={r.lg} />
      </View>
    </ScrollView>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function OrderDetailScreen(): React.JSX.Element {
  const { colors, sp, typo, elev } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const orderId = id ?? '';
  const { data: order, isLoading, isError, refetch } = useGetOrderByIdQuery(orderId);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleShare = useCallback(() => {
    Alert.alert('Share Order', `Order ${order?.orderNumber ?? ''}`);
  }, [order?.orderNumber]);

  const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg },
    header: {
      backgroundColor: colors.navSolid,
      paddingTop: insets.top + sp.sm,
      paddingHorizontal: sp.base,
      paddingBottom: sp.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      ...elev.high,
    },
    headerSide: {
      width: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      ...typo.scale.title3,
      fontFamily: typo.fonts.serifBold,
      color: colors.textHigh,
      flex: 1,
      textAlign: 'center',
    },
    errorContainer: {
      flex: 1,
      padding: sp.base,
      paddingTop: sp.lg,
    },
  });

  const headerTitle = order ? `Order #${order.orderNumber}` : 'Order Detail';

  return (
    <View style={styles.screen}>
      {/* Custom header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} hitSlop={8} style={styles.headerSide}>
          <IconSymbol name="chevron.left" size={22} color={colors.textHigh} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {headerTitle}
        </Text>
        <Pressable onPress={handleShare} hitSlop={8} style={styles.headerSide}>
          <IconSymbol name="square.and.arrow.up" size={20} color={colors.textMid} />
        </Pressable>
      </View>

      {/* Async states */}
      {isLoading ? (
        <OrderDetailSkeleton />
      ) : isError || !order ? (
        <View style={styles.errorContainer}>
          <ErrorBanner
            message="Could not load order details. Please try again."
            onRetry={refetch}
          />
        </View>
      ) : (
        <OrderDetailView order={order} />
      )}
    </View>
  );
}
