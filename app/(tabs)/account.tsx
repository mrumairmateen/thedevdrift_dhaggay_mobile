import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol, type IconSymbolName } from '@shared/components/ui/icon-symbol';
import { useTheme } from '@shared/theme';
import { useAppDispatch, useAppSelector } from '@store/index';
import { openAuthSheet } from '@store/authSlice';
import type { AuthUser } from '@store/authSlice';

interface QuickLink {
  id: string;
  label: string;
  icon: IconSymbolName;
  route: string;
}

function getQuickLinks(role: AuthUser['role']): QuickLink[] {
  switch (role) {
    case 'customer':
      return [
        { id: 'orders',   label: 'Orders',    icon: 'bag.fill',           route: '/(dashboard)/orders' },
        { id: 'wishlist', label: 'Wishlist',   icon: 'heart.fill',         route: '/(dashboard)/wishlist' },
        { id: 'loyalty',  label: 'Loyalty',    icon: 'trophy.fill',        route: '/(dashboard)/loyalty' },
        { id: 'settings', label: 'Settings',   icon: 'gearshape.fill',     route: '/settings' },
      ];
    case 'seller':
      return [
        { id: 'orders',    label: 'Orders',    icon: 'shippingbox.fill',   route: '/(seller)/orders' },
        { id: 'products',  label: 'Products',  icon: 'tag.fill',           route: '/(seller)/products' },
        { id: 'analytics', label: 'Analytics', icon: 'chart.bar.fill',     route: '/(seller)/analytics' },
        { id: 'settings',  label: 'Settings',  icon: 'gearshape.fill',     route: '/(seller)/settings' },
      ];
    case 'tailor':
      return [
        { id: 'orders',    label: 'Orders',    icon: 'shippingbox.fill',   route: '/(tailor-dash)/orders' },
        { id: 'earnings',  label: 'Earnings',  icon: 'trophy.fill',        route: '/(tailor-dash)/earnings' },
        { id: 'portfolio', label: 'Portfolio', icon: 'paintbrush.fill',    route: '/(tailor-dash)/portfolio' },
        { id: 'profile',   label: 'Profile',   icon: 'person.crop.circle', route: '/(tailor-dash)/profile' },
      ];
    case 'admin':
      return [
        { id: 'users',     label: 'Users',     icon: 'person.fill',                  route: '/(admin)/users' },
        { id: 'orders',    label: 'Orders',    icon: 'shippingbox.fill',             route: '/(admin)/orders' },
        { id: 'disputes',  label: 'Disputes',  icon: 'exclamationmark.triangle',     route: '/(admin)/disputes' },
        { id: 'finance',   label: 'Finance',   icon: 'chart.bar.fill',               route: '/(admin)/finance' },
      ];
    case 'delivery':
      return [
        { id: 'tasks',    label: 'Tasks',    icon: 'shippingbox.fill', route: '/(delivery)' },
        { id: 'earnings', label: 'Earnings', icon: 'trophy.fill',      route: '/(delivery)/earnings' },
        { id: 'settings', label: 'Settings', icon: 'gearshape.fill',   route: '/settings' },
      ];
  }
}

const DASHBOARD_LABEL: Record<AuthUser['role'], string> = {
  customer: 'MY DASHBOARD',
  seller: 'SELLER PORTAL',
  tailor: 'TAILOR PORTAL',
  admin: 'ADMIN PANEL',
  delivery: 'DELIVERY TASKS',
};

const DASHBOARD_ROUTE: Record<AuthUser['role'], string> = {
  customer: '/(dashboard)',
  seller: '/(seller)',
  tailor: '/(tailor-dash)',
  admin: '/(admin)',
  delivery: '/(delivery)',
};

export default function AccountScreen(): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const user = useAppSelector(s => s.auth.user);

  const handleSignIn = useCallback(() => {
    dispatch(openAuthSheet('login'));
  }, [dispatch]);

  const handleCreateAccount = useCallback(() => {
    dispatch(openAuthSheet('register'));
  }, [dispatch]);

  const handleDashboard = useCallback(() => {
    if (!user) return;
    router.push((DASHBOARD_ROUTE[user.role] ?? '/(dashboard)') as never);
  }, [router, user]);

  const handleQuickLink = useCallback((route: string) => {
    router.push(route as never);
  }, [router]);

  const quickLinks = useMemo(
    () => (user ? getQuickLinks(user.role) : []),
    [user],
  );

  const dashboardLabel = user
    ? (DASHBOARD_LABEL[user.role] ?? 'MY DASHBOARD')
    : 'MY DASHBOARD';

  const styles = StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    header: {
      backgroundColor: colors.navSolid,
      paddingTop: insets.top + sp.sm,
      paddingHorizontal: sp.base,
      paddingBottom: sp.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      ...elev.high,
    },
    headerTitle: {
      ...typo.scale.title2,
      fontFamily: typo.fonts.serifBold,
      color: colors.textHigh,
    },
    // ── Unauthenticated ─────────────────────────────────────────────────
    authContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: sp['2xl'],
    },
    logoMark: {
      width: 72,
      height: 72,
      borderRadius: r.pill,
      backgroundColor: colors.accentSubtle,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: sp.xl,
    },
    joinHeading: {
      ...typo.scale.title2,
      fontFamily: typo.fonts.serifBold,
      color: colors.textHigh,
      textAlign: 'center',
      marginBottom: sp.sm,
    },
    joinSubtext: {
      ...typo.scale.body,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
      textAlign: 'center',
      marginBottom: sp['2xl'],
    },
    signInBtn: {
      backgroundColor: colors.accent,
      borderRadius: r.pill,
      height: 52,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: sp.md,
    },
    signInText: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansBold,
      color: colors.textOnAccent,
    },
    createBtn: {
      backgroundColor: 'transparent',
      borderRadius: r.pill,
      height: 52,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.accent,
    },
    createText: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansBold,
      color: colors.accent,
    },
    // ── Authenticated ────────────────────────────────────────────────────
    scrollContent: {
      paddingBottom: insets.bottom + sp['4xl'],
    },
    profileCard: {
      backgroundColor: colors.elevated,
      marginHorizontal: sp.base,
      marginTop: sp.xl,
      marginBottom: sp.sm,
      borderRadius: r.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: sp.base,
      flexDirection: 'row',
      alignItems: 'center',
      gap: sp.md,
      ...elev.low,
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: r.pill,
      backgroundColor: colors.accentSubtle,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      ...typo.scale.title3,
      fontFamily: typo.fonts.sansBold,
      color: colors.accent,
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.serifBold,
      color: colors.textHigh,
    },
    profilePhone: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
      marginTop: 2,
    },
    profileRole: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansMed,
      color: colors.accent,
      marginTop: sp.xs,
    },
    sectionLabel: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansMed,
      color: colors.textLow,
      paddingHorizontal: sp.base,
      paddingVertical: sp.sm,
      backgroundColor: colors.surface,
    },
    linksCard: {
      backgroundColor: colors.elevated,
      marginHorizontal: sp.base,
      borderRadius: r.lg,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      ...elev.low,
    },
    linkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: sp.base,
      paddingVertical: sp.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.elevated,
    },
    linkLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: sp.md,
    },
    linkIconWrap: {
      width: 32,
      height: 32,
      borderRadius: r.sm,
      backgroundColor: colors.accentSubtle,
      alignItems: 'center',
      justifyContent: 'center',
    },
    linkLabel: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansMed,
      color: colors.textHigh,
    },
    dashboardBtn: {
      backgroundColor: colors.accent,
      borderRadius: r.pill,
      height: 52,
      marginHorizontal: sp.base,
      marginTop: sp.xl,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dashboardText: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansBold,
      color: colors.textOnAccent,
    },
  });

  // ── Unauthenticated view ──────────────────────────────────────────────────
  if (user === null) {
    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Account</Text>
        </View>
        <View style={styles.authContainer}>
          <View style={styles.logoMark}>
            <IconSymbol name="person.crop.circle" size={36} color={colors.accent} />
          </View>
          <Text style={styles.joinHeading}>Join Dhaggay</Text>
          <Text style={styles.joinSubtext}>
            Sign in to access your orders, wishlist, and more.
          </Text>
          <Pressable style={styles.signInBtn} onPress={handleSignIn}>
            <Text style={styles.signInText}>SIGN IN</Text>
          </Pressable>
          <Pressable style={styles.createBtn} onPress={handleCreateAccount}>
            <Text style={styles.createText}>CREATE ACCOUNT</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ── Authenticated view ────────────────────────────────────────────────────
  const initials = user.name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user.name}</Text>
            <Text style={styles.profilePhone}>{user.phone}</Text>
            <Text style={styles.profileRole}>{user.role.toUpperCase()}</Text>
          </View>
          <IconSymbol name="chevron.right" size={16} color={colors.textLow} />
        </View>

        {/* Quick links section */}
        <Text style={styles.sectionLabel}>QUICK ACCESS</Text>
        <View style={styles.linksCard}>
          {quickLinks.map((link, idx) => (
            <Pressable
              key={link.id}
              style={[
                styles.linkRow,
                idx === quickLinks.length - 1 && { borderBottomWidth: 0 },
              ]}
              onPress={() => handleQuickLink(link.route)}
            >
              <View style={styles.linkLeft}>
                <View style={styles.linkIconWrap}>
                  <IconSymbol name={link.icon} size={16} color={colors.accent} />
                </View>
                <Text style={styles.linkLabel}>{link.label}</Text>
              </View>
              <IconSymbol name="chevron.right" size={14} color={colors.textLow} />
            </Pressable>
          ))}
        </View>

        {/* Dashboard CTA */}
        <Pressable style={styles.dashboardBtn} onPress={handleDashboard}>
          <Text style={styles.dashboardText}>{dashboardLabel}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
