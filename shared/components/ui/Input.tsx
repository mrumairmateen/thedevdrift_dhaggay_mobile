import React, { memo, useCallback, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';
import { useTheme } from '@shared/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  hint?: string;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  editable?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onBlur?: () => void;
  onFocus?: () => void;
  multiline?: boolean;
  numberOfLines?: number;
  testID?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

function InputComponent({
  value,
  onChangeText,
  label,
  placeholder,
  error,
  hint,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  editable = true,
  leftIcon,
  rightIcon,
  onBlur,
  onFocus,
  multiline,
  numberOfLines,
  testID,
}: InputProps): React.JSX.Element {
  const { colors, typo, sp, r } = useTheme();
  const [focused, setFocused] = useState<boolean>(false);

  const handleFocus = useCallback(() => {
    setFocused(true);
    if (onFocus !== undefined) onFocus();
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    setFocused(false);
    if (onBlur !== undefined) onBlur();
  }, [onBlur]);

  const borderColor: string =
    error !== undefined
      ? colors.error
      : focused
        ? colors.accent
        : colors.border;

  const styles = StyleSheet.create({
    wrapper: {
      opacity: editable ? 1 : 0.5,
    },
    label: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansMed,
      color: colors.textMid,
      marginBottom: sp.xs,
    },
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBg,
      borderRadius: r.sm,
      borderWidth: 1,
      borderColor: borderColor,
      height: multiline === true ? undefined : 48,
      paddingHorizontal: sp.md,
    },
    iconLeft: {
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: sp.xs,
    },
    iconRight: {
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: sp.xs,
    },
    input: {
      flex: 1,
      ...typo.scale.body,
      fontFamily: typo.fonts.sans,
      color: colors.textHigh,
      paddingVertical: multiline === true ? sp.sm : 0,
    },
    error: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.error,
      marginTop: sp.xs,
    },
    hint: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textLow,
      marginTop: sp.xs,
    },
  });

  return (
    <View style={styles.wrapper}>
      {label !== undefined && (
        <Text style={styles.label}>{label}</Text>
      )}
      <View style={styles.container}>
        {leftIcon !== undefined && (
          <View style={styles.iconLeft}>{leftIcon}</View>
        )}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textLow}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          onFocus={handleFocus}
          onBlur={handleBlur}
          multiline={multiline}
          numberOfLines={numberOfLines}
          testID={testID}
        />
        {rightIcon !== undefined && (
          <View style={styles.iconRight}>{rightIcon}</View>
        )}
      </View>
      {error !== undefined && (
        <Text style={styles.error}>{error}</Text>
      )}
      {error === undefined && hint !== undefined && (
        <Text style={styles.hint}>{hint}</Text>
      )}
    </View>
  );
}

export const Input = memo(InputComponent);
