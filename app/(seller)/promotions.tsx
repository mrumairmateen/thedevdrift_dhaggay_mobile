import React, { useCallback, useState } from 'react';
import {
  Alert,
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  useGetMyPromosQuery,
  useCreatePromoMutation,
  useTogglePromoMutation,
  useDeletePromoMutation,
} from '@services/sellerApi';
import type { PromoCode, CreatePromoPayload } from '@services/sellerApi';
import { useTheme } from '@shared/theme';
import {
  Button,
  EmptyState,
  ErrorBanner,
  Skeleton,
} from '@shared/components/ui';
import { IconSymbol } from '@shared/components/ui/icon-symbol';

// ─── PromoCodeCard ────────────────────────────────────────────────────────────

export interface PromoCodeCardProps {
  promo: PromoCode;
  onToggle: (id: string) => void;
  onDelete: (id: string, code: string) => void;
  isToggling: boolean;
  isDeleting: boolean;
}

export const PromoCodeCard = React.memo(function PromoCodeCard({
  promo,
  onToggle,
  onDelete,
  isToggling,
  isDeleting,
}: PromoCodeCardProps): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();

  const handleToggle = useCallback(() => onToggle(promo._id), [onToggle, promo._id]);
  const handleDelete = useCallback(() => onDelete(promo._id, promo.code), [onDelete, promo._id, promo.code]);

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.elevated,
      borderRadius: r.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: sp.md,
      marginBottom: sp.sm,
      gap: sp.sm,
      ...elev.low,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    codeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: sp.sm,
    },
    code: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.textHigh,
      letterSpacing: 1,
    },
    typeBadge: {
      paddingHorizontal: sp.sm,
      paddingVertical: 2,
      borderRadius: r.sharp,
      backgroundColor: colors.accentSubtle,
    },
    typeBadgeText: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansBold,
      color: colors.accent,
    },
    value: {
      ...typo.scale.body,
      fontFamily: typo.fonts.sansBold,
      color: colors.accent,
    },
    meta: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
    },
    metaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: sp.sm,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: sp.sm,
    },
    activeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: sp.xs,
    },
    activeLabel: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sansMed,
      color: colors.textMid,
    },
    deleteBtn: {
      padding: sp.xs,
    },
  });

  const valueText =
    promo.type === 'percentage' ? `${promo.value}% off` : `PKR ${promo.value.toLocaleString()} off`;

  const minText =
    promo.minOrderValue > 0 ? `Min PKR ${promo.minOrderValue.toLocaleString()}` : 'No minimum';

  const usesText =
    promo.maxUses > 0
      ? `${promo.usedCount}/${promo.maxUses} used`
      : `${promo.usedCount} used (unlimited)`;

  const expiryText = promo.expiresAt
    ? new Date(promo.expiresAt).toLocaleDateString('en-PK', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'No expiry';

  return (
    <View style={styles.card}>
      {/* Code + type badge */}
      <View style={styles.headerRow}>
        <View style={styles.codeRow}>
          <Text style={styles.code}>{promo.code}</Text>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>
              {promo.type === 'percentage' ? '%' : 'PKR'}
            </Text>
          </View>
        </View>
        <Text style={styles.value}>{valueText}</Text>
      </View>

      {/* Meta info */}
      <View style={styles.metaRow}>
        <Text style={styles.meta}>{minText}</Text>
        <Text style={[styles.meta, { color: colors.border }]}>·</Text>
        <Text style={styles.meta}>{usesText}</Text>
        <Text style={[styles.meta, { color: colors.border }]}>·</Text>
        <Text style={styles.meta}>Expires: {expiryText}</Text>
      </View>

      {/* Footer: toggle + delete */}
      <View style={styles.footer}>
        <View style={styles.activeRow}>
          <Switch
            value={promo.isActive}
            onValueChange={handleToggle}
            disabled={isToggling || isDeleting}
            trackColor={{ false: colors.panel, true: colors.accentMid }}
            thumbColor={promo.isActive ? colors.accent : colors.textLow}
          />
          <Text style={styles.activeLabel}>
            {promo.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
        <Pressable
          onPress={handleDelete}
          style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.6 }]}
          disabled={isDeleting || isToggling}
          accessibilityLabel={`Delete promo ${promo.code}`}
        >
          <IconSymbol name="trash" size={18} color={colors.error} />
        </Pressable>
      </View>
    </View>
  );
});

// ─── Screen ───────────────────────────────────────────────────────────────────

interface PromoForm {
  code: string;
  type: 'percentage' | 'fixed';
  value: string;
  minOrderValue: string;
  maxUses: string;
  expiresAt: string;
}

const EMPTY_FORM: PromoForm = {
  code: '',
  type: 'percentage',
  value: '',
  minOrderValue: '',
  maxUses: '',
  expiresAt: '',
};

export default function SellerPromotionsScreen(): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();
  const insets = useSafeAreaInsets();

  const { data: promos, isLoading, isError, refetch } = useGetMyPromosQuery();
  const [createPromo, { isLoading: isCreating }] = useCreatePromoMutation();
  const [togglePromo, { isLoading: isToggling  }] = useTogglePromoMutation();
  const [deletePromo, { isLoading: isDeleting  }] = useDeletePromoMutation();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<PromoForm>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  const handleToggleForm = useCallback(() => {
    setShowForm((prev) => !prev);
    setFormError(null);
  }, []);

  const setField = useCallback(<K extends keyof PromoForm>(key: K, val: PromoForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  }, []);

  const handleCodeChange = useCallback((text: string) => {
    setField('code', text.toUpperCase().replace(/[^A-Z0-9]/g, ''));
  }, [setField]);

  const handleCreate = useCallback(async () => {
    setFormError(null);

    const code = form.code.trim();
    if (code.length < 2 || code.length > 20) {
      setFormError('Code must be 2–20 characters (letters and numbers only).');
      return;
    }

    const value = parseFloat(form.value);
    if (isNaN(value) || value <= 0) {
      setFormError('Value must be a positive number.');
      return;
    }
    if (form.type === 'percentage' && value > 90) {
      setFormError('Percentage discount cannot exceed 90%.');
      return;
    }

    const payload: CreatePromoPayload = {
      code,
      type: form.type,
      value,
    };

    const minOrder = parseFloat(form.minOrderValue);
    if (!isNaN(minOrder) && minOrder > 0) payload.minOrderValue = minOrder;

    const maxUses = parseInt(form.maxUses, 10);
    if (!isNaN(maxUses) && maxUses > 0) payload.maxUses = maxUses;

    const expiry = form.expiresAt.trim();
    if (expiry.length > 0) {
      // Expect YYYY-MM-DD format
      const parsed = new Date(expiry);
      if (isNaN(parsed.getTime())) {
        setFormError('Expiry date must be in YYYY-MM-DD format.');
        return;
      }
      payload.expiresAt = parsed.toISOString();
    }

    try {
      await createPromo(payload).unwrap();
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (err: unknown) {
      const msg =
        typeof err === 'object' &&
        err !== null &&
        'data' in err &&
        typeof (err as Record<string, unknown>).data === 'object'
          ? ((err as { data: { message?: string } }).data.message ?? 'Failed to create promo code.')
          : 'Failed to create promo code.';
      setFormError(msg);
    }
  }, [form, createPromo]);

  const handleToggle = useCallback(
    (id: string) => { void togglePromo(id); },
    [togglePromo],
  );

  const handleDelete = useCallback(
    (id: string, code: string) => {
      Alert.alert(
        'Delete promo code?',
        `"${code}" will be permanently removed. This cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => { void deletePromo(id); },
          },
        ],
      );
    },
    [deletePromo],
  );

  const renderPromo = useCallback<ListRenderItem<PromoCode>>(
    ({ item }) => (
      <PromoCodeCard
        promo={item}
        onToggle={handleToggle}
        onDelete={handleDelete}
        isToggling={isToggling}
        isDeleting={isDeleting}
      />
    ),
    [handleToggle, handleDelete, isToggling, isDeleting],
  );

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
    headerTitle: {
      ...typo.scale.title3,
      fontFamily: typo.fonts.serifBold,
      color: colors.textHigh,
    },
    formCard: {
      backgroundColor: colors.elevated,
      borderRadius: r.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: sp.base,
      marginHorizontal: sp.base,
      marginTop: sp.base,
      gap: sp.md,
      ...elev.low,
    },
    formTitle: {
      ...typo.scale.subtitle,
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
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: r.sm,
      paddingHorizontal: sp.md,
      paddingVertical: sp.sm,
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sans,
      color: colors.textHigh,
    },
    codeInput: {
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: r.sm,
      paddingHorizontal: sp.md,
      paddingVertical: sp.sm,
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.textHigh,
      letterSpacing: 1.5,
    },
    pillRow: { flexDirection: 'row', gap: sp.sm },
    pill: {
      flex: 1,
      paddingVertical: sp.sm,
      borderRadius: r.pill,
      borderWidth: 1,
      alignItems: 'center',
    },
    pillText: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sansMed,
    },
    hint: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textLow,
      marginTop: sp.xs,
    },
    errorText: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.error,
    },
    listContent: {
      padding: sp.base,
      paddingBottom: sp['4xl'],
    },
  });

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Promo Codes</Text>
        <Button
          label={showForm ? 'Close' : 'Create Promo'}
          variant={showForm ? 'ghost' : 'primary'}
          size="sm"
          onPress={handleToggleForm}
        />
      </View>

      {/* Create form (collapsible) */}
      {showForm && (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.formCard}
          style={{ flexGrow: 0 }}
        >
          <Text style={styles.formTitle}>New Promo Code</Text>

          {/* Code */}
          <View>
            <Text style={styles.label}>CODE</Text>
            <TextInput
              style={styles.codeInput}
              value={form.code}
              onChangeText={handleCodeChange}
              placeholder="SUMMER20"
              placeholderTextColor={colors.textLow}
              autoCapitalize="characters"
              maxLength={20}
            />
          </View>

          {/* Type */}
          <View>
            <Text style={styles.label}>TYPE</Text>
            <View style={styles.pillRow}>
              {(['percentage', 'fixed'] as const).map((t) => {
                const isActive = form.type === t;
                return (
                  <Pressable
                    key={t}
                    style={[
                      styles.pill,
                      {
                        backgroundColor: isActive ? colors.accentSubtle : colors.chipBg,
                        borderColor: isActive ? colors.accent : colors.border,
                      },
                    ]}
                    onPress={() => setField('type', t)}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        {
                          color: isActive ? colors.accent : colors.textMid,
                          fontFamily: isActive ? typo.fonts.sansBold : typo.fonts.sans,
                        },
                      ]}
                    >
                      {t === 'percentage' ? 'Percentage' : 'Fixed PKR'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Value */}
          <View>
            <Text style={styles.label}>
              {form.type === 'percentage' ? 'DISCOUNT %' : 'DISCOUNT PKR'}
            </Text>
            <TextInput
              style={styles.input}
              value={form.value}
              onChangeText={(t) => setField('value', t)}
              placeholder={form.type === 'percentage' ? '1–90' : 'e.g. 500'}
              placeholderTextColor={colors.textLow}
              keyboardType="numeric"
            />
          </View>

          {/* Min order value */}
          <View>
            <Text style={styles.label}>MIN ORDER VALUE (optional)</Text>
            <TextInput
              style={styles.input}
              value={form.minOrderValue}
              onChangeText={(t) => setField('minOrderValue', t)}
              placeholder="0"
              placeholderTextColor={colors.textLow}
              keyboardType="numeric"
            />
          </View>

          {/* Max uses */}
          <View>
            <Text style={styles.label}>MAX USES (optional, 0 = unlimited)</Text>
            <TextInput
              style={styles.input}
              value={form.maxUses}
              onChangeText={(t) => setField('maxUses', t)}
              placeholder="0"
              placeholderTextColor={colors.textLow}
              keyboardType="numeric"
            />
          </View>

          {/* Expiry date */}
          <View>
            <Text style={styles.label}>EXPIRY DATE (optional)</Text>
            <TextInput
              style={styles.input}
              value={form.expiresAt}
              onChangeText={(t) => setField('expiresAt', t)}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textLow}
              keyboardType="default"
            />
            <Text style={styles.hint}>Leave blank for no expiry</Text>
          </View>

          {/* Error */}
          {formError !== null && (
            <Text style={styles.errorText}>{formError}</Text>
          )}

          {/* Submit */}
          <Button
            label={isCreating ? 'Creating…' : 'Create'}
            variant="primary"
            onPress={() => { void handleCreate(); }}
            loading={isCreating}
          />
        </ScrollView>
      )}

      {/* List */}
      {isLoading ? (
        <View style={{ padding: sp.base, gap: sp.sm }}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} width="100%" height={120} radius={r.lg} />
          ))}
        </View>
      ) : isError ? (
        <View style={{ padding: sp.base }}>
          <ErrorBanner
            message="Could not load promo codes. Please try again."
            onRetry={refetch}
          />
        </View>
      ) : !promos || promos.length === 0 ? (
        <EmptyState
          icon={<IconSymbol name="tag.fill" size={32} color={colors.textLow} />}
          title="No promo codes yet"
          message="Create one above to attract more customers."
        />
      ) : (
        <FlatList
          data={promos}
          keyExtractor={(item) => item._id}
          renderItem={renderPromo}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
        />
      )}
    </View>
  );
}
