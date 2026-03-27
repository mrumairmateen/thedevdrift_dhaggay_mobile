import React, { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { useTheme } from '@shared/theme';
import type { FabricCategory } from '@features/shop/shop.types';
import { FABRIC_CATEGORIES } from '@features/shop/shop.types';

export interface CategoryPillsProps {
  active: FabricCategory | null;
  onSelect: (cat: FabricCategory | null) => void;
}

interface PillItem {
  label: string;
  value: FabricCategory | null;
}

const ALL_PILL: PillItem = { label: 'All', value: null };

const CATEGORY_PILLS: PillItem[] = [
  ALL_PILL,
  ...FABRIC_CATEGORIES.map(
    (cat): PillItem => ({
      label: cat.charAt(0).toUpperCase() + cat.slice(1),
      value: cat,
    }),
  ),
];

export const CategoryPills = React.memo(function CategoryPills({
  active,
  onSelect,
}: CategoryPillsProps): React.JSX.Element {
  const { colors, sp, r, typo } = useTheme();

  const styles = StyleSheet.create({
    contentContainer: {
      paddingHorizontal: sp.base,
      gap: sp.sm,
      paddingVertical: sp.xs,
    },
    pill: {
      height: 34,
      borderRadius: r.pill,
      paddingHorizontal: sp.md,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pillActive: {
      backgroundColor: colors.accentSubtle,
      borderColor: colors.accent,
    },
    pillInactive: {
      backgroundColor: colors.chipBg,
      borderColor: colors.border,
    },
    pillTextActive: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansMed,
      color: colors.accent,
    },
    pillTextInactive: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansMed,
      color: colors.textMid,
    },
  });

  const handleSelect = useCallback(
    (value: FabricCategory | null) => {
      onSelect(value);
    },
    [onSelect],
  );

  return (
    <ScrollView
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      {CATEGORY_PILLS.map(pill => {
        const isActive = pill.value === active;
        return (
          <Pressable
            key={pill.label}
            style={[styles.pill, isActive ? styles.pillActive : styles.pillInactive]}
            onPress={() => handleSelect(pill.value)}
          >
            <Text style={isActive ? styles.pillTextActive : styles.pillTextInactive}>
              {pill.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
});
