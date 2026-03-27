import { useTheme } from '@shared/theme';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Tab = 'fabrics' | 'designs';

interface Props {
  active: Tab;
  onChange: (tab: Tab) => void;
  fabricCount: number;
  designCount: number;
}

export function WishlistTabBar({ active, onChange, fabricCount, designCount }: Props) {
  const { colors, sp, typo } = useTheme();

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'fabrics', label: 'Fabrics', count: fabricCount },
    { key: 'designs', label: 'Designs', count: designCount },
  ];

  return (
    <View style={[styles.container, { borderBottomColor: colors.border }]}>
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={[
              styles.tab,
              {
                borderBottomWidth: isActive ? 2 : 0,
                borderBottomColor: isActive ? colors.accent : 'transparent',
                paddingVertical: sp.md,
                paddingHorizontal: sp.base,
              },
            ]}
          >
            <Text
              style={[
                typo.scale.body,
                {
                  fontFamily: isActive ? typo.fonts.sansBold : typo.fonts.sans,
                  color: isActive ? colors.textHigh : colors.textLow,
                },
              ]}
            >
              {tab.label}
            </Text>
            {tab.count > 0 && (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: isActive ? colors.accent : colors.panel,
                    marginLeft: 6,
                    borderRadius: 999,
                    paddingHorizontal: 6,
                    paddingVertical: 1,
                  },
                ]}
              >
                <Text
                  style={[
                    typo.scale.caption,
                    {
                      fontFamily: typo.fonts.sansBold,
                      color: isActive ? colors.textOnAccent : colors.textLow,
                      fontSize: 10,
                    },
                  ]}
                >
                  {tab.count}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flexDirection: 'row', alignItems: 'center' },
  badge: {},
});
