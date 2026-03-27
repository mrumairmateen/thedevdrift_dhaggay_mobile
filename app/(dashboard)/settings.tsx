import { AddressList } from '@features/dashboard/components/settings/AddressList';
import { DangerZone } from '@features/dashboard/components/settings/DangerZone';
import { NotificationToggles } from '@features/dashboard/components/settings/NotificationToggles';
import { PasswordSection } from '@features/dashboard/components/settings/PasswordSection';
import { ProfileSection } from '@features/dashboard/components/settings/ProfileSection';
import { DashboardHeader } from '@features/dashboard/components/shared/DashboardHeader';
import { useTheme } from '@shared/theme';
import { useGetMeQuery } from '@services/userApi';
import { clearCredentials } from '@store/authSlice';
import { useAppDispatch } from '@store/index';
import { clearAuthTokens } from '@store/secureAuth';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function SettingsScreen() {
  const { colors, sp, r, typo } = useTheme();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { data: profile, isLoading } = useGetMeQuery();

  const handleSignOut = async () => {
    dispatch(clearCredentials());
    await clearAuthTokens();
    router.replace('/(tabs)' as any);
  };

  const handleDeleteAccount = async () => {
    // Placeholder — endpoint not yet defined in the API spec
    // When backend is ready: call DELETE /users/me, then clearCredentials
    dispatch(clearCredentials());
    await clearAuthTokens();
    router.replace('/(tabs)' as any);
  };

  const signOutButton = (
    <Pressable onPress={handleSignOut} hitSlop={8}>
      <Text
        style={[
          typo.scale.bodySmall,
          { fontFamily: typo.fonts.sansMed, color: colors.error },
        ]}
      >
        Sign Out
      </Text>
    </Pressable>
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <DashboardHeader title="Account" rightElement={signOutButton} />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : !profile ? (
        <View style={styles.center}>
          <Text style={[typo.scale.body, { fontFamily: typo.fonts.sans, color: colors.textMid }]}>
            Could not load profile.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: sp.base, paddingBottom: sp['4xl'], gap: sp.xl }}
        >
          {/* Profile */}
          <Section label="Profile">
            <ProfileSection profile={profile} />
          </Section>

          {/* Password */}
          <Section label="Security">
            <PasswordSection />
          </Section>

          {/* Notifications */}
          <Section label="Notifications">
            <NotificationToggles prefs={profile.notifications} />
          </Section>

          {/* Addresses */}
          <Section label="Saved Addresses">
            <AddressList addresses={profile.addresses} />
          </Section>

          {/* Danger zone */}
          <DangerZone onDeleteAccount={handleDeleteAccount} />
        </ScrollView>
      )}
    </View>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  const { colors, sp, typo } = useTheme();
  return (
    <View>
      <Text
        style={[
          typo.scale.label,
          {
            fontFamily: typo.fonts.sansMed,
            color: colors.textLow,
            textTransform: 'uppercase',
            letterSpacing: 1,
            marginBottom: sp.sm,
          },
        ]}
      >
        {label}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
