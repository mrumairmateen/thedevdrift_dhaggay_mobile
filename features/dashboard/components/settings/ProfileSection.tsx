import { useTheme } from '@shared/theme';
import { useUpdateProfileMutation } from '@services/userApi';
import type { UserProfile } from '@features/dashboard/dashboard.types';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

interface Props {
  profile: UserProfile;
}

export function ProfileSection({ profile }: Props) {
  const { colors, sp, r, typo, elev } = useTheme();
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email ?? '');
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const initials = (profile.name ?? '')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase() || '?';

  const handleSave = async () => {
    try {
      await updateProfile({ name: name.trim(), email: email.trim() || undefined }).unwrap();
      Alert.alert('Saved', 'Profile updated successfully.');
    } catch {
      Alert.alert('Error', 'Could not update profile. Please try again.');
    }
  };

  return (
    <View style={[styles.section, elev.low, {
      backgroundColor: colors.elevated,
      borderColor: colors.border,
      borderRadius: r.lg,
      padding: sp.base,
    }]}>
      {/* Avatar */}
      <View style={[styles.avatarRow, { marginBottom: sp.base }]}>
        <View style={[styles.avatar, {
          backgroundColor: colors.accentSubtle,
          borderRadius: r.pill,
          width: 72,
          height: 72,
        }]}>
          <Text style={[typo.scale.title2, { fontFamily: typo.fonts.serifBold, color: colors.accent }]}>
            {initials}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[typo.scale.body, { fontFamily: typo.fonts.serifBold, color: colors.textHigh }]}>
            {profile.name}
          </Text>
          <Text style={[typo.scale.bodySmall, { fontFamily: typo.fonts.sans, color: colors.textLow }]}>
            {profile.phone}
          </Text>
        </View>
      </View>

      {/* Name field */}
      <FieldLabel label="Full Name" />
      <TextInput
        value={name}
        onChangeText={setName}
        style={[styles.input, {
          backgroundColor: colors.inputBg,
          borderColor: colors.border,
          borderRadius: r.sm,
          color: colors.textHigh,
          fontFamily: typo.fonts.sans,
          fontSize: 16,
          paddingHorizontal: sp.base,
          paddingVertical: sp.md,
          marginBottom: sp.md,
        }]}
        placeholderTextColor={colors.textLow}
        placeholder="Full name"
      />

      {/* Email field */}
      <FieldLabel label="Email (optional)" />
      <TextInput
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={[styles.input, {
          backgroundColor: colors.inputBg,
          borderColor: colors.border,
          borderRadius: r.sm,
          color: colors.textHigh,
          fontFamily: typo.fonts.sans,
          fontSize: 16,
          paddingHorizontal: sp.base,
          paddingVertical: sp.md,
          marginBottom: sp.base,
        }]}
        placeholderTextColor={colors.textLow}
        placeholder="email@example.com"
      />

      {/* Phone (read-only) */}
      <FieldLabel label="Phone" />
      <View style={[styles.input, {
        backgroundColor: colors.panel,
        borderColor: colors.border,
        borderRadius: r.sm,
        paddingHorizontal: sp.base,
        paddingVertical: sp.md,
        marginBottom: sp.base,
      }]}>
        <Text style={[typo.scale.body, { fontFamily: typo.fonts.sans, color: colors.textLow }]}>
          {profile.phone}
        </Text>
      </View>

      {/* Save button */}
      <Pressable
        onPress={handleSave}
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
            Save Changes
          </Text>
        )}
      </Pressable>
    </View>
  );
}

function FieldLabel({ label }: { label: string }) {
  const { colors, sp, typo } = useTheme();
  return (
    <Text style={[typo.scale.label, {
      fontFamily: typo.fonts.sansMed,
      color: colors.textLow,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: sp.xs,
    }]}>
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  section: { borderWidth: 1 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: { alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  input: { borderWidth: 1 },
});
