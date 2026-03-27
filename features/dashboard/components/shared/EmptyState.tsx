import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@shared/theme';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  icon: string;
  title: string;
  message?: string;
  ctaLabel?: string;
  onCta?: () => void;
}

export function EmptyState({ icon, title, message, ctaLabel, onCta }: Props) {
  const { colors, sp, r, typo } = useTheme();

  return (
    <View style={[styles.container, { paddingVertical: sp['4xl'] }]}>
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: colors.panel,
            borderRadius: r.pill,
            width: 72,
            height: 72,
            marginBottom: sp.lg,
          },
        ]}
      >
        <IconSymbol name={icon as any} size={32} color={colors.textLow} />
      </View>
      <Text
        style={[
          typo.scale.title3,
          { fontFamily: typo.fonts.serifBold, color: colors.textHigh, marginBottom: sp.sm },
        ]}
      >
        {title}
      </Text>
      {message && (
        <Text
          style={[
            typo.scale.body,
            {
              fontFamily: typo.fonts.sans,
              color: colors.textMid,
              textAlign: 'center',
              marginBottom: sp.xl,
              maxWidth: 260,
            },
          ]}
        >
          {message}
        </Text>
      )}
      {ctaLabel && onCta && (
        <Pressable
          onPress={onCta}
          style={[
            styles.cta,
            {
              backgroundColor: colors.accent,
              borderRadius: r.pill,
              paddingHorizontal: sp.xl,
              paddingVertical: sp.md,
            },
          ]}
        >
          <Text
            style={[typo.scale.body, { fontFamily: typo.fonts.sansBold, color: colors.textOnAccent }]}
          >
            {ctaLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingHorizontal: 32 },
  iconCircle: { alignItems: 'center', justifyContent: 'center' },
  cta: { alignItems: 'center' },
});
