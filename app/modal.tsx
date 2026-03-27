import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@shared/theme';

export default function ModalScreen(): React.JSX.Element {
  const { colors, typo, sp } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      padding: sp.base,
    },
    title: {
      ...typo.scale.title3,
      fontFamily: typo.fonts.serifBold,
      color: colors.textHigh,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modal</Text>
    </View>
  );
}
