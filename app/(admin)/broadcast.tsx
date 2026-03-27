import React, { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { useBroadcastNotificationMutation } from '@services/adminApi';
import { useTheme } from '@shared/theme';
import {
  ErrorBanner,
  ScreenHeader,
} from '@shared/components/ui';
import { IconSymbol } from '@shared/components/ui/icon-symbol';

// ─── Target Role Config ───────────────────────────────────────────────────────

type TargetRole = 'all' | 'customer' | 'seller' | 'tailor' | 'delivery';

const TARGET_ROLES: Array<{ label: string; value: TargetRole }> = [
  { label: 'All',      value: 'all'      },
  { label: 'Customers', value: 'customer' },
  { label: 'Sellers',  value: 'seller'   },
  { label: 'Tailors',  value: 'tailor'   },
  { label: 'Delivery', value: 'delivery' },
];

const TITLE_MAX = 200;
const BODY_MAX = 500;

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AdminBroadcastScreen(): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();
  const router = useRouter();

  const [broadcastNotification, { isLoading }] = useBroadcastNotificationMutation();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetRole, setTargetRole] = useState<TargetRole>('all');
  const [sentCount, setSentCount] = useState<number | null>(null);
  const [error, setError] = useState('');

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleSend = useCallback(() => {
    const trimTitle = title.trim();
    const trimBody = body.trim();
    if (trimTitle.length === 0 || trimBody.length === 0) {
      setError('Title and message are required.');
      return;
    }
    setError('');
    setSentCount(null);
    void broadcastNotification({ title: trimTitle, body: trimBody, targetRole }).then(
      (result) => {
        if ('data' in result && result.data !== undefined) {
          setSentCount(result.data.sent);
          setTitle('');
          setBody('');
          setTargetRole('all');
        }
      },
    );
  }, [broadcastNotification, title, body, targetRole]);

  const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg },
    scroll: { flex: 1 },
    content: { padding: sp.base, gap: sp.lg, paddingBottom: sp['4xl'] },
    card: {
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      padding: sp.md,
      borderWidth: 1,
      borderColor: colors.border,
      gap: sp.md,
      ...elev.low,
    },
    infoCard: {
      backgroundColor: colors.accentSubtle,
      borderRadius: r.md,
      padding: sp.md,
      borderWidth: 1,
      borderColor: colors.accentMid,
      flexDirection: 'row',
      gap: sp.sm,
      alignItems: 'flex-start',
    },
    infoText: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.accent,
      flex: 1,
    },
    fieldLabel: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sansMed,
      color: colors.textMid,
      marginBottom: sp.xs,
    },
    input: {
      backgroundColor: colors.inputBg,
      borderRadius: r.sm,
      borderWidth: 1,
      borderColor: colors.border,
      padding: sp.sm,
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sans,
      color: colors.textHigh,
    },
    multilineInput: {
      backgroundColor: colors.inputBg,
      borderRadius: r.sm,
      borderWidth: 1,
      borderColor: colors.border,
      padding: sp.sm,
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sans,
      color: colors.textHigh,
      minHeight: 100,
      textAlignVertical: 'top',
    },
    charCounter: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      textAlign: 'right',
      marginTop: sp.xs,
    },
    pillRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: sp.sm,
    },
    pill: {
      paddingVertical: sp.sm,
      paddingHorizontal: sp.md,
      borderRadius: r.pill,
      borderWidth: 1,
    },
    pillLabel: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansMed,
    },
    errorText: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.error,
    },
    sendBtn: {
      borderRadius: r.sm,
      paddingVertical: sp.md,
      alignItems: 'center',
    },
    sendBtnLabel: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
    },
    successBanner: {
      backgroundColor: colors.successSubtle,
      borderRadius: r.md,
      padding: sp.md,
      borderWidth: 1,
      borderColor: colors.success,
      flexDirection: 'row',
      gap: sp.sm,
      alignItems: 'center',
    },
    successText: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.success,
      flex: 1,
    },
  });

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Broadcast" onBack={handleBack} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info card */}
        <View style={styles.infoCard}>
          <IconSymbol name="info.circle.fill" size={18} color={colors.accent} />
          <Text style={styles.infoText}>
            Broadcasts are delivered via push notifications and in-app. Ensure messages are clear and relevant.
          </Text>
        </View>

        {/* Success state */}
        {sentCount !== null && (
          <View style={styles.successBanner}>
            <IconSymbol name="checkmark.circle.fill" size={20} color={colors.success} />
            <Text style={styles.successText}>
              Notification sent to {sentCount} users.
            </Text>
          </View>
        )}

        {/* Compose form */}
        <View style={styles.card}>
          {/* Title */}
          <View>
            <Text style={styles.fieldLabel}>Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={(t) => setTitle(t.slice(0, TITLE_MAX))}
              placeholder="e.g. Eid Mubarak from Dhaggay!"
              placeholderTextColor={colors.textLow}
              maxLength={TITLE_MAX}
            />
            <Text
              style={[
                styles.charCounter,
                { color: title.length > TITLE_MAX - 20 ? colors.warning : colors.textLow },
              ]}
            >
              {title.length}/{TITLE_MAX}
            </Text>
          </View>

          {/* Message */}
          <View>
            <Text style={styles.fieldLabel}>Message *</Text>
            <TextInput
              style={styles.multilineInput}
              value={body}
              onChangeText={(t) => setBody(t.slice(0, BODY_MAX))}
              placeholder="Your message here..."
              placeholderTextColor={colors.textLow}
              multiline
              numberOfLines={4}
              maxLength={BODY_MAX}
            />
            <Text
              style={[
                styles.charCounter,
                { color: body.length > BODY_MAX - 50 ? colors.warning : colors.textLow },
              ]}
            >
              {body.length}/{BODY_MAX}
            </Text>
          </View>

          {/* Target Role */}
          <View>
            <Text style={styles.fieldLabel}>Target Role</Text>
            <View style={styles.pillRow}>
              {TARGET_ROLES.map((role) => {
                const isActive = targetRole === role.value;
                return (
                  <Pressable
                    key={role.value}
                    style={[
                      styles.pill,
                      {
                        backgroundColor: isActive ? colors.accentSubtle : colors.chipBg,
                        borderColor: isActive ? colors.accent : colors.border,
                      },
                    ]}
                    onPress={() => setTargetRole(role.value)}
                  >
                    <Text
                      style={[
                        styles.pillLabel,
                        { color: isActive ? colors.accent : colors.textMid },
                      ]}
                    >
                      {role.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Error */}
          {error.length > 0 && <Text style={styles.errorText}>{error}</Text>}

          {/* Error banner from mutation */}
          {isLoading === false && sentCount === null && error.length > 0 && (
            <ErrorBanner message={error} />
          )}

          {/* Send button */}
          <Pressable
            style={[
              styles.sendBtn,
              {
                backgroundColor: isLoading ? colors.panel : colors.accent,
                opacity: isLoading ? 0.6 : 1,
              },
            ]}
            onPress={handleSend}
            disabled={isLoading}
          >
            <Text
              style={[
                styles.sendBtnLabel,
                { color: isLoading ? colors.textLow : colors.textOnAccent },
              ]}
            >
              {isLoading ? 'Sending...' : 'Send Broadcast'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
