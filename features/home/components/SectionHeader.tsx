import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTheme } from '@shared/theme';
import { Pressable, Text, View } from 'react-native';

interface Props {
  label?: string;
  title: string;
  onSeeAll?: () => void;
}

export function SectionHeader({ label, title, onSeeAll }: Props) {
  const { colors, sp, typo } = useTheme();

  return (
    <View style={{ paddingHorizontal: sp.base, marginBottom: sp.md }}>
      {label && (
        <Text
          style={[
            typo.scale.label,
            { fontFamily: typo.fonts.sansMed, color: colors.accent, marginBottom: sp.xs },
          ]}
        >
          {label}
        </Text>
      )}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text
          style={[typo.scale.title3, { fontFamily: typo.fonts.serifBold, color: colors.textHigh, flex: 1 }]}
        >
          {title}
        </Text>
        {onSeeAll && (
          <Pressable
            onPress={onSeeAll}
            style={{ flexDirection: 'row', alignItems: 'center', gap: sp.xs }}
            hitSlop={8}
          >
            <Text style={[typo.scale.bodySmall, { fontFamily: typo.fonts.sansMed, color: colors.accent }]}>
              See all
            </Text>
            <IconSymbol name="arrow.right" size={12} color={colors.accent} />
          </Pressable>
        )}
      </View>
    </View>
  );
}
