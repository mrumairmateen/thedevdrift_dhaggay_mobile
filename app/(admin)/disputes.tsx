import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  useGetDisputesQuery,
  useResolveDisputeMutation,
} from '@services/adminApi';
import type { AdminDispute, DisputeOutcome } from '@services/adminApi';
import { useTheme } from '@shared/theme';
import {
  Badge,
  Button,
  Chip,
  EmptyState,
  ErrorBanner,
} from '@shared/components/ui';
import { IconSymbol } from '@shared/components/ui/icon-symbol';
import type { BadgeVariant } from '@shared/components/ui';

// ─── Types ────────────────────────────────────────────────────────────────────

type DisputeStatusFilter = 'open' | 'investigating' | 'resolved' | 'all';

const STATUS_FILTERS: Array<{ label: string; value: DisputeStatusFilter }> = [
  { label: 'Open', value: 'open' },
  { label: 'Investigating', value: 'investigating' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'All', value: 'all' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function disputeStatusVariant(status: AdminDispute['status']): BadgeVariant {
  switch (status) {
    case 'open':          return 'error';
    case 'investigating': return 'warning';
    case 'resolved':      return 'success';
    case 'closed':        return 'neutral';
  }
}

// ─── Resolve Panel ────────────────────────────────────────────────────────────

interface ResolvePanelProps {
  disputeId: string;
  onDone: () => void;
}

const ResolvePanel = React.memo(function ResolvePanel({
  disputeId,
  onDone,
}: ResolvePanelProps): React.JSX.Element {
  const { colors, sp, r, typo } = useTheme();
  const [resolution, setResolution] = useState<string>('');
  const [outcome, setOutcome] = useState<DisputeOutcome>('refund_customer');
  const [resolveDispute, { isLoading }] = useResolveDisputeMutation();

  const handleConfirm = useCallback(() => {
    const trimmed = resolution.trim();
    if (trimmed.length === 0) return;
    void resolveDispute({ id: disputeId, resolution: trimmed, outcome }).then(() => {
      onDone();
    });
  }, [resolveDispute, disputeId, resolution, outcome, onDone]);

  const ACTIONS: Array<{ label: string; value: DisputeOutcome }> = [
    { label: 'Refund Customer', value: 'refund_customer' },
    { label: 'Warn Tailor', value: 'warn_tailor' },
    { label: 'Close', value: 'close_no_action' },
    { label: 'Suspend Tailor', value: 'suspend_tailor' },
  ];

  const styles = StyleSheet.create({
    panel: {
      marginTop: sp.sm,
      padding: sp.md,
      backgroundColor: colors.panel,
      borderRadius: r.sm,
      gap: sp.sm,
    },
    panelTitle: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansBold,
      color: colors.textMid,
    },
    textInput: {
      backgroundColor: colors.inputBg,
      borderRadius: r.sm,
      borderWidth: 1,
      borderColor: colors.border,
      padding: sp.sm,
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sans,
      color: colors.textHigh,
      minHeight: 72,
      textAlignVertical: 'top',
    },
    actionRow: {
      flexDirection: 'row',
      gap: sp.sm,
    },
    pill: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: sp.sm,
      borderRadius: r.pill,
      borderWidth: 1,
    },
    pillText: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansMed,
    },
  });

  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>Resolve Dispute</Text>
      <TextInput
        style={styles.textInput}
        value={resolution}
        onChangeText={setResolution}
        placeholder="Enter resolution details..."
        placeholderTextColor={colors.textLow}
        multiline
        numberOfLines={3}
      />
      <View style={styles.actionRow}>
        {ACTIONS.map((a) => {
          const isActive = outcome === a.value;
          return (
            <Pressable
              key={a.value}
              onPress={() => setOutcome(a.value)}
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
                  styles.pillText,
                  { color: isActive ? colors.accent : colors.textMid },
                ]}
              >
                {a.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Button
        label="Confirm Resolution"
        onPress={handleConfirm}
        variant="primary"
        size="sm"
        fullWidth
        loading={isLoading}
        disabled={resolution.trim().length === 0}
      />
    </View>
  );
});

// ─── Dispute Card ─────────────────────────────────────────────────────────────

interface DisputeCardProps {
  dispute: AdminDispute;
}

const DisputeCard = React.memo(function DisputeCard({
  dispute,
}: DisputeCardProps): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();
  const [resolving, setResolving] = useState<boolean>(false);

  const handleResolvePress = useCallback(() => {
    setResolving(true);
  }, []);

  const handleDone = useCallback(() => {
    setResolving(false);
  }, []);

  const openedDate = new Date(dispute.openedAt).toLocaleDateString('en-PK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const canResolve = dispute.status === 'open' || dispute.status === 'investigating';

  const styles = StyleSheet.create({
    card: {
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
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    orderNumber: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.textHigh,
    },
    date: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
    },
    parties: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
    },
    reason: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
    },
    bottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
  });

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.orderNumber}>#{dispute.orderNumber}</Text>
        <Text style={styles.date}>{openedDate}</Text>
      </View>
      <Text style={styles.parties}>
        {dispute.customerName} → {dispute.sellerName}
      </Text>
      <Text style={styles.reason} numberOfLines={2}>
        {dispute.reason}
      </Text>
      <View style={styles.bottomRow}>
        <Badge
          label={dispute.status.charAt(0).toUpperCase() + dispute.status.slice(1)}
          variant={disputeStatusVariant(dispute.status)}
          size="sm"
        />
        {canResolve && !resolving && (
          <Button
            label="Resolve"
            onPress={handleResolvePress}
            variant="secondary"
            size="sm"
          />
        )}
      </View>
      {canResolve && resolving && (
        <ResolvePanel disputeId={dispute._id} onDone={handleDone} />
      )}
    </View>
  );
});

// ─── Card Skeleton ────────────────────────────────────────────────────────────

function DisputeCardSkeleton(): React.JSX.Element {
  const { colors, sp, r } = useTheme();

  const styles = StyleSheet.create({
    card: {
      height: 130,
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: sp.sm,
    },
  });

  return <View style={styles.card} />;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AdminDisputesScreen(): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();
  const insets = useSafeAreaInsets();

  const [statusFilter, setStatusFilter] = useState<DisputeStatusFilter>('open');

  const queryStatus = statusFilter === 'all' ? undefined : statusFilter;

  const { data, isLoading, isError, refetch } = useGetDisputesQuery({
    status: queryStatus,
    page: 1,
    limit: 20,
  });

  const renderDispute = useCallback(
    ({ item }: { item: AdminDispute }) => <DisputeCard dispute={item} />,
    [],
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
    title: {
      ...typo.scale.title3,
      fontFamily: typo.fonts.serifBold,
      color: colors.textHigh,
    },
    filtersWrap: {
      paddingHorizontal: sp.base,
      paddingVertical: sp.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.navSolid,
    },
    list: { flex: 1 },
    listContent: {
      padding: sp.base,
      paddingBottom: sp['4xl'],
    },
    errorWrap: { padding: sp.base },
    skeletonWrap: { padding: sp.base },
  });

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Disputes</Text>
      </View>

      {/* Filter chips */}
      <View style={styles.filtersWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: sp.xs }}>
            {STATUS_FILTERS.map((f) => (
              <Chip
                key={f.value}
                label={f.label}
                active={statusFilter === f.value}
                onPress={() => setStatusFilter(f.value)}
                size="sm"
              />
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.skeletonWrap}>
          {[0, 1, 2, 3].map((i) => (
            <DisputeCardSkeleton key={i} />
          ))}
        </View>
      ) : isError ? (
        <View style={styles.errorWrap}>
          <ErrorBanner
            message="Could not load disputes. Please try again."
            onRetry={refetch}
          />
        </View>
      ) : (
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={data?.disputes ?? []}
          keyExtractor={(item) => item._id}
          renderItem={renderDispute}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon={
                <IconSymbol
                  name="exclamationmark.triangle"
                  size={32}
                  color={colors.textLow}
                />
              }
              title="No disputes found"
              message="No disputes match the selected filter."
            />
          }
        />
      )}
    </View>
  );
}
