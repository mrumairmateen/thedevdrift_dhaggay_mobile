import { useTheme } from '@shared/theme';
import { StyleSheet, Text, View } from 'react-native';

const STATS = [
  { value: '12,000+', label: 'Happy customers',   accent: true  },
  { value: '480+',    label: 'Verified tailors',  accent: false },
  { value: '3,200+',  label: 'Fabric listings',   accent: false },
  { value: '98%',     label: 'On-time delivery',  accent: true  },
];

export function TrustStats() {
  const { colors, sp, r, typo } = useTheme();

  return (
    <View style={[styles.root, { paddingHorizontal: sp.base }]}>
      {/* Label */}
      <Text
        style={[
          typo.scale.label,
          {
            fontFamily: typo.fonts.sansMed,
            color: colors.accent,
            marginBottom: sp.sm,
            textAlign: 'center',
          },
        ]}
      >
        TRUSTED BY THOUSANDS
      </Text>

      {/* 2×2 grid */}
      <View style={[styles.grid, { gap: sp.sm }]}>
        {STATS.map((stat) => (
          <View
            key={stat.label}
            style={[
              styles.box,
              {
                backgroundColor: colors.elevated,
                borderColor: colors.border,
                borderRadius: r.lg,
                padding: sp.lg,
                flex: 1,
              },
            ]}
          >
            <Text
              style={[
                typo.scale.hero,
                {
                  fontFamily: typo.fonts.display,
                  color: stat.accent ? colors.accent : colors.textHigh,
                  lineHeight: 50,
                  marginBottom: sp.xs,
                },
              ]}
            >
              {stat.value}
            </Text>
            <Text
              style={[
                typo.scale.caption,
                { fontFamily: typo.fonts.sans, color: colors.textMid },
              ]}
            >
              {stat.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {},
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  box: {
    borderWidth: 1,
    minWidth: '47%',
  },
});
