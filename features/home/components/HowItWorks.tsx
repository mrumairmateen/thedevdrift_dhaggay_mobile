import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { IconSymbol, IconSymbolName } from '@shared/components/ui/icon-symbol';
import { useTheme } from '@shared/theme';

export interface HowItWorksProps {}

interface Step {
  number: string;
  title: string;
  desc: string;
  icon: IconSymbolName;
}

const STEPS: Step[] = [
  {
    number: '01',
    title: 'Choose Fabric',
    desc: 'Browse hundreds of premium fabrics from verified sellers across Pakistan.',
    icon: 'bag.fill',
  },
  {
    number: '02',
    title: 'Pick a Design',
    desc: 'Select from thousands of designs or describe your own vision.',
    icon: 'paintbrush.fill',
  },
  {
    number: '03',
    title: 'Expert Tailoring',
    desc: 'Your matched tailor stitches to your exact measurements.',
    icon: 'scissors',
  },
  {
    number: '04',
    title: 'Delivered to You',
    desc: 'White-glove delivery straight to your door in 7–14 days.',
    icon: 'shippingbox.fill',
  },
];

export const HowItWorks = React.memo(function HowItWorks(
  _props: HowItWorksProps,
): React.JSX.Element {
  const { colors, sp, typo } = useTheme();

  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: sp.base,
    },
    stepRow: {
      flexDirection: 'row',
      gap: sp.md,
      marginBottom: sp.xl,
    },
    stepNumber: {
      ...typo.scale.hero,
      fontFamily: typo.fonts.display,
      color: colors.accentMid,
      width: 44,
      textAlign: 'center',
    },
    stepRight: {
      flex: 1,
    },
    stepTitle: {
      ...typo.scale.title3,
      fontFamily: typo.fonts.serifBold,
      color: colors.textHigh,
    },
    stepDesc: {
      ...typo.scale.body,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
      marginTop: sp.xs,
    },
    iconRow: {
      marginTop: sp.sm,
    },
  });

  return (
    <View style={styles.container}>
      {STEPS.map(step => (
        <View key={step.number} style={styles.stepRow}>
          <Text style={styles.stepNumber}>{step.number}</Text>
          <View style={styles.stepRight}>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepDesc}>{step.desc}</Text>
            <View style={styles.iconRow}>
              <IconSymbol name={step.icon} size={16} color={colors.accent} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
});
