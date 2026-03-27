import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@shared/theme';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

interface Action {
  icon: string;
  label: string;
  onPress: () => void;
}

interface Props {
  actions: Action[];
}

export function QuickActions({ actions }: Props) {
  const { colors, sp, r, typo } = useTheme();

  return (
    <View style={[styles.grid, { gap: sp.sm }]}>
      {actions.map((action) => (
        <Pressable
          key={action.label}
          onPress={action.onPress}
          style={({ pressed }) => [
            styles.btn,
            {
              backgroundColor: colors.accentSubtle,
              borderColor: colors.accentMid,
              borderRadius: r.md,
              padding: sp.md,
              opacity: pressed ? 0.75 : 1,
            },
          ]}
        >
          <IconSymbol name={action.icon as any} size={22} color={colors.accent} />
          <Text
            style={[
              typo.scale.caption,
              {
                fontFamily: typo.fonts.sansMed,
                color: colors.accent,
                marginTop: sp.xs,
                textAlign: 'center',
              },
            ]}
          >
            {action.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  btn: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    minHeight: 72,
  },
});
