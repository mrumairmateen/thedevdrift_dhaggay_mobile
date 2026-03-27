import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import {
  useGetPlatformPromosQuery,
  useCreatePlatformPromoMutation,
  useTogglePlatformPromoMutation,
} from '@services/adminApi';
import type { PlatformPromo } from '@services/adminApi';
import { useTheme } from '@shared/theme';
import {
  Badge,
  ErrorBanner,
  ScreenHeader,
} from '@shared/components/ui';
import { IconSymbol } from '@shared/components/ui/icon-symbol';

// ─── Create Form ──────────────────────────────────────────────────────────────

function CreatePromoForm(): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();
  const [createPlatformPromo, { isLoading }] = useCreatePlatformPromoMutation();

  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState('');
  const [minOrder, setMinOrder] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [error, setError] = useState('');

  const handleCreate = useCallback(() => {
    const trimCode = code.trim().toUpperCase();
    const numValue = parseFloat(value);
    if (trimCode.length === 0 || isNaN(numValue) || numValue <= 0) {
      setError('Code and a positive value are required.');
      return;
    }
    setError('');
    void createPlatformPromo({
      code: trimCode,
      type,
      value: numValue,
      ...(minOrder.trim().length > 0 ? { minOrderValue: parseFloat(minOrder) } : {}),
      ...(maxUses.trim().length > 0 ? { maxUses: parseInt(maxUses, 10) } : {}),
    }).then(() => {
      setCode('');
      setValue('');
      setMinOrder('');
      setMaxUses('');
    });
  }, [createPlatformPromo, code, type, value, minOrder, maxUses]);

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      padding: sp.md,
      borderWidth: 1,
      borderColor: colors.border,
      gap: sp.sm,
      marginBottom: sp.lg,
      ...elev.low,
    },
    sectionTitle: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.serifBold,
      color: colors.textHigh,
    },
    label: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sansMed,
      color: colors.textMid,
      marginBottom: sp.xs,
    },
    input: {
      backgroundColor: colors.inputBg,
      borderRadius: r.sm,
      borderWidth: 1,
      borderColor: colors.border,
      padding: sp.sm,
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sans,
      color: colors.textHigh,
    },
    typeRow: {
      flexDirection: 'row',
      gap: sp.sm,
    },
    typePill: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: sp.sm,
      borderRadius: r.pill,
      borderWidth: 1,
    },
    typePillLabel: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansMed,
    },
    errorText: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.error,
    },
    createBtn: {
      backgroundColor: colors.accent,
      borderRadius: r.sm,
      paddingVertical: sp.md,
      alignItems: 'center',
    },
    createLabel: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.textOnAccent,
    },
  });

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Create Promo Code</Text>

      <View>
        <Text style={styles.label}>Code</Text>
        <TextInput
          style={styles.input}
          value={code}
          onChangeText={(t) => setCode(t.toUpperCase())}
          placeholder="SUMMER20"
          placeholderTextColor={colors.textLow}
          autoCapitalize="characters"
        />
      </View>

      <View>
        <Text style={styles.label}>Type</Text>
        <View style={styles.typeRow}>
          {(['percentage', 'fixed'] as const).map((t) => (
            <Pressable
              key={t}
              style={[
                styles.typePill,
                {
                  backgroundColor: type === t ? colors.accentSubtle : colors.chipBg,
                  borderColor: type === t ? colors.accent : colors.border,
                },
              ]}
              onPress={() => setType(t)}
            >
              <Text
                style={[
                  styles.typePillLabel,
                  { color: type === t ? colors.accent : colors.textMid },
                ]}
              >
                {t === 'percentage' ? 'Percentage' : 'Fixed PKR'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View>
        <Text style={styles.label}>Value {type === 'percentage' ? '(%)' : '(PKR)'}</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={setValue}
          placeholder={type === 'percentage' ? '20' : '200'}
          placeholderTextColor={colors.textLow}
          keyboardType="decimal-pad"
        />
      </View>

      <View>
        <Text style={styles.label}>Min Order Value (PKR, optional)</Text>
        <TextInput
          style={styles.input}
          value={minOrder}
          onChangeText={setMinOrder}
          placeholder="1000"
          placeholderTextColor={colors.textLow}
          keyboardType="decimal-pad"
        />
      </View>

      <View>
        <Text style={styles.label}>Max Uses (0 = unlimited, optional)</Text>
        <TextInput
          style={styles.input}
          value={maxUses}
          onChangeText={setMaxUses}
          placeholder="100"
          placeholderTextColor={colors.textLow}
          keyboardType="number-pad"
        />
      </View>

      {error.length > 0 && <Text style={styles.errorText}>{error}</Text>}

      <Pressable
        style={[styles.createBtn, isLoading && { opacity: 0.6 }]}
        onPress={handleCreate}
        disabled={isLoading}
      >
        <Text style={styles.createLabel}>{isLoading ? 'Creating...' : 'Create Promo'}</Text>
      </Pressable>
    </View>
  );
}

// ─── Promo Row ────────────────────────────────────────────────────────────────

interface PromoRowProps {
  promo: PlatformPromo;
}

const PromoRow = React.memo(function PromoRow({ promo }: PromoRowProps): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();
  const [togglePlatformPromo, { isLoading }] = useTogglePlatformPromoMutation();

  const handleToggle = useCallback(() => {
    void togglePlatformPromo({ id: promo._id });
  }, [togglePlatformPromo, promo._id]);

  const expiryText = promo.expiresAt !== null
    ? new Date(promo.expiresAt).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'No expiry';

  const styles = StyleSheet.create({
    row: {
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
    code: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.textHigh,
      letterSpacing: 1,
    },
    meta: {
      ...typo.scale.caption,
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
    <View style={styles.row}>
      <View style={styles.topRow}>
        <Text style={styles.code}>{promo.code}</Text>
        <Badge
          label={promo.isActive ? 'Active' : 'Inactive'}
          variant={promo.isActive ? 'success' : 'neutral'}
          size="sm"
        />
      </View>
      <Text style={styles.meta}>
        {promo.type === 'percentage' ? `${promo.value}% off` : `PKR ${promo.value} off`}
        {promo.minOrderValue > 0 ? ` · Min PKR ${promo.minOrderValue}` : ''}
      </Text>
      <Text style={styles.meta}>
        Used {promo.usedCount}/{promo.maxUses === 0 ? '∞' : promo.maxUses} · {expiryText}
      </Text>
      <View style={styles.bottomRow}>
        <Text style={styles.meta}>Toggle active</Text>
        <Switch
          value={promo.isActive}
          onValueChange={handleToggle}
          disabled={isLoading}
          trackColor={{ false: colors.border, true: colors.accentMid }}
          thumbColor={promo.isActive ? colors.accent : colors.textLow}
        />
      </View>
    </View>
  );
});

// ─── Skeleton Row ─────────────────────────────────────────────────────────────

function PromoRowSkeleton(): React.JSX.Element {
  const { colors, sp, r } = useTheme();

  const styles = StyleSheet.create({
    row: {
      height: 110,
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

export default function AdminPromotionsScreen(): React.JSX.Element {
  const { colors, sp } = useTheme();
  const router = useRouter();

  const { data, isLoading, isError, refetch } = useGetPlatformPromosQuery();

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const renderPromo = useCallback(
    ({ item }: { item: PlatformPromo }) => <PromoRow promo={item} />,
    [],
  );

  const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg },
    list: { flex: 1 },
    listContent: { padding: sp.base, paddingBottom: sp['4xl'] },
    errorWrap: { padding: sp.base },
    skeletonWrap: { padding: sp.base },
    emptyWrap: {
      alignItems: 'center',
      paddingVertical: sp['2xl'],
      gap: sp.md,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600' as const,
      color: colors.textHigh,
    },
    emptyMsg: {
      fontSize: 14,
      color: colors.textMid,
      textAlign: 'center' as const,
    },
  });

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Platform Promos" onBack={handleBack} />

      {isLoading ? (
        <ScrollView>
          <View style={styles.skeletonWrap}>
            {[0, 1, 2, 3].map((i) => (
              <PromoRowSkeleton key={i} />
            ))}
          </View>
        </ScrollView>
      ) : isError ? (
        <View style={styles.errorWrap}>
          <ErrorBanner
            message="Could not load promotions. Please try again."
            onRetry={refetch}
          />
        </View>
      ) : (
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={data ?? []}
          keyExtractor={(item) => item._id}
          renderItem={renderPromo}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<CreatePromoForm />}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <IconSymbol name="tag.fill" size={40} color={colors.textLow} />
              <Text style={styles.emptyTitle}>No promos yet</Text>
              <Text style={styles.emptyMsg}>Create your first platform-wide promo code above.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
