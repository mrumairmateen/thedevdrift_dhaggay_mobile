import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@shared/theme';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  action?: { label: string; onPress: () => void };
}

function EmptyStateComponent({ icon, title, message, action }: EmptyStateProps): React.JSX.Element {
  const { colors, typo, sp, r } = useTheme();

  const handleActionPress = useCallback(() => {
    action?.onPress();
  }, [action]);

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: sp['2xl'],
    },
    iconArea: {
      width: 56,
      height: 56,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: sp.lg,
    },
    title: {
      ...typo.scale.title3,
      fontFamily: typo.fonts.serifBold,
      color: colors.textHigh,
      textAlign: 'center',
      marginBottom: sp.sm,
    },
    message: {
      ...typo.scale.body,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
      textAlign: 'center',
      marginBottom: sp.xl,
    },
    actionButton: {
      borderWidth: 1,
      borderColor: colors.accent,
      borderRadius: r.pill,
      paddingHorizontal: sp.xl,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionLabel: {
      ...typo.scale.body,
      fontFamily: typo.fonts.sansBold,
      color: colors.accent,
    },
  });

  return (
    <View style={styles.container}>
      {icon !== undefined && (
        <View style={styles.iconArea}>{icon}</View>
      )}
      <Text style={styles.title}>{title}</Text>
      {message !== undefined && (
        <Text style={styles.message}>{message}</Text>
      )}
      {action !== undefined && (
        <Pressable style={styles.actionButton} onPress={handleActionPress}>
          <Text style={styles.actionLabel}>{action.label}</Text>
        </Pressable>
      )}
    </View>
  );
}

export const EmptyState = memo(EmptyStateComponent);
