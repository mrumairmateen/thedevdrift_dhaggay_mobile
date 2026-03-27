import React, { useCallback } from 'react';
import { FlatList, ListRenderItem, Pressable, StyleSheet, Text, View } from 'react-native';

import { IconSymbol, IconSymbolName } from '@shared/components/ui/icon-symbol';
import { useTheme } from '@shared/theme';

export interface CategoryRowProps {
  onPress: (slug: string) => void;
}

interface CategoryItem {
  slug: string;
  label: string;
  icon: IconSymbolName;
}

const CATEGORIES: CategoryItem[] = [
  { slug: 'lawn',    label: 'Lawn',    icon: 'leaf.fill' },
  { slug: 'silk',    label: 'Silk',    icon: 'sparkles' },
  { slug: 'cotton',  label: 'Cotton',  icon: 'wind' },
  { slug: 'chiffon', label: 'Chiffon', icon: 'cloud.fill' },
  { slug: 'bridal',  label: 'Bridal',  icon: 'star.fill' },
  { slug: 'linen',   label: 'Linen',   icon: 'moon.fill' },
  { slug: 'velvet',  label: 'Velvet',  icon: 'snowflake' },
  { slug: 'karandi', label: 'Karandi', icon: 'square.grid.2x2.fill' },
];

const ITEM_WIDTH = 72;

function getItemLayout(
  _: ArrayLike<CategoryItem> | null | undefined,
  index: number,
): { length: number; offset: number; index: number } {
  return { length: ITEM_WIDTH, offset: ITEM_WIDTH * index, index };
}

export const CategoryRow = React.memo(function CategoryRow({
  onPress,
}: CategoryRowProps): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();

  const styles = StyleSheet.create({
    contentContainer: {
      paddingHorizontal: sp.base,
      gap: sp.sm,
    },
    item: {
      width: ITEM_WIDTH,
      alignItems: 'center',
    },
    iconCircle: {
      width: 56,
      height: 56,
      borderRadius: r.xl,
      backgroundColor: colors.elevated,
      alignItems: 'center',
      justifyContent: 'center',
      ...elev.low,
    },
    label: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sansMed,
      color: colors.textMid,
      textAlign: 'center',
      marginTop: sp.xs,
    },
  });

  const handlePress = useCallback(
    (slug: string) => {
      onPress(slug);
    },
    [onPress],
  );

  const renderItem = useCallback<ListRenderItem<CategoryItem>>(
    ({ item }) => (
      <Pressable style={styles.item} onPress={() => handlePress(item.slug)}>
        <View style={styles.iconCircle}>
          <IconSymbol name={item.icon} size={22} color={colors.accent} />
        </View>
        <Text style={styles.label}>{item.label}</Text>
      </Pressable>
    ),
    [styles, colors.accent, handlePress],
  );

  const keyExtractor = useCallback((item: CategoryItem) => item.slug, []);

  return (
    <FlatList
      data={CATEGORIES}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
      getItemLayout={getItemLayout}
      removeClippedSubviews={true}
    />
  );
});
