import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@shared/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

export type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'neutral';

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  dot?: boolean;
  size?: 'sm' | 'md';
}

// ─── Component ────────────────────────────────────────────────────────────────

export const Badge = memo(function Badge({
  label,
  variant = 'neutral',
  dot = false,
  size = 'md',
}: BadgeProps): React.JSX.Element {
  const { colors, typo, sp, r } = useTheme();

  const variantMap: Record<BadgeVariant, { bg: string; text: string }> = {
    success: { bg: colors.successSubtle, text: colors.success },
    error:   { bg: colors.errorSubtle,   text: colors.error   },
    warning: { bg: colors.warningSubtle, text: colors.warning },
    info:    { bg: colors.infoSubtle,    text: colors.info    },
    neutral: { bg: colors.panel,         text: colors.textMid },
  };

  const { bg, text } = variantMap[variant];

  const styles = StyleSheet.create({
    container: {
      alignSelf: 'flex-start',
      backgroundColor: bg,
      borderRadius: r.sharp,
      paddingHorizontal: size === 'sm' ? sp.xs : sp.sm,
      paddingVertical:   size === 'sm' ? 2     : sp.xs,
    },
    label: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansMed,
      color: text,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: text,
    },
  });

  if (dot) {
    return <View style={styles.dot} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
});
