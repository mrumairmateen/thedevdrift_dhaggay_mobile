import React, { memo, useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '@shared/theme';

export interface SkeletonProps {
  width?: number | string;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

export interface SkeletonTextProps {
  lines?: number;
  lastLineWidth?: string;
  lineHeight?: number;
  spacing?: number;
}

export const Skeleton = memo(function Skeleton({
  width = '100%',
  height = 16,
  radius,
  style,
}: SkeletonProps): React.JSX.Element {
  const { colors, r } = useTheme();
  const opacity = useRef(new Animated.Value(0.4)).current;

  const resolvedRadius = radius !== undefined ? radius : r.sm;

  const styles = StyleSheet.create({
    base: {
      backgroundColor: colors.panel,
      borderRadius: resolvedRadius,
    },
  });

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => {
      animation.stop();
    };
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.base,
        { width: width as number, height, opacity },
        style,
      ]}
    />
  );
});

export const SkeletonText = memo(function SkeletonText({
  lines = 2,
  lastLineWidth = '60%',
  lineHeight = 16,
  spacing,
}: SkeletonTextProps): React.JSX.Element {
  const { sp, r } = useTheme();

  const resolvedSpacing = spacing !== undefined ? spacing : sp.sm;

  const styles = StyleSheet.create({
    container: {
      width: '100%',
    },
    lineWrapper: {
      marginTop: resolvedSpacing,
    },
  });

  const lineCount = lines > 0 ? lines : 2;

  return (
    <View style={styles.container}>
      {Array.from({ length: lineCount }).map((_, index) => {
        const isLast = index === lineCount - 1;
        const isFirst = index === 0;
        return (
          <View key={index} style={isFirst ? undefined : styles.lineWrapper}>
            <Skeleton
              width={isLast && lineCount > 1 ? lastLineWidth : '100%'}
              height={lineHeight}
              radius={r.sm}
            />
          </View>
        );
      })}
    </View>
  );
});
