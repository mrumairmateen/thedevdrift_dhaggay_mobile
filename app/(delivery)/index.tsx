import React, { useCallback } from 'react';
import {
  FlatList,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  type ListRenderItem,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  useGetDeliveryDashboardQuery,
  useUpdateTaskStatusMutation,
  useToggleDutyStatusMutation,
  type DeliveryTask,
  type DeliveryTaskStatus,
} from '@services/deliveryApi';
import { useAppSelector } from '@store/index';
import { useTheme } from '@shared/theme';
import {
  EmptyState,
  ErrorBanner,
  SectionHeader,
  Skeleton,
} from '@shared/components/ui';
import { IconSymbol } from '@shared/components/ui/icon-symbol';
import { formatPkr } from '@shared/utils';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

type StatusColor = 'warning' | 'info' | 'accent' | 'success' | 'error';

const STATUS_COLOR_MAP: Record<DeliveryTaskStatus, StatusColor> = {
  assigned: 'warning',
  en_route_pickup: 'info',
  picked_up: 'info',
  en_route_delivery: 'accent',
  delivered: 'success',
  failed: 'error',
  returned: 'error',
};

const STATUS_LABEL_MAP: Record<DeliveryTaskStatus, string> = {
  assigned: 'Assigned',
  en_route_pickup: 'En Route Pickup',
  picked_up: 'Picked Up',
  en_route_delivery: 'En Route Delivery',
  delivered: 'Delivered',
  failed: 'Failed',
  returned: 'Returned',
};

type NextAction = { label: string; next: DeliveryTaskStatus } | null;

function getNextAction(status: DeliveryTaskStatus): NextAction {
  switch (status) {
    case 'assigned':
      return { label: 'Head to Pickup', next: 'en_route_pickup' };
    case 'en_route_pickup':
      return { label: 'Mark Picked Up', next: 'picked_up' };
    case 'picked_up':
      return { label: 'Head to Customer', next: 'en_route_delivery' };
    case 'en_route_delivery':
      return { label: 'Mark Delivered', next: 'delivered' };
    default:
      return null;
  }
}

function getFailAction(status: DeliveryTaskStatus): NextAction {
  if (status === 'en_route_delivery') {
    return { label: 'Mark Failed', next: 'failed' };
  }
  return null;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DeliverySkeleton(): React.JSX.Element {
  const { colors, sp, r } = useTheme();

  const styles = StyleSheet.create({
    statsRow: {
      flexDirection: 'row',
      gap: sp.sm,
      paddingHorizontal: sp.base,
      marginTop: sp.lg,
    },
    statCard: {
      flex: 1,
      height: 80,
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dutyCard: {
      height: 80,
      backgroundColor: colors.elevated,
      borderRadius: r.lg,
      borderWidth: 1,
      borderColor: colors.border,
      marginHorizontal: sp.base,
      marginTop: sp.lg,
    },
    section: { paddingHorizontal: sp.base, marginTop: sp.xl },
    taskCard: {
      height: 140,
      backgroundColor: colors.elevated,
      borderRadius: r.lg,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: sp.sm,
    },
  });

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.dutyCard} />
      <View style={styles.statsRow}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={styles.statCard} />
        ))}
      </View>
      <View style={styles.section}>
        <Skeleton width={120} height={18} />
        <View style={{ marginTop: sp.md }}>
          <View style={styles.taskCard} />
          <View style={styles.taskCard} />
        </View>
      </View>
    </ScrollView>
  );
}

// ─── DeliveryTaskCard ─────────────────────────────────────────────────────────

export interface DeliveryTaskCardProps {
  task: DeliveryTask;
  onStatusUpdate: (id: string, status: DeliveryTaskStatus) => void;
  isUpdating: boolean;
}

const DeliveryTaskCard = React.memo(function DeliveryTaskCard({
  task,
  onStatusUpdate,
  isUpdating,
}: DeliveryTaskCardProps): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();

  const statusColor = STATUS_COLOR_MAP[task.status] ?? 'info';
  const statusLabel = STATUS_LABEL_MAP[task.status] ?? task.status;
  const nextAction = getNextAction(task.status);
  const failAction = getFailAction(task.status);

  const resolveColor = (token: StatusColor): string => {
    switch (token) {
      case 'warning': return colors.warning;
      case 'info': return colors.info;
      case 'accent': return colors.accent;
      case 'success': return colors.success;
      case 'error': return colors.error;
    }
  };

  const resolveSubtleColor = (token: StatusColor): string => {
    switch (token) {
      case 'warning': return colors.warningSubtle;
      case 'info': return colors.infoSubtle;
      case 'accent': return colors.accentSubtle;
      case 'success': return colors.successSubtle;
      case 'error': return colors.errorSubtle;
    }
  };

  const handlePhone = useCallback(() => {
    void Linking.openURL(`tel:${task.customerPhone}`);
  }, [task.customerPhone]);

  const handleNext = useCallback(() => {
    if (nextAction) onStatusUpdate(task._id, nextAction.next);
  }, [nextAction, onStatusUpdate, task._id]);

  const handleFail = useCallback(() => {
    if (failAction) onStatusUpdate(task._id, failAction.next);
  }, [failAction, onStatusUpdate, task._id]);

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.elevated,
      borderRadius: r.lg,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: sp.sm,
      overflow: 'hidden',
      ...elev.low,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: sp.base,
      paddingVertical: sp.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    orderNumber: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansBold,
      color: colors.textHigh,
    },
    productTitle: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
      marginTop: 2,
    },
    statusBadge: {
      paddingHorizontal: sp.sm,
      paddingVertical: sp.xs,
      borderRadius: r.sharp,
      backgroundColor: resolveSubtleColor(statusColor),
    },
    statusText: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansMed,
      color: resolveColor(statusColor),
      fontSize: 9,
    },
    cardBody: {
      paddingHorizontal: sp.base,
      paddingVertical: sp.md,
      gap: sp.sm,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: sp.sm,
    },
    addressBlock: {
      flex: 1,
    },
    addressTypeLabel: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansMed,
      color: colors.textLow,
      fontSize: 9,
    },
    addressLine: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textHigh,
      marginTop: 1,
    },
    addressCity: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
    },
    customerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    customerName: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansMed,
      color: colors.textHigh,
    },
    phoneBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: sp.xs,
      paddingHorizontal: sp.sm,
      paddingVertical: sp.xs,
      borderRadius: r.sm,
      backgroundColor: colors.accentSubtle,
    },
    phoneText: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sansMed,
      color: colors.accent,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: sp.sm,
      paddingHorizontal: sp.base,
      paddingBottom: sp.md,
    },
    actionBtn: {
      flex: 1,
      backgroundColor: colors.accent,
      borderRadius: r.sm,
      paddingVertical: sp.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionBtnText: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansBold,
      color: colors.textOnAccent,
    },
    failBtn: {
      flex: 1,
      backgroundColor: colors.errorSubtle,
      borderRadius: r.sm,
      paddingVertical: sp.md,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.error,
    },
    failBtnText: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansBold,
      color: colors.error,
    },
  });

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.orderNumber}>#{task.orderNumber}</Text>
          <Text style={styles.productTitle}>{task.productTitle}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{statusLabel.toUpperCase()}</Text>
        </View>
      </View>

      {/* Body */}
      <View style={styles.cardBody}>
        {/* Customer */}
        <View style={styles.customerRow}>
          <Text style={styles.customerName}>{task.customerName}</Text>
          <Pressable style={styles.phoneBtn} onPress={handlePhone}>
            <IconSymbol name="phone.fill" size={12} color={colors.accent} />
            <Text style={styles.phoneText}>{task.customerPhone}</Text>
          </Pressable>
        </View>

        <View style={styles.divider} />

        {/* Pickup */}
        <View style={styles.row}>
          <IconSymbol name="shippingbox.fill" size={14} color={colors.textLow} />
          <View style={styles.addressBlock}>
            <Text style={styles.addressTypeLabel}>
              {task.pickupAddress.type === 'seller' ? 'FROM SELLER' : 'FROM TAILOR'} — {task.pickupAddress.name}
            </Text>
            <Text style={styles.addressLine}>{task.pickupAddress.line1}</Text>
            <Text style={styles.addressCity}>{task.pickupAddress.city}</Text>
          </View>
        </View>

        {/* Delivery */}
        <View style={styles.row}>
          <IconSymbol name="mappin" size={14} color={colors.accent} />
          <View style={styles.addressBlock}>
            <Text style={styles.addressTypeLabel}>DELIVER TO</Text>
            <Text style={styles.addressLine}>{task.deliveryAddress.line1}</Text>
            <Text style={styles.addressCity}>{task.deliveryAddress.city}</Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      {(nextAction !== null || failAction !== null) && (
        <>
          <View style={styles.divider} />
          <View style={styles.actionsRow}>
            {nextAction !== null && (
              <Pressable
                style={[styles.actionBtn, isUpdating && { opacity: 0.6 }]}
                onPress={handleNext}
                disabled={isUpdating}
              >
                <Text style={styles.actionBtnText}>{nextAction.label.toUpperCase()}</Text>
              </Pressable>
            )}
            {failAction !== null && (
              <Pressable
                style={[styles.failBtn, isUpdating && { opacity: 0.6 }]}
                onPress={handleFail}
                disabled={isUpdating}
              >
                <Text style={styles.failBtnText}>{failAction.label.toUpperCase()}</Text>
              </Pressable>
            )}
          </View>
        </>
      )}
    </View>
  );
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function DeliveryHomeScreen(): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();
  const insets = useSafeAreaInsets();
  const authUser = useAppSelector((s) => s.auth.user);

  const { data, isLoading, isError, refetch } = useGetDeliveryDashboardQuery();
  const [updateTaskStatus, { isLoading: isUpdating }] = useUpdateTaskStatusMutation();
  const [toggleDuty, { isLoading: isTogglingDuty }] = useToggleDutyStatusMutation();

  const firstName = (authUser?.name ?? '').split(' ')[0] ?? 'there';
  const greeting = getGreeting();

  const handleStatusUpdate = useCallback(
    (id: string, status: DeliveryTaskStatus) => {
      void updateTaskStatus({ id, status });
    },
    [updateTaskStatus],
  );

  const handleDutyToggle = useCallback(
    (value: boolean) => {
      void toggleDuty({ isOnDuty: value });
    },
    [toggleDuty],
  );

  const renderTask = useCallback<ListRenderItem<DeliveryTask>>(
    ({ item }) => (
      <DeliveryTaskCard
        task={item}
        onStatusUpdate={handleStatusUpdate}
        isUpdating={isUpdating}
      />
    ),
    [handleStatusUpdate, isUpdating],
  );

  const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg },
    header: {
      backgroundColor: colors.navSolid,
      paddingTop: insets.top + sp.sm,
      paddingHorizontal: sp.base,
      paddingBottom: sp.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      ...elev.high,
    },
    greeting: {
      ...typo.scale.title3,
      fontFamily: typo.fonts.serifBold,
      color: colors.textHigh,
    },
    subtitle: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
      marginTop: 2,
    },
    content: { paddingBottom: sp['4xl'] },
    // Duty card
    dutyCard: {
      marginHorizontal: sp.base,
      marginTop: sp.lg,
      borderRadius: r.lg,
      borderWidth: 1,
      padding: sp.base,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      ...elev.mid,
    },
    dutyLeft: {
      flex: 1,
      gap: sp.xs,
    },
    dutyStatusLabel: {
      ...typo.scale.title3,
      fontFamily: typo.fonts.sansBold,
    },
    dutySubtitle: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
    },
    // Stats
    statsRow: {
      flexDirection: 'row',
      gap: sp.sm,
      paddingHorizontal: sp.base,
      marginTop: sp.lg,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      padding: sp.md,
      borderWidth: 1,
      borderColor: colors.border,
      gap: sp.xs,
      alignItems: 'center',
      ...elev.low,
    },
    statValue: {
      ...typo.scale.title2,
      fontFamily: typo.fonts.display,
      color: colors.accent,
    },
    statLabel: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
      fontSize: 9,
      textAlign: 'center',
    },
    // Tasks section
    section: { paddingHorizontal: sp.base, marginTop: sp.xl },
  });

  // Header — always rendered
  const header = (
    <View style={styles.header}>
      <Text style={styles.greeting}>Good {greeting}, {firstName}</Text>
      <Text style={styles.subtitle}>Delivery Partner</Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.screen}>
        {header}
        <DeliverySkeleton />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.screen}>
        {header}
        <View style={{ padding: sp.base, marginTop: sp.lg }}>
          <ErrorBanner
            message="Could not load your dashboard. Please try again."
            onRetry={refetch}
          />
        </View>
      </View>
    );
  }

  const { stats, activeTasks, isOnDuty } = data;

  const dutyCardBg = isOnDuty ? colors.successSubtle : colors.panel;
  const dutyCardBorder = isOnDuty ? colors.success : colors.border;
  const dutyLabelColor = isOnDuty ? colors.success : colors.textMid;

  const statItems = [
    {
      icon: 'shippingbox.fill' as const,
      value: String(stats.todayDeliveries),
      label: "Today's",
    },
    {
      icon: 'trophy.fill' as const,
      value: formatPkr(stats.todayEarnings),
      label: 'Earned',
    },
    {
      icon: 'checkmark.seal.fill' as const,
      value: String(stats.totalDelivered),
      label: 'Total',
    },
    {
      icon: 'chart.bar.fill' as const,
      value: `${stats.successRate}%`,
      label: 'Success',
    },
  ];

  const emptyMessage =
    !isOnDuty
      ? 'You are currently off duty. Toggle to go on duty and receive delivery assignments.'
      : 'No tasks assigned yet. Stay ready!';

  return (
    <View style={styles.screen}>
      {header}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Duty Toggle Card */}
        <View
          style={[
            styles.dutyCard,
            { backgroundColor: dutyCardBg, borderColor: dutyCardBorder },
          ]}
        >
          <View style={styles.dutyLeft}>
            <Text style={[styles.dutyStatusLabel, { color: dutyLabelColor }]}>
              {isOnDuty ? 'ON DUTY' : 'OFF DUTY'}
            </Text>
            <Text style={styles.dutySubtitle}>
              {isOnDuty
                ? 'You are accepting delivery tasks'
                : 'Toggle to start accepting tasks'}
            </Text>
          </View>
          <Switch
            value={isOnDuty}
            onValueChange={handleDutyToggle}
            disabled={isTogglingDuty}
            trackColor={{ false: colors.border, true: colors.success }}
            thumbColor={isOnDuty ? colors.textOnAccent : colors.textLow}
          />
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {statItems.map((item) => (
            <View key={item.label} style={styles.statCard}>
              <IconSymbol name={item.icon} size={16} color={colors.accent} />
              <Text style={styles.statValue} numberOfLines={1}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label.toUpperCase()}</Text>
            </View>
          ))}
        </View>

        {/* Active Tasks */}
        <View style={styles.section}>
          <SectionHeader title="Active Tasks" />
          {activeTasks.length === 0 ? (
            <EmptyState
              icon={
                <IconSymbol name="shippingbox.fill" size={32} color={colors.textLow} />
              }
              title={isOnDuty ? 'No tasks yet' : 'Off Duty'}
              message={emptyMessage}
            />
          ) : (
            <FlatList
              data={activeTasks}
              keyExtractor={(item) => item._id}
              renderItem={renderTask}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}
