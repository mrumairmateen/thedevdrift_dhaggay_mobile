import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@shared/theme';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const STEPS = [
  {
    number: '01',
    icon: 'bag.fill' as const,
    title: 'Browse Fabrics',
    description: 'Explore 3,200+ curated fabrics from verified sellers across Pakistan.',
  },
  {
    number: '02',
    icon: 'paintbrush.fill' as const,
    title: 'Pick a Design',
    description: 'Choose from 500+ stitching designs or upload your own reference.',
  },
  {
    number: '03',
    icon: 'person.crop.circle.fill' as const,
    title: 'Book a Tailor',
    description: 'Browse 480+ vetted tailors. Compare portfolios, pricing, and availability.',
  },
  {
    number: '04',
    icon: 'house.fill' as const,
    title: 'Delivered to You',
    description: 'Your finished outfit arrives at your door. Track every milestone.',
  },
];

export function HowItWorks() {
  const { colors, sp, r, typo, elev } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.container, { paddingHorizontal: sp.base, gap: sp.md }]}
    >
      {STEPS.map((step, index) => (
        <View
          key={step.number}
          style={[
            styles.card,
            elev.low,
            {
              backgroundColor: colors.elevated,
              borderColor: colors.border,
              borderRadius: r.lg,
              padding: sp.lg,
              width: 196,
            },
          ]}
        >
          {/* Step number — editorial display font */}
          <Text
            style={[
              typo.scale.hero,
              {
                fontFamily: typo.fonts.display,
                color: colors.accentMid,
                lineHeight: 48,
                marginBottom: sp.xs,
              },
            ]}
          >
            {step.number}
          </Text>

          {/* Icon */}
          <View
            style={[
              styles.iconWrap,
              {
                backgroundColor: colors.accentSubtle,
                borderRadius: r.md,
                width: 40,
                height: 40,
                marginBottom: sp.md,
              },
            ]}
          >
            <IconSymbol name={step.icon} size={18} color={colors.accent} />
          </View>

          {/* Title */}
          <Text
            style={[
              typo.scale.bodySmall,
              {
                fontFamily: typo.fonts.serifBold,
                color: colors.textHigh,
                marginBottom: sp.xs,
              },
            ]}
          >
            {step.title}
          </Text>

          {/* Description */}
          <Text
            style={[
              typo.scale.caption,
              {
                fontFamily: typo.fonts.sans,
                color: colors.textMid,
                lineHeight: 18,
              },
            ]}
          >
            {step.description}
          </Text>

          {/* Connector dot for non-last cards */}
          {index < STEPS.length - 1 && (
            <View
              style={[styles.connector, { backgroundColor: colors.thread }]}
            />
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  card: {
    borderWidth: 1,
    overflow: 'visible',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  connector: {
    position: 'absolute',
    right: -8,
    top: '50%',
    width: 8,
    height: 2,
  },
});
