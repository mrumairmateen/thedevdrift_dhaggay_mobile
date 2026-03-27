import React, { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { useGetAdminOverviewQuery } from '@services/adminApi';
import { useTheme } from '@shared/theme';
import {
  ErrorBanner,
  SectionHeader,
  Skeleton,
} from '@shared/components/ui';
import { IconSymbol } from '@shared/components/ui/icon-symbol';
import type { IconSymbolName } from '@shared/components/ui/icon-symbol';
import { DashboardHeader } from '@shared/components/DashboardHeader';
import { SideDrawer } from '@shared/components/SideDrawer';
import type { DrawerSection } from '@shared/components/SideDrawer';
import { useAppSelector } from '@store/index';
import { formatPkr } from '@shared/utils/pkr';

// ─── Types ────────────────────────────────────────────────────────────────────

interface KpiItem {
  icon: IconSymbolName;
  label: string;
  value: string;
}

interface MgmtCard {
  icon: IconSymbolName;
  label: string;
  route: string;
}

// ─── Management Cards Config ──────────────────────────────────────────────────

const MGMT_CARDS: MgmtCard[] = [
  { icon: 'star.fill',           label: 'Reviews',    route: '/(admin)/reviews' },
  { icon: 'paintbrush.fill',     label: 'Designs',    route: '/(admin)/designs' },
  { icon: 'square.grid.2x2',     label: 'Categories', route: '/(admin)/categories' },
  { icon: 'tag.fill',            label: 'Promotions', route: '/(admin)/promotions' },
  { icon: 'square.and.arrow.up', label: 'Banners',    route: '/(admin)/banners' },
  { icon: 'gearshape.fill',      label: 'Settings',   route: '/(admin)/platform-settings' },
  { icon: 'bell.fill',           label: 'Broadcast',  route: '/(admin)/broadcast' },
];

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  item: KpiItem;
}

const KpiCard = React.memo(function KpiCard({ item }: KpiCardProps): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();

  const styles = StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      padding: sp.md,
      borderWidth: 1,
      borderColor: colors.border,
      gap: sp.xs,
      ...elev.low,
    },
    value: {
      ...typo.scale.title3,
      fontFamily: typo.fonts.display,
      color: colors.accent,
    },
    label: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
    },
  });

  return (
    <View style={styles.card}>
      <IconSymbol name={item.icon} size={20} color={colors.accent} />
      <Text style={styles.value}>{item.value}</Text>
      <Text style={styles.label}>{item.label}</Text>
    </View>
  );
});

// ─── Alert Card ───────────────────────────────────────────────────────────────

interface AlertCardProps {
  label: string;
  count: number;
  variant: 'warning' | 'error';
  ctaLabel: string;
  onPress: () => void;
}

const AlertCard = React.memo(function AlertCard({
  label,
  count,
  variant,
  ctaLabel,
  onPress,
}: AlertCardProps): React.JSX.Element {
  const { colors, sp, r, typo } = useTheme();

  const bgColor     = variant === 'error' ? colors.errorSubtle   : colors.warningSubtle;
  const textColor   = variant === 'error' ? colors.error         : colors.warning;
  const borderColor = variant === 'error' ? colors.error         : colors.warning;

  const styles = StyleSheet.create({
    card: {
      backgroundColor: bgColor,
      borderRadius: r.md,
      padding: sp.md,
      borderWidth: 1,
      borderColor,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: sp.sm,
    },
    textWrap: { flex: 1, gap: sp.xs },
    countText: {
      ...typo.scale.title3,
      fontFamily: typo.fonts.sansBold,
      color: textColor,
    },
    labelText: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: textColor,
    },
    cta: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: textColor,
    },
  });

  return (
    <View style={styles.card}>
      <View style={styles.textWrap}>
        <Text style={styles.countText}>{count}</Text>
        <Text style={styles.labelText}>{label}</Text>
      </View>
      <Pressable onPress={onPress}>
        <Text style={styles.cta}>{ctaLabel}</Text>
      </Pressable>
    </View>
  );
});

// ─── Management Card ──────────────────────────────────────────────────────────

interface ManagementCardProps {
  card: MgmtCard;
}

const ManagementCard = React.memo(function ManagementCard({
  card,
}: ManagementCardProps): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();
  const router = useRouter();

  const handlePress = useCallback((): void => {
    router.push(card.route as never);
  }, [router, card.route]);

  const styles = StyleSheet.create({
    card: {
      width: '47%',
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      padding: sp.md,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      gap: sp.sm,
      ...elev.low,
    },
    label: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansMed,
      color: colors.textHigh,
      textAlign: 'center',
    },
  });

  return (
    <Pressable style={styles.card} onPress={handlePress}>
      <IconSymbol name={card.icon} size={24} color={colors.accent} />
      <Text style={styles.label}>{card.label}</Text>
    </Pressable>
  );
});

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function AdminOverviewSkeleton(): React.JSX.Element {
  const { colors, sp, r } = useTheme();

  const styles = StyleSheet.create({
    kpiRow: {
      flexDirection: 'row',
      gap: sp.sm,
      paddingHorizontal: sp.base,
      marginTop: sp.lg,
    },
    kpiCard: {
      flex: 1,
      height: 88,
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    section: { paddingHorizontal: sp.base, marginTop: sp.xl },
    alertCard: {
      height: 72,
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: sp.sm,
    },
  });

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.kpiRow}>
        <View style={styles.kpiCard} />
        <View style={styles.kpiCard} />
      </View>
      <View style={styles.kpiRow}>
        <View style={styles.kpiCard} />
        <View style={styles.kpiCard} />
      </View>
      <View style={styles.kpiRow}>
        <View style={styles.kpiCard} />
        <View style={styles.kpiCard} />
      </View>
      <View style={styles.section}>
        <Skeleton width={140} height={18} />
        <View style={{ marginTop: sp.md }}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={styles.alertCard} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AdminOverviewScreen(): React.JSX.Element {
  const { colors, sp, typo } = useTheme();
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);

  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useGetAdminOverviewQuery();

  const handleOpenDrawer  = useCallback((): void => setDrawerOpen(true),  []);
  const handleCloseDrawer = useCallback((): void => setDrawerOpen(false), []);

  const handleGoAccount = useCallback((): void => {
    router.push('/(admin)/account' as never);
  }, [router]);
  const handleGoUsers = useCallback((): void => {
    router.push('/(admin)/users' as never);
  }, [router]);
  const handleGoDisputes = useCallback((): void => {
    router.push('/(admin)/disputes' as never);
  }, [router]);
  const handleGoReviews = useCallback((): void => {
    router.push('/(admin)/reviews' as never);
  }, [router]);

  // Build drawer sections — badge counts come from API data when available.
  const drawerSections = useMemo((): DrawerSection[] => {
    const pendingUsers =
      (data?.pendingTailorApprovals ?? 0) + (data?.pendingSellerApprovals ?? 0);
    const openDisputes   = data?.openDisputes   ?? 0;
    const flaggedReviews = data?.flaggedReviews ?? 0;

    return [
      {
        title: 'Navigation',
        items: [
          { icon: 'chart.bar.fill', label: 'Overview', route: '/(admin)/' },
          {
            icon: 'person.fill', label: 'Users', route: '/(admin)/users',
            ...(pendingUsers > 0 ? { badge: pendingUsers } : {}),
          },
          { icon: 'shippingbox.fill', label: 'Orders', route: '/(admin)/orders' },
          {
            icon: 'exclamationmark.triangle', label: 'Disputes', route: '/(admin)/disputes',
            ...(openDisputes > 0 ? { badge: openDisputes } : {}),
          },
          { icon: 'trophy.fill', label: 'Finance', route: '/(admin)/finance' },
        ],
      },
      {
        title: 'Platform',
        items: [
          {
            icon: 'star.fill', label: 'Reviews', route: '/(admin)/reviews',
            ...(flaggedReviews > 0 ? { badge: flaggedReviews } : {}),
          },
          { icon: 'paintbrush.fill',     label: 'Designs',    route: '/(admin)/designs' },
          { icon: 'square.grid.2x2',     label: 'Categories', route: '/(admin)/categories' },
          { icon: 'tag.fill',            label: 'Promotions', route: '/(admin)/promotions' },
          { icon: 'square.and.arrow.up', label: 'Banners',    route: '/(admin)/banners' },
          { icon: 'gearshape.fill',      label: 'Settings',   route: '/(admin)/platform-settings' },
          { icon: 'bell.fill',           label: 'Broadcast',  route: '/(admin)/broadcast' },
        ],
      },
      {
        title: 'Account',
        items: [
          { icon: 'person.crop.circle', label: 'My Account', route: '/(admin)/account' },
        ],
      },
    ];
  }, [data]);

  const styles = StyleSheet.create({
    screen:  { flex: 1, backgroundColor: colors.bg },
    content: { paddingBottom: sp['4xl'] },
    kpiRow: {
      flexDirection: 'row',
      gap: sp.sm,
      paddingHorizontal: sp.base,
      marginTop: sp.lg,
    },
    section: { paddingHorizontal: sp.base, marginTop: sp.xl },
    emptyNote: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textLow,
      textAlign: 'center',
      paddingVertical: sp.md,
    },
    mgmtGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: sp.sm,
      marginTop: sp.md,
    },
  });

  const drawerEl = (
    <SideDrawer
      isOpen={isDrawerOpen}
      onClose={handleCloseDrawer}
      sections={drawerSections}
      userName={user?.name}
      userRole={user?.role}
    />
  );

  const headerEl = (
    <DashboardHeader
      title="Admin Dashboard"
      subtitle="Platform Overview"
      userName={user?.name}
      onHamburgerPress={handleOpenDrawer}
      onAvatarPress={handleGoAccount}
    />
  );

  if (isLoading) {
    return (
      <View style={styles.screen}>
        {headerEl}
        <AdminOverviewSkeleton />
        {drawerEl}
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.screen}>
        {headerEl}
        <View style={{ padding: sp.base, marginTop: sp.lg }}>
          <ErrorBanner
            message="Could not load admin dashboard. Please try again."
            onRetry={refetch}
          />
        </View>
        {drawerEl}
      </View>
    );
  }

  const kpiRows: KpiItem[][] = [
    [
      { icon: 'chart.bar.fill',  label: 'Total GMV',    value: formatPkr(data.totalGmv) },
      { icon: 'shippingbox.fill', label: 'Orders Today', value: data.ordersToday.toLocaleString() },
    ],
    [
      { icon: 'scissors', label: 'Active Tailors', value: data.activeTailors.toLocaleString() },
      { icon: 'tag.fill', label: 'Revenue Today',  value: formatPkr(data.revenueToday) },
    ],
    [
      { icon: 'person.fill',     label: 'Pending Tailors', value: data.pendingTailorApprovals.toLocaleString() },
      { icon: 'building.2.fill', label: 'Pending Sellers', value: data.pendingSellerApprovals.toLocaleString() },
    ],
  ];

  return (
    <View style={styles.screen}>
      {headerEl}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* KPI Grid */}
        {kpiRows.map((row, rowIdx) => (
          <View key={rowIdx} style={styles.kpiRow}>
            {row.map((item) => (
              <KpiCard key={item.label} item={item} />
            ))}
          </View>
        ))}

        {/* Action Alerts */}
        <View style={styles.section}>
          <SectionHeader title="Action Required" />
          <View style={{ marginTop: sp.md }}>
            {data.pendingTailorApprovals > 0 && (
              <AlertCard
                label="Pending Tailor Approvals"
                count={data.pendingTailorApprovals}
                variant="warning"
                ctaLabel="Review"
                onPress={handleGoUsers}
              />
            )}
            {data.pendingSellerApprovals > 0 && (
              <AlertCard
                label="Pending Seller Approvals"
                count={data.pendingSellerApprovals}
                variant="warning"
                ctaLabel="Review"
                onPress={handleGoUsers}
              />
            )}
            {data.openDisputes > 0 && (
              <AlertCard
                label="Open Disputes"
                count={data.openDisputes}
                variant="error"
                ctaLabel="Resolve"
                onPress={handleGoDisputes}
              />
            )}
            {data.flaggedReviews > 0 && (
              <AlertCard
                label="Flagged Reviews"
                count={data.flaggedReviews}
                variant="warning"
                ctaLabel="Review"
                onPress={handleGoReviews}
              />
            )}
            {data.pendingTailorApprovals === 0 &&
              data.pendingSellerApprovals === 0 &&
              data.openDisputes === 0 &&
              data.flaggedReviews === 0 && (
                <Text style={styles.emptyNote}>No actions required.</Text>
              )}
          </View>
        </View>

        {/* Platform Management */}
        <View style={styles.section}>
          <SectionHeader title="Platform Management" />
          <View style={styles.mgmtGrid}>
            {MGMT_CARDS.map((card) => (
              <ManagementCard key={card.route} card={card} />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Side drawer — uses Modal so it covers the tab bar too */}
      {drawerEl}
    </View>
  );
}
