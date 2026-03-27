import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@shared/theme';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  title: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
}

export function DashboardHeader({ title, showBack = true, rightElement }: Props) {
  const { colors, sp, typo, elev } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View
      style={[
        styles.container,
        elev.high,
        {
          backgroundColor: colors.navSolid,
          paddingTop: insets.top + sp.sm,
          paddingHorizontal: sp.base,
          paddingBottom: sp.md,
          borderBottomColor: colors.border,
        },
      ]}
    >
      {showBack ? (
        <Pressable onPress={() => router.back()} style={styles.side} hitSlop={8}>
          <IconSymbol name="chevron.left" size={20} color={colors.textHigh} />
          <Text style={[typo.scale.bodySmall, { fontFamily: typo.fonts.sansMed, color: colors.textMid }]}>
            Back
          </Text>
        </Pressable>
      ) : (
        <View style={styles.side} />
      )}

      <Text style={[typo.scale.title3, { fontFamily: typo.fonts.serifBold, color: colors.textHigh }]}>
        {title}
      </Text>

      <View style={[styles.side, { alignItems: 'flex-end' }]}>
        {rightElement ?? null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  side: { flexDirection: 'row', alignItems: 'center', gap: 4, width: 72 },
});
