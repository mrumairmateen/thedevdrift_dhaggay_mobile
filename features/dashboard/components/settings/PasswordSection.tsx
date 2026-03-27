import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@shared/theme';
import { useChangePasswordMutation } from '@services/userApi';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export function PasswordSection() {
  const { colors, sp, r, typo, elev } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const handleChange = async () => {
    if (next.length < 8) {
      Alert.alert('Too short', 'New password must be at least 8 characters.');
      return;
    }
    if (next !== confirm) {
      Alert.alert('Mismatch', 'Passwords do not match.');
      return;
    }
    try {
      await changePassword({ currentPassword: current, newPassword: next }).unwrap();
      Alert.alert('Done', 'Password updated successfully.');
      setCurrent(''); setNext(''); setConfirm('');
      setExpanded(false);
    } catch {
      Alert.alert('Error', 'Could not update password. Check your current password and try again.');
    }
  };

  return (
    <View style={[styles.section, elev.low, {
      backgroundColor: colors.elevated,
      borderColor: colors.border,
      borderRadius: r.lg,
      overflow: 'hidden',
    }]}>
      <Pressable
        onPress={() => setExpanded((e) => !e)}
        style={[styles.header, { padding: sp.base }]}
      >
        <Text style={[typo.scale.body, { fontFamily: typo.fonts.serifBold, color: colors.textHigh }]}>
          Change Password
        </Text>
        <IconSymbol name={expanded ? 'chevron.up' : 'chevron.down'} size={16} color={colors.textLow} />
      </Pressable>

      {expanded && (
        <View style={[styles.form, { padding: sp.base, paddingTop: 0 }]}>
          {[
            { label: 'Current Password', value: current, setter: setCurrent },
            { label: 'New Password', value: next, setter: setNext },
            { label: 'Confirm New Password', value: confirm, setter: setConfirm },
          ].map((field) => (
            <View key={field.label} style={{ marginBottom: sp.md }}>
              <Text style={[typo.scale.label, {
                fontFamily: typo.fonts.sansMed,
                color: colors.textLow,
                textTransform: 'uppercase',
                letterSpacing: 0.8,
                marginBottom: sp.xs,
              }]}>
                {field.label}
              </Text>
              <TextInput
                value={field.value}
                onChangeText={field.setter}
                secureTextEntry
                style={[styles.input, {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.border,
                  borderRadius: r.sm,
                  color: colors.textHigh,
                  fontFamily: typo.fonts.sans,
                  fontSize: 16,
                  paddingHorizontal: sp.base,
                  paddingVertical: sp.md,
                }]}
                placeholderTextColor={colors.textLow}
                placeholder="••••••••"
              />
            </View>
          ))}

          <Pressable
            onPress={handleChange}
            disabled={isLoading}
            style={({ pressed }) => [{
              backgroundColor: colors.accent,
              borderRadius: r.md,
              paddingVertical: sp.md,
              alignItems: 'center',
              opacity: pressed || isLoading ? 0.7 : 1,
            }]}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.textOnAccent} />
            ) : (
              <Text style={[typo.scale.body, { fontFamily: typo.fonts.sansBold, color: colors.textOnAccent }]}>
                Update Password
              </Text>
            )}
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { borderWidth: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  form: {},
  input: { borderWidth: 1 },
});
