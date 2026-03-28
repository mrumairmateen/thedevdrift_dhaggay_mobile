/**
 * Elite custom tab bar used by every role dashboard.
 *
 * Visual pattern:
 *   Inactive → icon only, textLow colour
 *   Active   → icon inside accentSubtle pill (no text in pill) + label below
 *
 * Separating the label from inside the pill allows all 5 tabs to sit
 * comfortably side-by-side without the active pill squeezing out its siblings.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { useTheme } from '@shared/theme';

export function DashboardTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();
  const insets = useSafeAreaInsets();

  const styles = StyleSheet.create({
    bar: {
      flexDirection: 'row',
      backgroundColor: colors.navSolid,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingHorizontal: sp.sm,
      paddingTop: sp.sm,
      paddingBottom: Math.max(insets.bottom, sp.sm),
      ...elev.high,
    },
    item: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 52,
    },
    // Active: icon wrapped in a compact pill (no label inside)
    activeWrap: {
      alignItems: 'center',
      gap: sp.xs,
    },
    pill: {
      backgroundColor: colors.accentSubtle,
      paddingHorizontal: sp.md,
      paddingVertical: sp.xs,
      borderRadius: r.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    activeLabel: {
      fontSize: 10,
      fontFamily: typo.fonts.sansBold,
      color: colors.accent,
      letterSpacing: 0.3,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.bar}>
      {state.routes.map((route, index) => {
        const descriptor = descriptors[route.key];
        if (descriptor === undefined) return null;
        const { options } = descriptor;

        // Skip tabs with no icon — Expo Router converts `href={null}` to
        // `tabBarItemStyle: { display: 'none' }` and strips `href` from options,
        // so checking `options.href === null` never matches.
        if (!options.tabBarIcon) return null;

        const isFocused = state.index === index;

        const label =
          typeof options.tabBarLabel === 'string'
            ? options.tabBarLabel
            : typeof options.title === 'string'
            ? options.title
            : route.name;

        const handlePress = (): void => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name as never);
          }
        };

        const handleLongPress = (): void => {
          navigation.emit({ type: 'tabLongPress', target: route.key });
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={{ selected: isFocused }}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={handlePress}
            onLongPress={handleLongPress}
            style={styles.item}
          >
            {isFocused ? (
              <View style={styles.activeWrap}>
                <View style={styles.pill}>
                  {options.tabBarIcon?.({ focused: true, color: colors.accent, size: 20 }) ?? null}
                </View>
                <Text style={styles.activeLabel} numberOfLines={1}>
                  {label}
                </Text>
              </View>
            ) : (
              options.tabBarIcon?.({ focused: false, color: colors.textLow, size: 22 }) ?? null
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
