import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useGetTailorMeQuery } from '@services/tailorDashApi';
import { useTheme } from '@shared/theme';
import { ErrorBanner, Skeleton, Tag } from '@shared/components/ui';
import { DashHeader } from '@shared/components/DashHeader';
import { IconSymbol } from '@shared/components/ui/icon-symbol';
import { formatPkr } from '@shared/utils';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCategorySlug(slug: string): string {
  const genderMap: Record<string, string> = {
    male: 'Men',
    female: 'Women',
    kids: 'Kids',
  };
  const parts = slug.split('_');
  const last = parts[parts.length - 1] ?? '';
  if (last in genderMap) {
    const base = parts
      .slice(0, -1)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(' ');
    return `${base} (${genderMap[last] ?? last})`;
  }
  return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
}

function tierVariant(tier: 'standard' | 'premium' | 'master'): 'default' | 'accent' | 'warning' {
  if (tier === 'master') return 'warning';
  if (tier === 'premium') return 'accent';
  return 'default';
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function AccountsSkeleton(): React.JSX.Element {
  const { sp, r, colors } = useTheme();

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
    section: { paddingHorizontal: sp.base, marginTop: sp.xl, gap: sp.sm },
    rowCard: {
      height: 44,
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
  });

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.statsRow}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={styles.statCard} />
        ))}
      </View>
      <View style={styles.section}>
        <Skeleton width={160} height={16} />
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={styles.rowCard} />
        ))}
      </View>
      <View style={styles.section}>
        <Skeleton width={120} height={16} />
        {[0, 1, 2].map((i) => (
          <View key={i} style={styles.rowCard} />
        ))}
      </View>
    </ScrollView>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function EarningsScreen(): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();

  const { data, isLoading, isError, refetch } = useGetTailorMeQuery();

  const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg },
    content: { paddingBottom: sp['4xl'] },

    // Stats row
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
      borderWidth: 1,
      borderColor: colors.border,
      padding: sp.md,
      alignItems: 'center',
      gap: sp.xs,
      ...elev.low,
    },
    statValue: {
      ...typo.scale.title2,
      fontFamily: typo.fonts.display,
      color: colors.accent,
    },
    statLabel: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
      textAlign: 'center',
    },

    // Tier card
    tierCard: {
      marginHorizontal: sp.base,
      marginTop: sp.lg,
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: sp.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      ...elev.low,
    },
    tierLabel: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
    },

    // Section card
    sectionCard: {
      marginHorizontal: sp.base,
      marginTop: sp.lg,
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: sp.md,
      ...elev.low,
    },
    sectionTitle: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansBold,
      color: colors.textMid,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: sp.sm,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: sp.xs,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    lastRow: {
      borderBottomWidth: 0,
    },
    priceLabel: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sans,
      color: colors.textHigh,
      flex: 1,
    },
    priceValue: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.accent,
    },

    // Info banner
    infoCard: {
      marginHorizontal: sp.base,
      marginTop: sp.lg,
      backgroundColor: colors.infoSubtle,
      borderRadius: r.md,
      borderWidth: 1,
      borderColor: colors.info,
      padding: sp.md,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: sp.sm,
    },
    infoText: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.info,
      flex: 1,
    },

    errorContainer: { padding: sp.base, marginTop: sp.lg },
  });

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <DashHeader title="Accounts" subtitle="Tailor Dashboard" />
        <AccountsSkeleton />
      </View>
    );
  }

  if (isError || data === undefined) {
    return (
      <View style={styles.screen}>
        <DashHeader title="Accounts" subtitle="Tailor Dashboard" />
        <View style={styles.errorContainer}>
          <ErrorBanner
            message="Could not load account data. Please try again."
            onRetry={refetch}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <DashHeader title="Accounts" subtitle="Tailor Dashboard" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <IconSymbol name="checkmark.seal.fill" size={18} color={colors.accent} />
            <Text style={styles.statValue}>{data.completedOrders}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <IconSymbol name="shippingbox.fill" size={18} color={colors.accent} />
            <Text style={styles.statValue}>{data.currentLoad}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <IconSymbol name="gauge" size={18} color={colors.accent} />
            <Text style={styles.statValue}>{data.weeklyCapacity}</Text>
            <Text style={styles.statLabel}>Weekly Cap</Text>
          </View>
        </View>

        {/* Tier */}
        <View style={styles.tierCard}>
          <Text style={styles.tierLabel}>Your Tier</Text>
          <Tag label={data.tier.toUpperCase()} variant={tierVariant(data.tier)} />
        </View>

        {/* Category pricing */}
        {data.categoryPricing.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Category Rates</Text>
            {data.categoryPricing.map((cp, idx) => (
              <View
                key={cp.garmentCategoryId}
                style={[
                  styles.priceRow,
                  idx === data.categoryPricing.length - 1 && styles.lastRow,
                ]}
              >
                <Text style={styles.priceLabel}>
                  {formatCategorySlug(cp.garmentCategorySlug)}
                </Text>
                <Text style={styles.priceValue}>{formatPkr(cp.price)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* General pricing */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>General Pricing</Text>
          {(
            [
              ['Shalwar Kameez', data.pricing.shalwarKameez],
              ['Suit', data.pricing.suit],
              ['Bridal', data.pricing.bridal],
              ['Custom', data.pricing.custom],
            ] as Array<[string, number]>
          ).map(([label, price], idx, arr) => (
            <View
              key={label}
              style={[styles.priceRow, idx === arr.length - 1 && styles.lastRow]}
            >
              <Text style={styles.priceLabel}>{label}</Text>
              <Text style={styles.priceValue}>{formatPkr(price)}</Text>
            </View>
          ))}
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <IconSymbol name="info.circle.fill" size={18} color={colors.info} />
          <Text style={styles.infoText}>
            Payout history and detailed earnings reports are available on the Dhaggay web portal.
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}
