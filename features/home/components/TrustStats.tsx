import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@shared/theme';

export interface TrustStatsProps {}

interface Stat {
  value: string;
  label: string;
}

const STATS: Stat[] = [
  { value: '12K+',  label: 'Outfits Delivered' },
  { value: '4.9★',  label: 'Average Rating'    },
  { value: '340+',  label: 'Master Tailors'    },
  { value: '800+',  label: 'Fabric SKUs'       },
];

export const TrustStats = React.memo(function TrustStats(
  _props: TrustStatsProps,
): React.JSX.Element {
  const { colors, sp, typo } = useTheme();

  const styles = StyleSheet.create({
    container: {
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.elevated,
      paddingVertical: sp.xl,
      paddingHorizontal: sp.base,
    },
    heading: {
      ...typo.scale.subtitle,
      fontFamily: typo.fonts.serif,
      color: colors.textMid,
      textAlign: 'center',
      marginBottom: sp.xl,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    statCell: {
      width: '50%',
      marginBottom: sp.lg,
    },
    value: {
      ...typo.scale.title1,
      fontFamily: typo.fonts.display,
      color: colors.textHigh,
      textAlign: 'center',
    },
    label: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{'Trusted by thousands across Pakistan'}</Text>
      <View style={styles.grid}>
        {STATS.map(stat => (
          <View key={stat.label} style={styles.statCell}>
            <Text style={styles.value}>{stat.value}</Text>
            <Text style={styles.label}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
});
