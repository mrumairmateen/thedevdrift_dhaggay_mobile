import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '@shared/theme';

export interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  padding?: 'none' | 'sm' | 'md' | 'base' | 'lg' | 'xl';
  elevation?: 'none' | 'low' | 'mid';
}

export const Card = memo(function Card({
  children,
  onPress,
  style,
  padding = 'base',
  elevation = 'low',
}: CardProps): React.JSX.Element {
  const { colors, sp, r, elev } = useTheme();

  const paddingMap: Record<CardProps['padding'] & string, number> = {
    none: 0,
    sm: sp.sm,
    md: sp.md,
    base: sp.base,
    lg: sp.lg,
    xl: sp.xl,
  };

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.elevated,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: r.md,
      padding: paddingMap[padding],
      ...elev[elevation],
    },
  });

  const handlePress = useCallback(() => {
    onPress?.();
  }, [onPress]);

  if (onPress) {
    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }, style]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
});
