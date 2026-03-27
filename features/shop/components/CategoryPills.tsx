import React, { useRef } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useTheme } from '@shared/theme';
import type { FabricCategory } from '../shop.types';
import { FABRIC_CATEGORIES } from '../shop.types';

const CATEGORY_LABELS: Record<FabricCategory, string> = {
  lawn: 'Lawn',
  silk: 'Silk',
  cotton: 'Cotton',
  chiffon: 'Chiffon',
  bridal: 'Bridal',
  linen: 'Linen',
  velvet: 'Velvet',
  organza: 'Organza',
  karandi: 'Karandi',
  khaddar: 'Khaddar',
};

interface Props {
  active: FabricCategory | null;
  onSelect: (category: FabricCategory | null) => void;
}

export function CategoryPills({ active, onSelect }: Props) {
  const { colors, sp, r, typo } = useTheme();
  const scrollRef = useRef<ScrollView>(null);

  const pills: Array<{ label: string; value: FabricCategory | null }> = [
    { label: 'All', value: null },
    ...FABRIC_CATEGORIES.map(c => ({ label: CATEGORY_LABELS[c], value: c })),
  ];

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.container, { paddingHorizontal: sp.base, gap: sp.sm }]}
    >
      {pills.map(pill => {
        const isActive = pill.value === active;
        return (
          <Pressable
            key={pill.label}
            onPress={() => onSelect(pill.value)}
            style={[
              styles.pill,
              {
                backgroundColor: isActive ? colors.accent : colors.chipBg,
                borderRadius: r.pill,
                paddingHorizontal: sp.md,
                paddingVertical: sp.xs + 2,
              },
            ]}
          >
            <Text
              style={[
                typo.scale.label,
                {
                  fontFamily: typo.fonts.sansMed,
                  color: isActive ? colors.textOnAccent : colors.textMid,
                },
              ]}
            >
              {pill.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  pill: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
