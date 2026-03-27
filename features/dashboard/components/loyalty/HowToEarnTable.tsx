import type { EarnRule } from '@features/dashboard/dashboard.types';
import { useTheme } from '@shared/theme';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  rules: EarnRule[];
}

export function HowToEarnTable({ rules }: Props) {
  const { colors, sp, r, typo, elev } = useTheme();

  return (
    <View
      style={[
        styles.card,
        elev.low,
        { backgroundColor: colors.elevated, borderColor: colors.border, borderRadius: r.lg },
      ]}
    >
      {rules.map((rule, idx) => (
        <View
          key={rule.action}
          style={[
            styles.row,
            {
              borderBottomWidth: idx < rules.length - 1 ? StyleSheet.hairlineWidth : 0,
              borderBottomColor: colors.border,
              paddingHorizontal: sp.base,
              paddingVertical: sp.md,
            },
          ]}
        >
          <Text
            style={[typo.scale.body, { fontFamily: typo.fonts.serifBold, color: colors.textHigh, flex: 1 }]}
          >
            {rule.description}
          </Text>
          <Text
            style={[
              typo.scale.bodySmall,
              { fontFamily: typo.fonts.sansBold, color: colors.accent },
            ]}
          >
            +{rule.points} pts
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
