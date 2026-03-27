import { useTheme } from '@shared/theme';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  onDeleteAccount: () => void;
}

export function DangerZone({ onDeleteAccount }: Props) {
  const { colors, sp, r, typo } = useTheme();

  const handlePress = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete Account', style: 'destructive', onPress: onDeleteAccount },
      ]
    );
  };

  return (
    <View style={[styles.section, {
      borderColor: colors.errorSubtle,
      borderRadius: r.lg,
      padding: sp.base,
    }]}>
      <Text style={[typo.scale.bodySmall, { fontFamily: typo.fonts.serifBold, color: colors.textHigh, marginBottom: sp.xs }]}>
        Danger Zone
      </Text>
      <Text style={[typo.scale.caption, { fontFamily: typo.fonts.sans, color: colors.textLow, marginBottom: sp.base }]}>
        Once deleted, your account and all associated data cannot be recovered.
      </Text>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.btn,
          {
            borderColor: colors.error,
            borderRadius: r.md,
            paddingVertical: sp.md,
            opacity: pressed ? 0.75 : 1,
          },
        ]}
      >
        <Text style={[typo.scale.body, { fontFamily: typo.fonts.sansMed, color: colors.error }]}>
          Delete My Account
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { borderWidth: 1 },
  btn: { borderWidth: 1, alignItems: 'center' },
});
