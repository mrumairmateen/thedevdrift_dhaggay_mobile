import { useTheme } from '@shared/theme';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AccountScreen() {
  const { colors, sp, typo } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top + sp.base, paddingHorizontal: sp.base }}>
      <Text style={[typo.scale.title2, { fontFamily: typo.fonts.serifBold, color: colors.textHigh }]}>
        Account
      </Text>
      <Text style={[typo.scale.body, { fontFamily: typo.fonts.sans, color: colors.textMid, marginTop: sp.sm }]}>
        Sign in to access your account.
      </Text>
    </View>
  );
}
