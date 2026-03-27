import { useTheme } from '@shared/theme';
import { StyleSheet, Text, View } from 'react-native';

interface EarnRule {
  action: string;
  points: number;
  description: string;
}

interface Props {
  rules: EarnRule[];
}

export function HowToEarnTable({ rules }: Props): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();

  const styles = StyleSheet.create({
    card: {
      borderWidth: 1,
      overflow: 'hidden',
      backgroundColor: colors.elevated,
      borderColor: colors.border,
      borderRadius: r.lg,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    label: {
      ...typo.scale.body,
      fontFamily: typo.fonts.serifBold,
      color: colors.textHigh,
      flex: 1,
    },
    pts: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.accent,
    },
  });

  return (
    <View style={[styles.card, elev.low]}>
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
          <Text style={styles.label}>{rule.description}</Text>
          <Text style={styles.pts}>+{rule.points} pts</Text>
        </View>
      ))}
    </View>
  );
}
