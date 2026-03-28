import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  useGetTailorCalendarQuery,
  useUpdateCalendarMutation,
} from '@services/tailorDashApi';
import type { CalendarData } from '@services/tailorDashApi';
import { useTheme } from '@shared/theme';
import { ErrorBanner, Skeleton } from '@shared/components/ui';
import { DashHeader } from '@shared/components/DashHeader';
import { IconSymbol } from '@shared/components/ui/icon-symbol';

// ─── Date format helpers ──────────────────────────────────────────────────────

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

function formatDisplayDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('en-PK', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function daysUntil(iso: string): number {
  const target = new Date(`${iso}T00:00:00`).getTime();
  const now = Date.now();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function thirtyDaysFromNow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ─── Capacity card ────────────────────────────────────────────────────────────

interface CapacityCardProps {
  weeklyCapacity: number;
  currentLoad: number;
  isAvailable: boolean;
  onSave: (capacity: number) => void;
  isSaving: boolean;
}

const CapacityCard = React.memo(function CapacityCard({
  weeklyCapacity,
  currentLoad,
  isAvailable,
  onSave,
  isSaving,
}: CapacityCardProps): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();
  const [localCapacity, setLocalCapacity] = useState(weeklyCapacity);

  const increment = useCallback(() => {
    setLocalCapacity((n) => Math.min(30, n + 1));
  }, []);

  const decrement = useCallback(() => {
    setLocalCapacity((n) => Math.max(1, n - 1));
  }, []);

  const handleSave = useCallback(() => {
    onSave(localCapacity);
  }, [onSave, localCapacity]);

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: sp.md,
      marginBottom: sp.md,
      ...elev.low,
    },
    title: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansBold,
      color: colors.textMid,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: sp.md,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: sp.sm,
    },
    label: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sans,
      color: colors.textHigh,
    },
    availabilityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: sp.xs,
      marginBottom: sp.md,
    },
    availabilityDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    availabilityText: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sansMed,
    },
    loadText: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
      marginBottom: sp.md,
    },
    counterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: sp.sm,
    },
    counterBtn: {
      width: 32,
      height: 32,
      borderRadius: r.sm,
      backgroundColor: colors.accentSubtle,
      borderWidth: 1,
      borderColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    counterBtnDisabled: {
      backgroundColor: colors.panel,
      borderColor: colors.border,
    },
    counterValue: {
      ...typo.scale.body,
      fontFamily: typo.fonts.sansBold,
      color: colors.accent,
      minWidth: 28,
      textAlign: 'center',
    },
    saveBtn: {
      backgroundColor: colors.accent,
      borderRadius: r.md,
      paddingVertical: sp.sm,
      paddingHorizontal: sp.base,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: sp.sm,
    },
    saveBtnDisabled: {
      backgroundColor: colors.panel,
    },
    saveBtnLabel: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.textOnAccent,
    },
  });

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Capacity</Text>

      <View style={styles.availabilityRow}>
        <View
          style={[
            styles.availabilityDot,
            { backgroundColor: isAvailable ? colors.success : colors.error },
          ]}
        />
        <Text
          style={[
            styles.availabilityText,
            { color: isAvailable ? colors.success : colors.error },
          ]}
        >
          {isAvailable ? 'Available for new orders' : 'Not accepting new orders'}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Weekly Capacity: {localCapacity} orders</Text>
        <View style={styles.counterRow}>
          <Pressable
            onPress={decrement}
            disabled={localCapacity <= 1}
            style={[styles.counterBtn, localCapacity <= 1 && styles.counterBtnDisabled]}
          >
            <IconSymbol
              name="minus"
              size={16}
              color={localCapacity <= 1 ? colors.textLow : colors.accent}
            />
          </Pressable>
          <Text style={styles.counterValue}>{localCapacity}</Text>
          <Pressable
            onPress={increment}
            disabled={localCapacity >= 30}
            style={[styles.counterBtn, localCapacity >= 30 && styles.counterBtnDisabled]}
          >
            <IconSymbol
              name="plus"
              size={16}
              color={localCapacity >= 30 ? colors.textLow : colors.accent}
            />
          </Pressable>
        </View>
      </View>

      <Text style={styles.loadText}>Current Load: {currentLoad} active orders</Text>

      <Pressable
        onPress={handleSave}
        disabled={isSaving}
        style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
      >
        {isSaving ? (
          <ActivityIndicator size="small" color={colors.textOnAccent} />
        ) : (
          <Text style={styles.saveBtnLabel}>Save Capacity</Text>
        )}
      </Pressable>
    </View>
  );
});

// ─── Blocked dates section ────────────────────────────────────────────────────

interface BlockedDatesSectionProps {
  blockedDates: string[];
  onSave: (dates: string[]) => void;
  isSaving: boolean;
}

const BlockedDatesSection = React.memo(function BlockedDatesSection({
  blockedDates,
  onSave,
  isSaving,
}: BlockedDatesSectionProps): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();
  const [localDates, setLocalDates] = useState<string[]>(blockedDates);
  const [inputDate, setInputDate] = useState('');
  const [inputError, setInputError] = useState('');

  const handleAddDate = useCallback(() => {
    const trimmed = inputDate.trim();
    if (!ISO_RE.test(trimmed)) {
      setInputError('Use format YYYY-MM-DD');
      return;
    }
    if (trimmed < todayIso()) {
      setInputError('Cannot block past dates');
      return;
    }
    if (localDates.includes(trimmed)) {
      setInputError('Date already blocked');
      return;
    }
    setInputError('');
    setLocalDates((prev) => [...prev, trimmed].sort());
    setInputDate('');
  }, [inputDate, localDates]);

  const handleRemoveDate = useCallback((dateToRemove: string) => {
    setLocalDates((prev) => prev.filter((d) => d !== dateToRemove));
  }, []);

  const handleSave = useCallback(() => {
    onSave(localDates);
  }, [onSave, localDates]);

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: sp.md,
      marginBottom: sp.md,
      ...elev.low,
    },
    title: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansBold,
      color: colors.textMid,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: sp.xs,
    },
    infoText: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textLow,
      marginBottom: sp.md,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: sp.sm,
      marginBottom: sp.md,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: sp.xs,
      backgroundColor: colors.errorSubtle,
      borderRadius: r.pill,
      paddingHorizontal: sp.sm,
      paddingVertical: sp.xs,
      borderWidth: 1,
      borderColor: colors.error,
    },
    chipLabel: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sansMed,
      color: colors.error,
    },
    addRow: {
      flexDirection: 'row',
      gap: sp.sm,
      alignItems: 'center',
      marginBottom: sp.xs,
    },
    input: {
      flex: 1,
      borderWidth: 1,
      borderRadius: r.sm,
      paddingHorizontal: sp.sm,
      paddingVertical: sp.xs,
      borderColor: colors.border,
      backgroundColor: colors.inputBg,
      color: colors.textHigh,
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sans,
    },
    inputError: {
      borderColor: colors.error,
    },
    blockBtn: {
      backgroundColor: colors.accentSubtle,
      borderWidth: 1,
      borderColor: colors.accent,
      borderRadius: r.sm,
      paddingHorizontal: sp.md,
      paddingVertical: sp.xs,
    },
    blockBtnLabel: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sansBold,
      color: colors.accent,
    },
    errorText: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.error,
      marginBottom: sp.sm,
    },
    saveBtn: {
      backgroundColor: colors.accent,
      borderRadius: r.md,
      paddingVertical: sp.sm,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: sp.sm,
    },
    saveBtnDisabled: {
      backgroundColor: colors.panel,
    },
    saveBtnLabel: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.textOnAccent,
    },
    emptyText: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textLow,
      marginBottom: sp.md,
    },
  });

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Blocked Dates</Text>
      <Text style={styles.infoText}>
        Block dates when you're unavailable (holidays, personal time)
      </Text>

      {localDates.length === 0 ? (
        <Text style={styles.emptyText}>No blocked dates.</Text>
      ) : (
        <View style={styles.chipRow}>
          {localDates.map((d) => (
            <View key={d} style={styles.chip}>
              <Text style={styles.chipLabel}>{formatDisplayDate(d)}</Text>
              <Pressable onPress={() => handleRemoveDate(d)} hitSlop={8}>
                <IconSymbol name="xmark" size={12} color={colors.error} />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {/* Add date input */}
      <View style={styles.addRow}>
        <TextInput
          style={[styles.input, inputError.length > 0 && styles.inputError]}
          value={inputDate}
          onChangeText={(t) => { setInputDate(t); setInputError(''); }}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textLow}
          maxLength={10}
          keyboardType="numbers-and-punctuation"
          returnKeyType="done"
          onSubmitEditing={handleAddDate}
        />
        <Pressable onPress={handleAddDate} style={styles.blockBtn}>
          <Text style={styles.blockBtnLabel}>Block</Text>
        </Pressable>
      </View>
      {inputError.length > 0 && (
        <Text style={styles.errorText}>{inputError}</Text>
      )}

      <Pressable
        onPress={handleSave}
        disabled={isSaving}
        style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
      >
        {isSaving ? (
          <ActivityIndicator size="small" color={colors.textOnAccent} />
        ) : (
          <Text style={styles.saveBtnLabel}>Save Blocked Dates</Text>
        )}
      </Pressable>
    </View>
  );
});

// ─── Deadline row ─────────────────────────────────────────────────────────────

interface DeadlineRowItem {
  orderId: string;
  orderNumber: string;
  deadline: string;
}

interface DeadlineRowProps {
  item: DeadlineRowItem;
}

const DeadlineRow = React.memo(function DeadlineRow({
  item,
}: DeadlineRowProps): React.JSX.Element {
  const { colors, sp, r, typo } = useTheme();

  const days = daysUntil(item.deadline);

  const urgencyColor: string =
    days < 3
      ? colors.error
      : days <= 7
        ? colors.warning
        : colors.textMid;

  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: sp.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    left: { flex: 1 },
    orderNum: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.accent,
    },
    deadline: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
      marginTop: 2,
    },
    daysBadge: {
      borderRadius: r.sharp,
      paddingHorizontal: sp.xs,
      paddingVertical: 2,
    },
    daysText: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansBold,
      color: urgencyColor,
    },
  });

  const daysLabel = days === 0 ? 'Today' : days === 1 ? '1 day' : `${days} days`;

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={styles.orderNum}>#{item.orderNumber}</Text>
        <Text style={styles.deadline}>Due: {formatDisplayDate(item.deadline)}</Text>
      </View>
      <Text style={styles.daysText}>{daysLabel}</Text>
    </View>
  );
});

// ─── Upcoming orders section ──────────────────────────────────────────────────

interface UpcomingOrdersSectionProps {
  ordersByDate: CalendarData['ordersByDate'];
}

function UpcomingOrdersSection({ ordersByDate }: UpcomingOrdersSectionProps): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();

  const today = todayIso();
  const limit = thirtyDaysFromNow();

  // Flatten all orders in the next 30 days
  const upcomingOrders: DeadlineRowItem[] = useMemo(() => {
    const results: DeadlineRowItem[] = [];
    const dates = Object.keys(ordersByDate).sort();
    for (const date of dates) {
      if (date < today || date > limit) continue;
      const dayOrders = ordersByDate[date] ?? [];
      for (const o of dayOrders) {
        results.push({
          orderId: o.orderId,
          orderNumber: o.orderNumber,
          deadline: date,
        });
      }
    }
    return results;
  }, [ordersByDate, today, limit]);

  const renderDeadlineRow = useCallback<ListRenderItem<DeadlineRowItem>>(
    ({ item }) => <DeadlineRow item={item} />,
    [],
  );

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: sp.md,
      marginBottom: sp.md,
      ...elev.low,
    },
    title: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansBold,
      color: colors.textMid,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: sp.sm,
    },
    emptyText: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textLow,
    },
  });

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Upcoming Deadlines (30 days)</Text>
      {upcomingOrders.length === 0 ? (
        <Text style={styles.emptyText}>No upcoming order deadlines.</Text>
      ) : (
        <FlatList
          data={upcomingOrders}
          keyExtractor={(item) => item.orderId}
          renderItem={renderDeadlineRow}
          scrollEnabled={false}
        />
      )}
    </View>
  );
}

// ─── Eid Opt-In Card ──────────────────────────────────────────────────────────

interface EidOptInCardProps {
  eidOptIn: boolean;
  onToggle: (value: boolean) => void;
  isSaving: boolean;
}

const EidOptInCard = React.memo(function EidOptInCard({
  eidOptIn,
  onToggle,
  isSaving,
}: EidOptInCardProps): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: sp.md,
      marginBottom: sp.md,
      ...elev.low,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    left: { flex: 1, marginRight: sp.md },
    title: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.textHigh,
    },
    desc: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
      marginTop: 2,
    },
  });

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.left}>
          <Text style={styles.title}>Eid Season Opt-In</Text>
          <Text style={styles.desc}>
            Accept orders during Eid rush period. Higher demand, higher earnings.
          </Text>
        </View>
        <Switch
          value={eidOptIn}
          onValueChange={onToggle}
          disabled={isSaving}
          trackColor={{ false: colors.panel, true: colors.accentMid }}
          thumbColor={eidOptIn ? colors.accent : colors.textLow}
        />
      </View>
    </View>
  );
});

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CalendarSkeleton(): React.JSX.Element {
  const { sp, r, colors } = useTheme();

  const styles = StyleSheet.create({
    content: { padding: sp.base, gap: sp.md },
    block: {
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
  });

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={[styles.block, { height: 140 }]} />
        <View style={[styles.block, { height: 200 }]} />
        <View style={[styles.block, { height: 120 }]} />
        <Skeleton width="100%" height={100} radius={r.md} />
      </View>
    </ScrollView>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function CalendarScreen(): React.JSX.Element {
  const { colors, sp } = useTheme();

  const { data, isLoading, isError, refetch } = useGetTailorCalendarQuery();
  const [updateCalendar, { isLoading: isUpdating }] = useUpdateCalendarMutation();

  const handleSaveCapacity = useCallback((weeklyCapacity: number) => {
    void updateCalendar({ weeklyCapacity });
  }, [updateCalendar]);

  const handleSaveBlockedDates = useCallback((blockedDates: string[]) => {
    void updateCalendar({ blockedDates });
  }, [updateCalendar]);

  const handleToggleEidOptIn = useCallback((value: boolean) => {
    void updateCalendar({ eidOptIn: value });
  }, [updateCalendar]);

  const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg },
    content: { padding: sp.base, paddingBottom: sp['4xl'] },
    errorContainer: { padding: sp.base, marginTop: sp.lg },
  });

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <DashHeader title="Calendar & Capacity" subtitle="Tailor Dashboard" />
        <CalendarSkeleton />
      </View>
    );
  }

  if (isError || data === undefined) {
    return (
      <View style={styles.screen}>
        <DashHeader title="Calendar & Capacity" subtitle="Tailor Dashboard" />
        <View style={styles.errorContainer}>
          <ErrorBanner
            message="Could not load calendar data. Please try again."
            onRetry={refetch}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <DashHeader title="Calendar & Capacity" subtitle="Tailor Dashboard" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

          <CapacityCard
            weeklyCapacity={data.weeklyCapacity}
            currentLoad={data.currentLoad}
            isAvailable={data.isAvailable}
            onSave={handleSaveCapacity}
            isSaving={isUpdating}
          />

          <EidOptInCard
            eidOptIn={data.eidOptIn}
            onToggle={handleToggleEidOptIn}
            isSaving={isUpdating}
          />

          <BlockedDatesSection
            blockedDates={data.blockedDates ?? []}
            onSave={handleSaveBlockedDates}
            isSaving={isUpdating}
          />

          <UpcomingOrdersSection ordersByDate={data.ordersByDate ?? {}} />

        </View>
      </ScrollView>
    </View>
  );
}
