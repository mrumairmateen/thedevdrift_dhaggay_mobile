import type { LoyaltyTransaction } from '@features/dashboard/dashboard.types';
import { useTheme } from '@shared/theme';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  transaction: LoyaltyTransaction;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
}

export function TransactionRow({ transaction }: Props) {
  const { colors, sp, r, typo } = useTheme();
  const isEarn = transaction.type === 'earn';
  const isRedeem = transaction.type === 'redeem';

  const pointsColor = isEarn ? colors.success : isRedeem ? colors.error : colors.textLow;

  return (
    <View
      style={[
        styles.row,
        {
          paddingVertical: sp.md,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.icon,
          {
            backgroundColor: isEarn ? colors.successSubtle : isRedeem ? colors.errorSubtle : colors.panel,
            borderRadius: r.pill,
            width: 36,
            height: 36,
          },
        ]}
      >
        <Text style={{ fontSize: 14 }}>{isEarn ? '↑' : isRedeem ? '↓' : '×'}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={[typo.scale.bodySmall, { fontFamily: typo.fonts.sansMed, color: colors.textHigh }]}>
          {transaction.description}
        </Text>
        <Text style={[typo.scale.caption, { fontFamily: typo.fonts.sans, color: colors.textLow }]}>
          {timeAgo(transaction.createdAt)}
        </Text>
      </View>

      <Text style={[typo.scale.bodySmall, { fontFamily: typo.fonts.sansBold, color: pointsColor }]}>
        {isEarn ? '+' : isRedeem ? '-' : ''}{Math.abs(transaction.points)} pts
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
});
