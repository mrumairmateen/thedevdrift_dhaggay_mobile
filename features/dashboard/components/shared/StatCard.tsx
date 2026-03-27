import { useTheme } from '@shared/theme';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  value: number | string;
  label: string;
}

export function StatCard({ value, label }: Props) {
  const { colors, sp, r, typo, elev } = useTheme();

  return (
    <View
      style={[
        styles.card,
        elev.low,
        {
          backgroundColor: colors.elevated,
          borderColor: colors.border,
          borderRadius: r.lg,
          padding: sp.base,
        },
      ]}
    >
      <Text style={[typo.scale.hero, { fontFamily: typo.fonts.display, color: colors.accent }]}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </Text>
      <Text
        style={[
          typo.scale.label,
          {
            fontFamily: typo.fonts.sansMed,
            color: colors.textLow,
            textTransform: 'uppercase',
            marginTop: sp.xs,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    minHeight: 88,
    justifyContent: 'flex-end',
  },
});
