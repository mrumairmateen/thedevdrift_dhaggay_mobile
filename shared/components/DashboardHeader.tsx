/**
 * Generic dashboard header used by all role dashboards.
 *
 * Layout:  [☰ Hamburger]  [Title / Subtitle]  [Avatar]
 *
 * The hamburger opens the role-specific SideDrawer.
 * The avatar navigates to the account / settings screen.
 */
import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@shared/components/ui/icon-symbol';
import { useTheme } from '@shared/theme';

export interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  /** User's display name — used to derive the avatar initial. */
  userName: string | null | undefined;
  onHamburgerPress: () => void;
  onAvatarPress?: () => void;
}

function DashboardHeaderComponent({
  title,
  subtitle,
  userName,
  onHamburgerPress,
  onAvatarPress,
}: DashboardHeaderProps): React.JSX.Element {
  const { colors, sp, typo, elev } = useTheme();
  const insets = useSafeAreaInsets();

  const initial = (userName ?? 'U').charAt(0).toUpperCase();

  const handleHamburger = useCallback((): void => {
    onHamburgerPress();
  }, [onHamburgerPress]);

  const handleAvatar = useCallback((): void => {
    onAvatarPress?.();
  }, [onAvatarPress]);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.navSolid,
      paddingTop: insets.top + sp.xs,
      paddingBottom: sp.md,
      paddingHorizontal: sp.base,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      gap: sp.md,
      ...elev.high,
    },
    hamburger: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: sp.sm,
    },
    titleWrap: { flex: 1 },
    title: {
      ...typo.scale.title3,
      fontFamily: typo.fonts.serifBold,
      color: colors.textHigh,
    },
    subtitle: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
      marginTop: 2,
    },
    avatarCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.accentSubtle,
      borderWidth: 1.5,
      borderColor: colors.accentMid,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarInitial: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.accent,
    },
  });

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.hamburger}
        onPress={handleHamburger}
        hitSlop={8}
        accessibilityLabel="Open navigation menu"
        accessibilityRole="button"
      >
        <IconSymbol name="line.3.horizontal" size={24} color={colors.textHigh} />
      </Pressable>

      <View style={styles.titleWrap}>
        <Text style={styles.title}>{title}</Text>
        {subtitle !== undefined && (
          <Text style={styles.subtitle}>{subtitle}</Text>
        )}
      </View>

      <Pressable
        onPress={handleAvatar}
        hitSlop={8}
        accessibilityLabel="Open account"
        accessibilityRole="button"
      >
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitial}>{initial}</Text>
        </View>
      </Pressable>
    </View>
  );
}

export const DashboardHeader = memo(DashboardHeaderComponent);
