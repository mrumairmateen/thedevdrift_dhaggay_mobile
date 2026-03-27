import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  ListRenderItem,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  useGetMeasurementsQuery,
  useCreateMeasurementMutation,
  useUpdateMeasurementMutation,
  useDeleteMeasurementMutation,
  useSetDefaultMeasurementMutation,
  type Measurement,
  type MeasurementPayload,
} from '@services/measurementsApi';
import { useTheme } from '@shared/theme';
import {
  EmptyState,
  ErrorBanner,
  Skeleton,
} from '@shared/components/ui';
import { IconSymbol } from '@shared/components/ui/icon-symbol';
import { DashboardHeader } from '@features/dashboard/components/shared/DashboardHeader';

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_PROFILES = 10;

interface FieldConfig {
  key: keyof Omit<MeasurementPayload, 'label' | 'customNotes' | 'isDefault'>;
  label: string;
  required: boolean;
  min: number;
  max: number;
}

const FIELDS: FieldConfig[] = [
  { key: 'chest',       label: 'Chest (cm)',         required: true,  min: 1,   max: 150 },
  { key: 'waist',       label: 'Waist (cm)',          required: true,  min: 1,   max: 150 },
  { key: 'hips',        label: 'Hips (cm)',           required: true,  min: 1,   max: 150 },
  { key: 'shoulder',    label: 'Shoulder (cm)',       required: true,  min: 1,   max: 100 },
  { key: 'length',      label: 'Length (cm)',         required: true,  min: 1,   max: 200 },
  { key: 'sleeveLength',label: 'Sleeve Length (cm)',  required: false, min: 1,   max: 200 },
];

// ─── Form state types ─────────────────────────────────────────────────────────

interface FormState {
  label: string;
  chest: string;
  waist: string;
  hips: string;
  shoulder: string;
  length: string;
  sleeveLength: string;
  customNotes: string;
  isDefault: boolean;
}

type FieldErrors = Partial<Record<keyof FormState, string>>;

const EMPTY_FORM: FormState = {
  label: '',
  chest: '',
  waist: '',
  hips: '',
  shoulder: '',
  length: '',
  sleeveLength: '',
  customNotes: '',
  isDefault: false,
};

function measurementToForm(m: Measurement): FormState {
  return {
    label: m.label,
    chest: String(m.chest),
    waist: String(m.waist),
    hips: String(m.hips),
    shoulder: String(m.shoulder),
    length: String(m.length),
    sleeveLength: m.sleeveLength !== undefined ? String(m.sleeveLength) : '',
    customNotes: m.customNotes ?? '',
    isDefault: m.isDefault,
  };
}

function validateForm(form: FormState): FieldErrors {
  const errors: FieldErrors = {};

  if (form.label.trim().length === 0) {
    errors.label = 'Label is required';
  }

  for (const field of FIELDS) {
    const raw = form[field.key] as string;
    if (field.required) {
      if (raw.trim().length === 0) {
        errors[field.key] = `${field.label} is required`;
        continue;
      }
    } else if (raw.trim().length === 0) {
      continue; // optional and empty — skip
    }
    const n = Number(raw);
    if (isNaN(n) || n < field.min || n > field.max) {
      errors[field.key] = `Must be between ${field.min} and ${field.max}`;
    }
  }

  if (form.customNotes.length > 200) {
    errors.customNotes = 'Max 200 characters';
  }

  return errors;
}

function buildPayload(form: FormState): MeasurementPayload {
  const payload: MeasurementPayload = {
    label: form.label.trim(),
    chest: Number(form.chest),
    waist: Number(form.waist),
    hips: Number(form.hips),
    shoulder: Number(form.shoulder),
    length: Number(form.length),
    isDefault: form.isDefault,
  };
  if (form.sleeveLength.trim().length > 0) {
    payload.sleeveLength = Number(form.sleeveLength);
  }
  if (form.customNotes.trim().length > 0) {
    payload.customNotes = form.customNotes.trim();
  }
  return payload;
}

// ─── Inline Add/Edit Form ─────────────────────────────────────────────────────

interface FormProps {
  initialValues: FormState;
  onSave: (form: FormState) => void;
  onCancel: () => void;
  isSaving: boolean;
  errorMessage: string | null;
}

const MeasurementForm = React.memo(function MeasurementForm({
  initialValues,
  onSave,
  onCancel,
  isSaving,
  errorMessage,
}: FormProps): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();
  const [form, setForm] = useState<FormState>(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const handleFieldChange = useCallback((key: keyof FormState, value: string | boolean): void => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (submitted) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }, [submitted]);

  const handleSave = useCallback((): void => {
    setSubmitted(true);
    const errs = validateForm(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    onSave(form);
  }, [form, onSave]);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: r.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: sp.base,
      gap: sp.md,
      ...elev.low,
    },
    fieldGroup: { gap: sp.xs },
    label: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansMed,
      color: colors.textMid,
    },
    required: {
      color: colors.error,
    },
    optional: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textLow,
    },
    input: {
      height: 44,
      backgroundColor: colors.inputBg,
      borderRadius: r.sm,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: sp.md,
      ...typo.scale.body,
      fontFamily: typo.fonts.sans,
      color: colors.textHigh,
    },
    inputError: {
      borderColor: colors.error,
    },
    errorText: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.error,
    },
    gridRow: {
      flexDirection: 'row',
      gap: sp.sm,
    },
    gridCell: { flex: 1 },
    notesInput: {
      height: 72,
      textAlignVertical: 'top' as const,
      paddingTop: sp.sm,
    },
    checkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: sp.sm,
      paddingVertical: sp.sm,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: r.sharp,
      borderWidth: 2,
      borderColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxChecked: {
      backgroundColor: colors.accent,
    },
    checkLabel: {
      ...typo.scale.body,
      fontFamily: typo.fonts.sansMed,
      color: colors.textHigh,
    },
    actionRow: {
      flexDirection: 'row',
      gap: sp.sm,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      paddingTop: sp.md,
    },
    saveBtn: {
      flex: 1,
      height: 44,
      backgroundColor: colors.accent,
      borderRadius: r.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    saveBtnDisabled: {
      opacity: 0.6,
    },
    saveBtnText: {
      ...typo.scale.body,
      fontFamily: typo.fonts.sansBold,
      color: colors.textOnAccent,
    },
    cancelBtn: {
      flex: 1,
      height: 44,
      borderRadius: r.md,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelBtnText: {
      ...typo.scale.body,
      fontFamily: typo.fonts.sansMed,
      color: colors.textMid,
    },
  });

  return (
    <View style={styles.container}>
      {/* Label */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>
          Profile Label <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, errors.label !== undefined && styles.inputError]}
          placeholder="e.g. My Regular Fit"
          placeholderTextColor={colors.textLow}
          value={form.label}
          onChangeText={(v) => handleFieldChange('label', v)}
          maxLength={50}
        />
        {errors.label !== undefined && (
          <Text style={styles.errorText}>{errors.label}</Text>
        )}
      </View>

      {/* Measurements 3×2 grid */}
      {[
        [FIELDS[0], FIELDS[1]],
        [FIELDS[2], FIELDS[3]],
        [FIELDS[4], FIELDS[5]],
      ].map((pair, rowIdx) => (
        <View key={rowIdx} style={styles.gridRow}>
          {pair.map((field) => {
            if (!field) return null;
            const val = form[field.key] as string;
            const err = errors[field.key];
            return (
              <View key={field.key} style={[styles.gridCell, styles.fieldGroup]}>
                <Text style={styles.label}>
                  {field.label}{' '}
                  {field.required
                    ? <Text style={styles.required}>*</Text>
                    : <Text style={styles.optional}>(opt)</Text>
                  }
                </Text>
                <TextInput
                  style={[styles.input, err !== undefined && styles.inputError]}
                  placeholder={field.required ? 'cm' : '–'}
                  placeholderTextColor={colors.textLow}
                  keyboardType="numeric"
                  value={val}
                  onChangeText={(v) => handleFieldChange(field.key, v)}
                />
                {err !== undefined && (
                  <Text style={styles.errorText}>{err}</Text>
                )}
              </View>
            );
          })}
        </View>
      ))}

      {/* Custom Notes */}
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Custom Notes <Text style={styles.optional}>(opt, max 200)</Text></Text>
        <TextInput
          style={[styles.input, styles.notesInput, errors.customNotes !== undefined && styles.inputError]}
          placeholder="e.g. loose fit preferred"
          placeholderTextColor={colors.textLow}
          multiline
          numberOfLines={2}
          maxLength={200}
          value={form.customNotes}
          onChangeText={(v) => handleFieldChange('customNotes', v)}
        />
        {errors.customNotes !== undefined && (
          <Text style={styles.errorText}>{errors.customNotes}</Text>
        )}
      </View>

      {/* Save as Default */}
      <Pressable
        onPress={() => handleFieldChange('isDefault', !form.isDefault)}
        style={styles.checkRow}
        hitSlop={8}
      >
        <View style={[styles.checkbox, form.isDefault && styles.checkboxChecked]}>
          {form.isDefault && (
            <IconSymbol name="checkmark" size={14} color={colors.textOnAccent} />
          )}
        </View>
        <Text style={styles.checkLabel}>Save as Default profile</Text>
      </Pressable>

      {/* API error */}
      {errorMessage !== null && (
        <ErrorBanner message={errorMessage} />
      )}

      {/* Actions */}
      <View style={styles.actionRow}>
        <Pressable
          onPress={handleSave}
          disabled={isSaving}
          style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
        >
          <Text style={styles.saveBtnText}>{isSaving ? 'Saving...' : 'Save'}</Text>
        </Pressable>
        <Pressable onPress={onCancel} style={styles.cancelBtn} disabled={isSaving}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
});

// ─── Measurement Card ─────────────────────────────────────────────────────────

interface MeasurementCardProps {
  measurement: Measurement;
  onEdit: (m: Measurement) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
  editingId: string | null;
  onSaveEdit: (form: FormState) => void;
  onCancelEdit: () => void;
  isSaving: boolean;
  saveError: string | null;
}

const MeasurementCard = React.memo(function MeasurementCard({
  measurement: m,
  onEdit,
  onDelete,
  onSetDefault,
  editingId,
  onSaveEdit,
  onCancelEdit,
  isSaving,
  saveError,
}: MeasurementCardProps): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();

  const handleEdit = useCallback((): void => { onEdit(m); }, [onEdit, m]);
  const handleDelete = useCallback((): void => { onDelete(m._id); }, [onDelete, m._id]);
  const handleSetDefault = useCallback((): void => { onSetDefault(m._id); }, [onSetDefault, m._id]);

  const isEditing = editingId === m._id;

  const measureCells = [
    { label: 'Chest',    value: m.chest },
    { label: 'Waist',    value: m.waist },
    { label: 'Hips',     value: m.hips },
    { label: 'Shoulder', value: m.shoulder },
    { label: 'Length',   value: m.length },
    { label: 'Sleeve',   value: m.sleeveLength ?? null },
  ] as const;

  const styles = StyleSheet.create({
    card: {
      borderWidth: 1,
      backgroundColor: colors.elevated,
      borderColor: m.isDefault ? colors.accent : colors.border,
      borderRadius: r.lg,
      marginBottom: sp.sm,
      overflow: 'hidden',
      ...elev.low,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      padding: sp.base,
      paddingBottom: sp.sm,
    },
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: sp.xs,
      flexShrink: 1,
    },
    cardLabel: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.serifBold,
      color: colors.textHigh,
    },
    defaultBadge: {
      backgroundColor: colors.accentSubtle,
      borderRadius: r.sharp,
      paddingHorizontal: sp.xs,
      paddingVertical: 2,
    },
    defaultBadgeText: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansBold,
      color: colors.accent,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    notes: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textLow,
      paddingHorizontal: sp.base,
      paddingBottom: sp.sm,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
      marginHorizontal: sp.base,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      padding: sp.sm,
    },
    cell: {
      width: '33.33%',
      alignItems: 'center',
      paddingVertical: sp.sm,
    },
    cellValue: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.textHigh,
    },
    cellLabel: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textLow,
      marginTop: 2,
    },
    actionRow: {
      flexDirection: 'row',
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    actionBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: sp.xs,
      paddingVertical: sp.md,
    },
    actionBtnBorder: {
      borderRightWidth: StyleSheet.hairlineWidth,
      borderRightColor: colors.border,
    },
    actionBtnText: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sansMed,
      color: colors.textMid,
    },
    deleteText: {
      color: colors.error,
    },
    editFormPad: {
      padding: sp.sm,
      paddingTop: 0,
    },
  });

  return (
    <View style={styles.card}>
      {/* Card header */}
      <View style={styles.header}>
        <View style={styles.labelRow}>
          <Text style={styles.cardLabel} numberOfLines={1}>{m.label}</Text>
          {m.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>Default</Text>
            </View>
          )}
        </View>
      </View>

      {/* Custom notes */}
      {m.customNotes !== undefined && m.customNotes.length > 0 && (
        <Text style={styles.notes} numberOfLines={1}>{m.customNotes}</Text>
      )}

      <View style={styles.divider} />

      {/* 2×3 measurement grid */}
      <View style={styles.grid}>
        {measureCells.map((cell) => (
          <View key={cell.label} style={styles.cell}>
            <Text style={styles.cellValue}>
              {cell.value !== null ? `${cell.value} cm` : '–'}
            </Text>
            <Text style={styles.cellLabel}>{cell.label}</Text>
          </View>
        ))}
      </View>

      {/* Action row */}
      <View style={styles.actionRow}>
        {!m.isDefault && (
          <Pressable
            onPress={handleSetDefault}
            style={({ pressed }) => [
              styles.actionBtn,
              styles.actionBtnBorder,
              { opacity: pressed ? 0.6 : 1 },
            ]}
            hitSlop={4}
          >
            <IconSymbol name="star" size={14} color={colors.textMid} />
            <Text style={styles.actionBtnText}>Set Default</Text>
          </Pressable>
        )}
        <Pressable
          onPress={handleEdit}
          style={({ pressed }) => [
            styles.actionBtn,
            styles.actionBtnBorder,
            { opacity: pressed ? 0.6 : 1 },
          ]}
          hitSlop={4}
        >
          <IconSymbol name="pencil" size={14} color={colors.textMid} />
          <Text style={styles.actionBtnText}>Edit</Text>
        </Pressable>
        <Pressable
          onPress={handleDelete}
          style={({ pressed }) => [
            styles.actionBtn,
            { opacity: pressed ? 0.6 : 1 },
          ]}
          hitSlop={4}
        >
          <IconSymbol name="trash" size={14} color={colors.error} />
          <Text style={[styles.actionBtnText, styles.deleteText]}>Delete</Text>
        </Pressable>
      </View>

      {/* Inline edit form */}
      {isEditing && (
        <View style={styles.editFormPad}>
          <MeasurementForm
            initialValues={measurementToForm(m)}
            onSave={onSaveEdit}
            onCancel={onCancelEdit}
            isSaving={isSaving}
            errorMessage={saveError}
          />
        </View>
      )}
    </View>
  );
});

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function MeasurementsSkeleton(): React.JSX.Element {
  const { sp, r } = useTheme();
  return (
    <View style={{ padding: sp.base, gap: sp.sm }}>
      <Skeleton width="100%" height={160} radius={r.lg} />
      <Skeleton width="100%" height={160} radius={r.lg} />
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function MeasurementsScreen(): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();

  const { data: measurements, isLoading, isError, refetch } = useGetMeasurementsQuery();
  const [createMeasurement, { isLoading: isCreating }] = useCreateMeasurementMutation();
  const [updateMeasurement, { isLoading: isUpdating }] = useUpdateMeasurementMutation();
  const [deleteMeasurement] = useDeleteMeasurementMutation();
  const [setDefaultMeasurement] = useSetDefaultMeasurementMutation();

  // Controls which form is visible: 'add' | measurement._id | null
  const [activeForm, setActiveForm] = useState<'add' | string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const isSaving = isCreating || isUpdating;
  const count = measurements?.length ?? 0;
  const canAdd = count < MAX_PROFILES;

  const handleOpenAdd = useCallback((): void => {
    setActiveForm('add');
    setSaveError(null);
  }, []);

  const handleOpenEdit = useCallback((m: Measurement): void => {
    setActiveForm(m._id);
    setSaveError(null);
  }, []);

  const handleCancelForm = useCallback((): void => {
    setActiveForm(null);
    setSaveError(null);
  }, []);

  const handleSaveAdd = useCallback(async (form: FormState): Promise<void> => {
    setSaveError(null);
    try {
      await createMeasurement(buildPayload(form)).unwrap();
      setActiveForm(null);
    } catch (err: unknown) {
      const msg =
        err !== null &&
        typeof err === 'object' &&
        'data' in err &&
        err.data !== null &&
        typeof err.data === 'object' &&
        'message' in err.data &&
        typeof (err.data as Record<string, unknown>)['message'] === 'string'
          ? String((err.data as Record<string, unknown>)['message'])
          : 'Failed to save. Please try again.';
      setSaveError(msg);
    }
  }, [createMeasurement]);

  const handleSaveEdit = useCallback(async (id: string, form: FormState): Promise<void> => {
    setSaveError(null);
    try {
      await updateMeasurement({ id, body: buildPayload(form) }).unwrap();
      setActiveForm(null);
    } catch (err: unknown) {
      const msg =
        err !== null &&
        typeof err === 'object' &&
        'data' in err &&
        err.data !== null &&
        typeof err.data === 'object' &&
        'message' in err.data &&
        typeof (err.data as Record<string, unknown>)['message'] === 'string'
          ? String((err.data as Record<string, unknown>)['message'])
          : 'Failed to update. Please try again.';
      setSaveError(msg);
    }
  }, [updateMeasurement]);

  const handleDelete = useCallback((id: string): void => {
    Alert.alert(
      'Delete Measurement',
      'Are you sure you want to delete this profile?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async (): Promise<void> => {
            try {
              await deleteMeasurement(id).unwrap();
            } catch (err: unknown) {
              const msg =
                err !== null &&
                typeof err === 'object' &&
                'data' in err &&
                err.data !== null &&
                typeof err.data === 'object' &&
                'message' in err.data &&
                typeof (err.data as Record<string, unknown>)['message'] === 'string'
                  ? String((err.data as Record<string, unknown>)['message'])
                  : 'Cannot delete this profile.';
              Alert.alert('Error', msg);
            }
          },
        },
      ],
    );
  }, [deleteMeasurement]);

  const handleSetDefault = useCallback(async (id: string): Promise<void> => {
    try {
      await setDefaultMeasurement(id).unwrap();
    } catch {
      Alert.alert('Error', 'Could not set default profile. Please try again.');
    }
  }, [setDefaultMeasurement]);

  const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg },
    headerBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: sp.base,
      paddingVertical: sp.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: sp.sm,
    },
    headerTitle: {
      ...typo.scale.title3,
      fontFamily: typo.fonts.serifBold,
      color: colors.textHigh,
    },
    countBadge: {
      backgroundColor: colors.accentSubtle,
      borderRadius: r.pill,
      paddingHorizontal: sp.sm,
      paddingVertical: 2,
    },
    countBadgeText: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sansBold,
      color: colors.accent,
    },
    addBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: sp.xs,
      backgroundColor: colors.accent,
      borderRadius: r.pill,
      paddingHorizontal: sp.md,
      paddingVertical: sp.xs + 2,
    },
    addBtnDisabled: {
      backgroundColor: colors.panel,
    },
    addBtnText: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.textOnAccent,
    },
    addBtnTextDisabled: {
      color: colors.textLow,
    },
    addFormContainer: {
      padding: sp.base,
      paddingBottom: sp.xs,
    },
    listContent: {
      padding: sp.base,
      paddingBottom: sp['4xl'],
    },
    errorPad: {
      padding: sp.base,
      marginTop: sp.lg,
    },
  });

  // Build a stable onSaveEdit for each card to avoid recreating closures
  const makeOnSaveEdit = useCallback(
    (id: string) => (form: FormState) => { void handleSaveEdit(id, form); },
    [handleSaveEdit],
  );

  const renderItem = useCallback<ListRenderItem<Measurement>>(
    ({ item }) => (
      <MeasurementCard
        measurement={item}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        onSetDefault={handleSetDefault}
        editingId={activeForm === 'add' ? null : (activeForm ?? null)}
        onSaveEdit={makeOnSaveEdit(item._id)}
        onCancelEdit={handleCancelForm}
        isSaving={isSaving}
        saveError={activeForm === item._id ? saveError : null}
      />
    ),
    [handleOpenEdit, handleDelete, handleSetDefault, activeForm, makeOnSaveEdit, handleCancelForm, isSaving, saveError],
  );

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <DashboardHeader title="My Measurements" showBack={false} />

      {/* Sub-header: count badge + Add New button */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Profiles</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{count}/{MAX_PROFILES}</Text>
          </View>
        </View>
        <Pressable
          onPress={canAdd ? handleOpenAdd : undefined}
          style={[styles.addBtn, !canAdd && styles.addBtnDisabled]}
          hitSlop={8}
          accessibilityLabel={canAdd ? 'Add new measurement profile' : 'Maximum 10 profiles reached'}
          accessibilityHint={canAdd ? undefined : 'Maximum 10 profiles'}
        >
          <IconSymbol name="plus" size={14} color={canAdd ? colors.textOnAccent : colors.textLow} />
          <Text style={[styles.addBtnText, !canAdd && styles.addBtnTextDisabled]}>Add New</Text>
        </Pressable>
      </View>

      {/* Body */}
      {isLoading ? (
        <MeasurementsSkeleton />
      ) : isError ? (
        <View style={styles.errorPad}>
          <ErrorBanner
            message="Could not load your measurements. Please try again."
            onRetry={refetch}
          />
        </View>
      ) : (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Inline Add form */}
          {activeForm === 'add' && (
            <View style={styles.addFormContainer}>
              <MeasurementForm
                initialValues={EMPTY_FORM}
                onSave={(form) => { void handleSaveAdd(form); }}
                onCancel={handleCancelForm}
                isSaving={isCreating}
                errorMessage={saveError}
              />
            </View>
          )}

          {/* Empty state */}
          {count === 0 && activeForm !== 'add' ? (
            <EmptyState
              icon={<IconSymbol name="ruler" size={32} color={colors.textLow} />}
              title="No measurements saved"
              message="Add your first measurement profile to speed up ordering."
              action={{ label: 'Add Measurement', onPress: handleOpenAdd }}
            />
          ) : (
            <FlatList
              data={measurements ?? []}
              keyExtractor={(item) => item._id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              scrollEnabled={false}
              removeClippedSubviews
            />
          )}
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}
