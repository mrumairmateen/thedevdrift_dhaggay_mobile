import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@shared/theme';

export interface DividerProps {
  label?: string;
  spacing?: number;
}

export const Divider = memo(function Divider({
  label,
  spacing,
}: DividerProps): React.JSX.Element {
  const { colors, sp, typo } = useTheme();

  const resolvedSpacing = spacing !== undefined ? spacing : sp.xl;

  const styles = StyleSheet.create({
    line: {
      height: 1,
      backgroundColor: colors.border,
    },
    plainContainer: {
      marginVertical: resolvedSpacing,
    },
    labelContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: resolvedSpacing,
    },
    labelLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    labelText: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textLow,
      paddingHorizontal: sp.md,
    },
  });

  if (label !== undefined) {
    return (
      <View style={styles.labelContainer}>
        <View style={styles.labelLine} />
        <Text style={styles.labelText}>{label}</Text>
        <View style={styles.labelLine} />
      </View>
    );
  }

  return (
    <View style={styles.plainContainer}>
      <View style={styles.line} />
    </View>
  );
});
