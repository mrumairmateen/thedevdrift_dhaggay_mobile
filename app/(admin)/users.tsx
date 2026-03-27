import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  useGetAdminUsersQuery,
  useApproveUserMutation,
  useSuspendUserMutation,
} from '@services/adminApi';
import type { AdminUser, AdminUserRole, AdminUserStatus } from '@services/adminApi';
import { useTheme } from '@shared/theme';
import {
  Avatar,
  Badge,
  Button,
  Chip,
  EmptyState,
  ErrorBanner,
  Skeleton,
} from '@shared/components/ui';
import { IconSymbol } from '@shared/components/ui/icon-symbol';
import type { BadgeVariant } from '@shared/components/ui';

// ─── Constants ────────────────────────────────────────────────────────────────

type RoleFilter = AdminUserRole | 'all';
type StatusFilter = AdminUserStatus | 'all';

const ROLE_FILTERS: Array<{ label: string; value: RoleFilter }> = [
  { label: 'All', value: 'all' },
  { label: 'Customer', value: 'customer' },
  { label: 'Seller', value: 'seller' },
  { label: 'Tailor', value: 'tailor' },
  { label: 'Delivery', value: 'delivery' },
];

const STATUS_FILTERS: Array<{ label: string; value: StatusFilter }> = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Active', value: 'active' },
  { label: 'Suspended', value: 'suspended' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function roleBadgeVariant(role: AdminUserRole): BadgeVariant {
  switch (role) {
    case 'tailor':   return 'neutral';
    case 'seller':   return 'info';
    case 'delivery': return 'warning';
    case 'admin':    return 'error';
    default:         return 'neutral';
  }
}

function statusBadgeVariant(status: AdminUserStatus): BadgeVariant {
  switch (status) {
    case 'active':    return 'success';
    case 'pending':   return 'warning';
    case 'suspended': return 'error';
    case 'in_review': return 'info';
  }
}

// ─── User Row ─────────────────────────────────────────────────────────────────

interface AdminUserRowProps {
  user: AdminUser;
}

const AdminUserRow = React.memo(function AdminUserRow({
  user,
}: AdminUserRowProps): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();
  const [approveUser, { isLoading: isApproving }] = useApproveUserMutation();
  const [suspendUser, { isLoading: isSuspending }] = useSuspendUserMutation();

  const handleApprove = useCallback(() => {
    void approveUser({ id: user._id });
  }, [approveUser, user._id]);

  const handleSuspend = useCallback(() => {
    Alert.prompt(
      'Suspend User',
      `Provide a reason to suspend ${user.name}:`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Suspend',
          style: 'destructive',
          onPress: (reason) => {
            const trimmedReason = reason?.trim();
            if (trimmedReason !== undefined && trimmedReason.length > 0) {
              void suspendUser({ id: user._id, reason: trimmedReason });
            }
          },
        },
      ],
      'plain-text',
    );
  }, [suspendUser, user._id, user.name]);

  const styles = StyleSheet.create({
    row: {
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      padding: sp.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: sp.sm,
      ...elev.low,
    },
    top: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: sp.sm,
    },
    info: { flex: 1, gap: sp.xs },
    name: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.textHigh,
    },
    phone: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
    },
    chips: {
      flexDirection: 'row',
      gap: sp.xs,
      flexWrap: 'wrap',
    },
    actions: {
      flexDirection: 'row',
      gap: sp.sm,
      marginTop: sp.sm,
    },
  });

  const showApprove = user.status === 'pending';
  const showSuspend = user.status === 'active' && user.role !== 'admin';

  return (
    <View style={styles.row}>
      <View style={styles.top}>
        <Avatar
          uri={user.avatarUrl ?? undefined}
          name={user.name}
          size={36}
        />
        <View style={styles.info}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.phone}>{user.phone}</Text>
        </View>
        <View style={styles.chips}>
          <Badge
            label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            variant={roleBadgeVariant(user.role)}
            size="sm"
          />
          <Badge
            label={user.status.replace(/_/g, ' ')}
            variant={statusBadgeVariant(user.status)}
            size="sm"
          />
        </View>
      </View>

      {(showApprove || showSuspend) && (
        <View style={styles.actions}>
          {showApprove && (
            <Button
              label="Approve"
              onPress={handleApprove}
              variant="primary"
              size="sm"
              loading={isApproving}
            />
          )}
          {showSuspend && (
            <Button
              label="Suspend"
              onPress={handleSuspend}
              variant="danger"
              size="sm"
              loading={isSuspending}
            />
          )}
        </View>
      )}
    </View>
  );
});

// ─── Row Skeleton ─────────────────────────────────────────────────────────────

function UserRowSkeleton(): React.JSX.Element {
  const { colors, sp, r } = useTheme();

  const styles = StyleSheet.create({
    row: {
      height: 72,
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: sp.sm,
    },
  });

  return <View style={styles.row} />;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AdminUsersScreen(): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();
  const insets = useSafeAreaInsets();

  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchText, setSearchText] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  // Debounce search — 400ms, using useState + useEffect with a timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchText]);

  const queryRole = roleFilter === 'all' ? undefined : roleFilter;
  const queryStatus = statusFilter === 'all' ? undefined : statusFilter;

  const { data, isLoading, isError, refetch } = useGetAdminUsersQuery({
    role: queryRole,
    status: queryStatus,
    search: debouncedSearch.length > 0 ? debouncedSearch : undefined,
    page: 1,
    limit: 20,
  });

  const renderUser = useCallback(
    ({ item }: { item: AdminUser }) => <AdminUserRow user={item} />,
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
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBg,
      borderRadius: r.sm,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: sp.md,
      marginTop: sp.md,
      height: 44,
      gap: sp.sm,
    },
    searchInput: {
      flex: 1,
      ...typo.scale.body,
      fontFamily: typo.fonts.sans,
      color: colors.textHigh,
    },
    filtersWrap: {
      paddingHorizontal: sp.base,
      paddingVertical: sp.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.navSolid,
    },
    filterRow: {
      flexDirection: 'row',
      gap: sp.xs,
      marginBottom: sp.xs,
    },
    list: { flex: 1 },
    listContent: {
      padding: sp.base,
      paddingBottom: sp['4xl'],
    },
    errorWrap: { padding: sp.base },
  });

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>User Management</Text>
        <View style={styles.searchBar}>
          <IconSymbol name="magnifyingglass" size={18} color={colors.textLow} />
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search by name or phone..."
            placeholderTextColor={colors.textLow}
            autoCapitalize="none"
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
        >
          {ROLE_FILTERS.map((f) => (
            <Chip
              key={f.value}
              label={f.label}
              active={roleFilter === f.value}
              onPress={() => setRoleFilter(f.value)}
              size="sm"
            />
          ))}
        </ScrollView>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
        >
          {STATUS_FILTERS.map((f) => (
            <Chip
              key={f.value}
              label={f.label}
              active={statusFilter === f.value}
              onPress={() => setStatusFilter(f.value)}
              size="sm"
            />
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.listContent}>
          {[0, 1, 2, 3, 4].map((i) => (
            <UserRowSkeleton key={i} />
          ))}
        </View>
      ) : isError ? (
        <View style={styles.errorWrap}>
          <ErrorBanner
            message="Could not load users. Please try again."
            onRetry={refetch}
          />
        </View>
      ) : (
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={data?.users ?? []}
          keyExtractor={(item) => item._id}
          renderItem={renderUser}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon={<IconSymbol name="person.fill" size={32} color={colors.textLow} />}
              title="No users found"
              message="Try adjusting your filters or search term."
            />
          }
        />
      )}
    </View>
  );
}
