import React from 'react';
import { useTheme } from '@shared/theme';
import { useUpdateNotificationPrefsMutation } from '@services/userApi';
import type { NotificationPrefs } from '@features/dashboard/dashboard.types';
import { StyleSheet, Switch, Text, View } from 'react-native';

interface Props {
  prefs: NotificationPrefs;
}

export function NotificationToggles({ prefs }: Props): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();
  const [updateNotifications] = useUpdateNotificationPrefsMutation();

  const toggles: { key: keyof NotificationPrefs; label: string; description: string }[] = [
    { key: 'push', label: 'Push Notifications', description: 'Order updates and alerts on your device' },
    { key: 'whatsapp', label: 'WhatsApp', description: 'Order status updates via WhatsApp' },
    { key: 'email', label: 'Email', description: 'Receipts, invoices and news via email' },
  ];

  const handleToggle = (key: keyof NotificationPrefs, value: boolean): void => {
    updateNotifications({ [key]: value });
  };

  const styles = StyleSheet.create({
    section: { borderWidth: 1 },
    row: { flexDirection: 'row', alignItems: 'center', gap: sp.md },
  });

  return (
    <View style={[styles.section, elev.low, {
      backgroundColor: colors.elevated,
      borderColor: colors.border,
      borderRadius: r.lg,
      overflow: 'hidden',
    }]}>
      {toggles.map((item, idx) => {
        const value = prefs[item.key] ?? false;
        return (
          <View
            key={item.key}
            style={[
              styles.row,
              {
                paddingHorizontal: sp.base,
                paddingVertical: sp.md,
                borderBottomWidth: idx < toggles.length - 1 ? StyleSheet.hairlineWidth : 0,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[typo.scale.body, { fontFamily: typo.fonts.sansMed, color: colors.textHigh }]}>
                {item.label}
              </Text>
              <Text style={[typo.scale.caption, { fontFamily: typo.fonts.sans, color: colors.textLow }]}>
                {item.description}
              </Text>
            </View>
            <Switch
              value={value}
              onValueChange={(val) => handleToggle(item.key, val)}
              trackColor={{ false: colors.panel, true: colors.accentMid }}
              thumbColor={value ? colors.accent : colors.textLow}
            />
          </View>
        );
      })}
    </View>
  );
}
