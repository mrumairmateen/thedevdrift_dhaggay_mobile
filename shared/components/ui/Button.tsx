import React, { memo, useCallback } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@shared/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// ─── Size config ──────────────────────────────────────────────────────────────

const SIZE_HEIGHT: Record<ButtonSize, number> = {
  sm: 36,
  md: 44,
  lg: 52,
};

// ─── Component ────────────────────────────────────────────────────────────────

function ButtonComponent({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
}: ButtonProps): React.JSX.Element {
  const { colors, typo, sp, r } = useTheme();

  const isAccentBg = variant === 'primary' || variant === 'danger';
  const indicatorColor = isAccentBg ? colors.textOnAccent : colors.accent;

  const bgColor: string =
    variant === 'primary'
      ? colors.accent
      : variant === 'danger'
        ? colors.error
        : 'transparent';

  const borderColor: string =
    variant === 'secondary' ? colors.accent : 'transparent';

  const textColor: string =
    variant === 'primary' || variant === 'danger'
      ? colors.textOnAccent
      : colors.accent;

  const typescale =
    size === 'sm'
      ? typo.scale.bodySmall
      : size === 'lg'
        ? typo.scale.subtitle
        : typo.scale.body;

  const styles = StyleSheet.create({
    pressable: {
      alignSelf: fullWidth ? 'stretch' : 'flex-start',
      opacity: disabled ? 0.4 : 1,
    },
    pressed: {
      opacity: 0.82,
    },
    inner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: SIZE_HEIGHT[size],
      paddingHorizontal: sp.lg,
      borderRadius: r.pill,
      backgroundColor: bgColor,
      borderWidth: variant === 'secondary' ? 1 : 0,
      borderColor: borderColor,
      gap: sp.xs,
    },
    label: {
      ...typescale,
      fontFamily: typo.fonts.sansBold,
      color: textColor,
    },
  });

  const handlePress = useCallback(() => {
    if (disabled || loading) return;
    onPress();
  }, [disabled, loading, onPress]);

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.pressable,
        pressed && !disabled && !loading && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
    >
      <View style={styles.inner}>
        {leftIcon !== undefined && !loading && leftIcon}
        {loading ? (
          <ActivityIndicator color={indicatorColor} size="small" />
        ) : (
          <Text style={styles.label}>{label}</Text>
        )}
        {rightIcon !== undefined && !loading && rightIcon}
      </View>
    </Pressable>
  );
}

export const Button = memo(ButtonComponent);
