import { ORDER_STEP_LABELS, ORDER_STEPS, type OrderStatus } from '@features/dashboard/dashboard.types';
import { useTheme } from '@shared/theme';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

interface Props {
  currentStep: number; // 0–6
  cancelledAt?: number; // step index where order was cancelled, if applicable
  status: OrderStatus;
}

const STEP_SIZE = 22;
const LINE_WIDTH = 20;

export function OrderProgressBar({ currentStep, status, cancelledAt }: Props) {
  const { colors, sp, r, typo } = useTheme();
  const isCancelled = status === 'cancelled';

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.container, { paddingHorizontal: sp.base, paddingVertical: sp.sm }]}
    >
      {ORDER_STEPS.map((stepKey, idx) => {
        const isCompleted = !isCancelled && idx < currentStep;
        const isCurrent = !isCancelled && idx === currentStep;
        const isLast = idx === ORDER_STEPS.length - 1;

        let circleColor = colors.panel;
        let borderColor = colors.border;
        let textColor = colors.textLow;

        if (isCompleted) {
          circleColor = colors.accent;
          borderColor = colors.accent;
          textColor = colors.accent;
        } else if (isCurrent) {
          circleColor = colors.accentSubtle;
          borderColor = colors.accent;
          textColor = colors.accent;
        }

        return (
          <View key={stepKey} style={styles.stepWrapper}>
            <View style={styles.stepRow}>
              {/* Step circle */}
              <View
                style={[
                  styles.circle,
                  {
                    width: STEP_SIZE,
                    height: STEP_SIZE,
                    borderRadius: r.pill,
                    backgroundColor: circleColor,
                    borderColor,
                    borderWidth: isCurrent ? 2 : 1.5,
                  },
                ]}
              >
                {isCompleted && (
                  <Text style={{ fontSize: 10, color: colors.textOnAccent }}>✓</Text>
                )}
                {isCurrent && !isCompleted && (
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: r.pill,
                      backgroundColor: colors.accent,
                    }}
                  />
                )}
              </View>
              {/* Connector line */}
              {!isLast && (
                <View
                  style={[
                    styles.line,
                    {
                      width: LINE_WIDTH,
                      backgroundColor: isCompleted ? colors.accent : colors.border,
                    },
                  ]}
                />
              )}
            </View>
            {/* Label */}
            <Text
              style={[
                typo.scale.caption,
                {
                  fontFamily: typo.fonts.sans,
                  color: textColor,
                  marginTop: sp.xs,
                  textAlign: 'center',
                  maxWidth: STEP_SIZE + LINE_WIDTH,
                },
              ]}
              numberOfLines={1}
            >
              {ORDER_STEP_LABELS[stepKey as OrderStatus]}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'flex-start' },
  stepWrapper: { alignItems: 'center' },
  stepRow: { flexDirection: 'row', alignItems: 'center' },
  circle: { alignItems: 'center', justifyContent: 'center' },
  line: { height: 2 },
});
