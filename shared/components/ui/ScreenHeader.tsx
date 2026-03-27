import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@shared/components/ui/icon-symbol';
import { useTheme } from '@shared/theme';

export interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

function ScreenHeaderComponent({
  title,
  subtitle,
  onBack,
  rightAction,
  style,
}: ScreenHeaderProps): React.JSX.Element {
  const { colors, typo, sp } = useTheme();
  const insets = useSafeAreaInsets();

  const handleBack = useCallback(() => {
    onBack?.();
  }, [onBack]);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.navSolid,
      paddingTop: insets.top,
      paddingHorizontal: sp.base,
      paddingBottom: sp.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    innerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 44,
    },
    backButton: {
      marginRight: sp.sm,
      padding: sp.xs,
    },
    leftPlaceholder: {
      width: 40,
    },
    centerContent: {
      flex: 1,
      alignItems: 'center',
    },
    title: {
      ...typo.scale.title3,
      fontFamily: typo.fonts.serifBold,
      color: colors.textHigh,
    },
    subtitle: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
      marginTop: 2,
    },
    rightWrapper: {
      marginLeft: sp.sm,
    },
  });

  return (
    <View style={[styles.container, style]}>
      <View style={styles.innerRow}>
        {onBack !== undefined ? (
          <Pressable style={styles.backButton} onPress={handleBack}>
            <IconSymbol name="chevron.left" size={24} color={colors.textHigh} />
          </Pressable>
        ) : (
          <View style={styles.leftPlaceholder} />
        )}
        <View style={styles.centerContent}>
          <Text style={styles.title}>{title}</Text>
          {subtitle !== undefined && (
            <Text style={styles.subtitle}>{subtitle}</Text>
          )}
        </View>
        {rightAction !== undefined && (
          <View style={styles.rightWrapper}>{rightAction}</View>
        )}
      </View>
    </View>
  );
}

export const ScreenHeader = memo(ScreenHeaderComponent);
