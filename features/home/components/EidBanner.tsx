import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useTheme } from '@shared/theme';

export interface EidBannerProps {}

export const EidBanner = React.memo(function EidBanner(
  _props: EidBannerProps,
): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();
  const router = useRouter();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.elevated,
      borderLeftWidth: 4,
      borderLeftColor: colors.thread,
      borderRadius: r.lg,
      padding: sp.xl,
      marginHorizontal: sp.base,
      ...elev.mid,
    },
    eyebrow: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansMed,
      color: colors.accent,
      marginBottom: sp.sm,
    },
    title: {
      ...typo.scale.title2,
      fontFamily: typo.fonts.serifBold,
      color: colors.textHigh,
      marginBottom: sp.sm,
    },
    subtitle: {
      ...typo.scale.body,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
      marginBottom: sp.xl,
    },
    ctaButton: {
      alignSelf: 'center',
      backgroundColor: colors.accent,
      borderRadius: r.pill,
      paddingHorizontal: sp.xl,
      paddingVertical: sp.md,
    },
    ctaText: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansBold,
      color: colors.textOnAccent,
    },
  });

  const handleShopEid = useCallback(() => {
    router.push('/(tabs)/shop?occasion=eid' as Parameters<typeof router.push>[0]);
  }, [router]);

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>{'✦ EID COLLECTION'}</Text>
      <Text style={styles.title}>{'Dressed for Eid. Sewn with Love.'}</Text>
      <Text style={styles.subtitle}>
        {'Discover exclusive Eid fabric collections. Order now for timely delivery.'}
      </Text>
      <Pressable style={styles.ctaButton} onPress={handleShopEid}>
        <Text style={styles.ctaText}>{'SHOP EID COLLECTION'}</Text>
      </Pressable>
    </View>
  );
});
