import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@shared/theme';

export interface SectionHeaderProps {
  label: string;
  title: string;
  onSeeAll?: () => void;
}

export const SectionHeader = React.memo(function SectionHeader({
  label,
  title,
  onSeeAll,
}: SectionHeaderProps): React.JSX.Element {
  const { colors, sp, typo } = useTheme();

  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: sp.base,
      paddingBottom: sp.md,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    label: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansMed,
      color: colors.accent,
      marginBottom: sp.xs,
    },
    title: {
      ...typo.scale.title2,
      fontFamily: typo.fonts.serifBold,
      color: colors.textHigh,
      flex: 1,
    },
    seeAll: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansMed,
      color: colors.accent,
    },
  });

  const handleSeeAll = useCallback(() => {
    onSeeAll?.();
  }, [onSeeAll]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <Text style={styles.title}>{title}</Text>
        {onSeeAll !== undefined && (
          <Pressable onPress={handleSeeAll} hitSlop={8}>
            <Text style={styles.seeAll}>{'See All →'}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
});
