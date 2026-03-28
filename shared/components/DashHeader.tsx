import React, { useCallback } from 'react';
import { Image, type ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useAppSelector } from '@store/index';
import { useTheme } from '@shared/theme';
import { useSignOut } from '@shared/hooks/useSignOut';
import { Avatar } from '@shared/components/ui';
import { IconSymbol } from '@shared/components/ui/icon-symbol';

const DHAGGAY_ICON = require('../../assets/icon.png') as ImageSourcePropType;

export interface DashHeaderProps {
  title: string;
  subtitle: string;
}

export function DashHeader({ title, subtitle }: DashHeaderProps): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const authUser = useAppSelector((s) => s.auth.user);
  const handleSignOut = useSignOut();

  const handleGoShop = useCallback(() => {
    router.push('/(tabs)' as never);
  }, [router]);

  const styles = StyleSheet.create({
    header: {
      backgroundColor: colors.navSolid,
      paddingTop: insets.top + sp.sm,
      paddingHorizontal: sp.base,
      paddingBottom: sp.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: sp.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      ...elev.high,
    },
    logoBtn: {
      width: 36,
      height: 36,
      borderRadius: r.sm,
      overflow: 'hidden',
    },
    logoImg: {
      width: 36,
      height: 36,
    },
    titleBlock: { flex: 1 },
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
    rightRow: { flexDirection: 'row', alignItems: 'center', gap: sp.sm },
  });

  return (
    <View style={styles.header}>
      <Pressable onPress={handleGoShop} hitSlop={8} style={styles.logoBtn}>
        <Image source={DHAGGAY_ICON} style={styles.logoImg} resizeMode="contain" />
      </Pressable>

      <View style={styles.titleBlock}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <View style={styles.rightRow}>
        <Pressable onPress={handleSignOut} hitSlop={10}>
          <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color={colors.textMid} />
        </Pressable>
        <Avatar
          uri={authUser?.avatarUrl ?? undefined}
          name={authUser?.name}
          size={40}
        />
      </View>
    </View>
  );
}
