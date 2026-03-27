import { useTheme } from '@shared/theme';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function SectionCard({ children, style }: Props) {
  const { colors, sp, r, elev } = useTheme();

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
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1 },
});
