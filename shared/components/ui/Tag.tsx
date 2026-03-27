import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@shared/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TagVariant = 'default' | 'accent' | 'success' | 'error' | 'warning';

export interface TagProps {
  label: string;
  variant?: TagVariant;
  onRemove?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const Tag = memo(function Tag({
  label,
  variant = 'default',
  onRemove,
}: TagProps): React.JSX.Element {
  const { colors, typo, sp, r } = useTheme();

  const variantMap: Record<TagVariant, { bg: string; text: string }> = {
    default: { bg: colors.panel,         text: colors.textMid },
    accent:  { bg: colors.accentSubtle,  text: colors.accent  },
    success: { bg: colors.successSubtle, text: colors.success },
    error:   { bg: colors.errorSubtle,   text: colors.error   },
    warning: { bg: colors.warningSubtle, text: colors.warning },
  };

  const { bg, text } = variantMap[variant];

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignSelf: 'flex-start',
      alignItems: 'center',
      backgroundColor: bg,
      borderRadius: r.sharp,
      paddingHorizontal: sp.sm,
      paddingVertical: sp.xs,
      gap: sp.xs,
    },
    label: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansMed,
      color: text,
    },
    remove: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansMed,
      color: text,
    },
  });

  const handleRemove = useCallback(() => {
    if (onRemove !== undefined) {
      onRemove();
    }
  }, [onRemove]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {onRemove !== undefined && (
        <Pressable onPress={handleRemove} hitSlop={sp.xs}>
          <Text style={styles.remove}>{'×'}</Text>
        </Pressable>
      )}
    </View>
  );
});
