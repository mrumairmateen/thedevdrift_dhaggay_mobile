import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { IconSymbol } from '@shared/components/ui/icon-symbol';
import { useTheme } from '@shared/theme';

export interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

function ErrorBannerComponent({ message, onRetry }: ErrorBannerProps): React.JSX.Element {
  const { colors, typo, sp, r } = useTheme();

  const handleRetry = useCallback(() => {
    onRetry?.();
  }, [onRetry]);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.errorSubtle,
      borderRadius: r.sm,
      padding: sp.md,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: sp.sm,
    },
    iconWrapper: {
      alignItems: 'center',
      justifyContent: 'flex-start',
    },
    messageText: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sans,
      color: colors.error,
      flex: 1,
    },
    retryText: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.error,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <IconSymbol name="xmark" size={18} color={colors.error} />
      </View>
      <Text style={styles.messageText}>{message}</Text>
      {onRetry !== undefined && (
        <Pressable onPress={handleRetry}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      )}
    </View>
  );
}

export const ErrorBanner = memo(ErrorBannerComponent);
