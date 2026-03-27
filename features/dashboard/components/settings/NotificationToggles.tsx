import { useTheme } from '@shared/theme';
import { useUpdateNotificationsMutation } from '@services/userApi';
import type { NotificationPrefs } from '@features/dashboard/dashboard.types';
import { StyleSheet, Switch, Text, View } from 'react-native';

interface Props {
  prefs: NotificationPrefs;
}

export function NotificationToggles({ prefs }: Props) {
  const { colors, sp, r, typo, elev } = useTheme();
  const [updateNotifications] = useUpdateNotificationsMutation();

  const toggles: { key: keyof NotificationPrefs; label: string; description: string }[] = [
    { key: 'orderUpdates', label: 'Order Updates', description: 'Status changes for your orders' },
    { key: 'promotions', label: 'Promotions & Offers', description: 'Sales, discounts, and new arrivals' },
    { key: 'wishlistAlerts', label: 'Wishlist Price Alerts', description: 'When saved items go on sale' },
  ];

  const handleToggle = (key: keyof NotificationPrefs, value: boolean) => {
    updateNotifications({ [key]: value });
  };

  return (
    <View style={[styles.section, elev.low, {
      backgroundColor: colors.elevated,
      borderColor: colors.border,
      borderRadius: r.lg,
      overflow: 'hidden',
    }]}>
      {toggles.map((item, idx) => (
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
            value={prefs[item.key]}
            onValueChange={(val) => handleToggle(item.key, val)}
            trackColor={{ false: colors.panel, true: colors.accentMid }}
            thumbColor={prefs[item.key] ? colors.accent : colors.textLow}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { borderWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
