import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@shared/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChipProps {
  label: string;
  onPress?: () => void;
  active?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  size?: 'sm' | 'md';
}

// ─── Size config ──────────────────────────────────────────────────────────────

const CHIP_HEIGHT: Record<'sm' | 'md', number> = {
  sm: 28,
  md: 36,
};

// ─── Component ────────────────────────────────────────────────────────────────

function ChipComponent({
  label,
  onPress,
  active = false,
  disabled = false,
  leftIcon,
  size = 'md',
}: ChipProps): React.JSX.Element {
  const { colors, typo, sp, r } = useTheme();

  const bgColor: string = active ? colors.accentSubtle : colors.chipBg;
  const borderColor: string = active ? colors.accent : colors.border;
  const textColor: string = active ? colors.accent : colors.textMid;
  const typescale = size === 'sm' ? typo.scale.caption : typo.scale.bodySmall;

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: CHIP_HEIGHT[size],
      paddingHorizontal: sp.md,
      borderRadius: r.pill,
      backgroundColor: bgColor,
      borderWidth: 1,
      borderColor: borderColor,
      opacity: disabled ? 0.4 : 1,
      gap: sp.xs,
    },
    label: {
      ...typescale,
      fontFamily: typo.fonts.sansMed,
      color: textColor,
    },
  });

  const handlePress = useCallback(() => {
    if (onPress !== undefined) onPress();
  }, [onPress]);

  if (onPress !== undefined) {
    return (
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.container,
          pressed && !disabled && { opacity: 0.7 },
        ]}
        accessibilityRole="button"
        accessibilityState={{ disabled, selected: active }}
      >
        {leftIcon !== undefined && leftIcon}
        <Text style={styles.label}>{label}</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      {leftIcon !== undefined && leftIcon}
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

export const Chip = memo(ChipComponent);
