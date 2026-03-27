import { ORDER_STEP_LABELS, STATUS_COLOR_TOKENS, type OrderStatus } from '@features/dashboard/dashboard.types';
import { useTheme } from '@shared/theme';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  status: OrderStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'sm' }: Props) {
  const { colors, sp, r, typo } = useTheme();
  const tokens = STATUS_COLOR_TOKENS[status] ?? { bg: 'panel', text: 'textMid' };
  // Safely resolve token keys — fall back to panel/textMid for unknown tokens
  const bgColor = (colors as Record<string, string>)[tokens.bg] ?? colors.panel;
  const textColor = (colors as Record<string, string>)[tokens.text] ?? colors.textMid;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bgColor,
          borderRadius: r.sharp,
          paddingVertical: size === 'md' ? sp.xs : 2,
          paddingHorizontal: size === 'md' ? sp.md : sp.sm,
        },
      ]}
    >
      <Text
        style={[
          size === 'md' ? typo.scale.bodySmall : typo.scale.caption,
          { fontFamily: typo.fonts.sansMed, color: textColor },
        ]}
      >
        {ORDER_STEP_LABELS[status] ?? status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start' },
});
