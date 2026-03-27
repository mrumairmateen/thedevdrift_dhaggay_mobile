import { IconSymbol } from '@/components/ui/icon-symbol';
import { CATEGORIES } from '@features/home/home.fixtures';
import { useTheme } from '@shared/theme';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

interface Props {
  onPress: (slug: string) => void;
}

export function CategoryRow({ onPress }: Props) {
  const { colors, sp, r, typo } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.container, { paddingHorizontal: sp.base, gap: sp.md }]}
    >
      {CATEGORIES.map((cat) => (
        <Pressable key={cat.slug} onPress={() => onPress(cat.slug)} style={styles.item}>
          {/* Icon circle */}
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: cat.bgColor,
                borderRadius: r.lg,
                width: 52,
                height: 52,
              },
            ]}
          >
            <IconSymbol name={cat.iconName as any} size={22} color={cat.color} />
          </View>
          {/* Label */}
          <Text
            style={[
              typo.scale.label,
              {
                fontFamily: typo.fonts.sansMed,
                color: colors.textMid,
                marginTop: sp.xs,
                textAlign: 'center',
              },
            ]}
          >
            {cat.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  item: {
    alignItems: 'center',
    width: 64,
  },
  iconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
