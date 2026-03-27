import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { IconSymbol } from '@shared/components/ui/icon-symbol';
import { useTheme } from '@shared/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AvatarProps {
  uri?: string;
  name?: string;
  size?: number;
  onPress?: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => {
      const first = word[0];
      return first !== undefined ? first.toUpperCase() : '';
    })
    .join('');
}

// ─── Component ────────────────────────────────────────────────────────────────

export const Avatar = memo(function Avatar({
  uri,
  name,
  size = 40,
  onPress,
}: AvatarProps): React.JSX.Element {
  const { colors, typo } = useTheme();

  const styles = StyleSheet.create({
    container: {
      width: size,
      height: size,
      borderRadius: size / 2,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
    },
    imageBg: {
      width: size,
      height: size,
      borderRadius: size / 2,
    },
    initialsBg: {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: colors.accentSubtle,
      alignItems: 'center',
      justifyContent: 'center',
    },
    initialsText: {
      fontSize: Math.round(size * 0.38),
      fontFamily: typo.fonts.sansBold,
      color: colors.accent,
    },
    placeholderBg: {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: colors.panel,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  function renderContent(): React.JSX.Element {
    if (uri !== undefined && uri.length > 0) {
      return (
        <Image
          source={{ uri }}
          style={styles.imageBg}
          contentFit="cover"
        />
      );
    }

    if (name !== undefined && name.trim().length > 0) {
      const initials = getInitials(name);
      return (
        <View style={styles.initialsBg}>
          <Text style={styles.initialsText}>{initials}</Text>
        </View>
      );
    }

    return (
      <View style={styles.placeholderBg}>
        <IconSymbol
          name="person.fill"
          size={Math.round(size * 0.5)}
          color={colors.textLow}
        />
      </View>
    );
  }

  if (onPress !== undefined) {
    return (
      <Pressable style={styles.container} onPress={onPress}>
        {renderContent()}
      </Pressable>
    );
  }

  return <View style={styles.container}>{renderContent()}</View>;
});
