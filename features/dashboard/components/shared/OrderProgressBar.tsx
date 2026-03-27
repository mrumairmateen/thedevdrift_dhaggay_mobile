import {
  isCancelledStatus,
  ORDER_STEP_LABELS,
  ORDER_STEPS,
  type OrderStatus,
  type OrderStep,
} from '@features/dashboard/dashboard.types';
import { useTheme } from '@shared/theme';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

interface Props {
  /** Full status history from the API — used to determine completed steps */
  statusHistory: OrderStep[];
  status: OrderStatus;
}

const STEP_SIZE = 22;
const LINE_WIDTH = 20;

/**
 * Returns the set of statuses that appear in the history array.
 * The last entry is the current status.
 */
function buildCompletedSet(history: OrderStep[]): Set<OrderStatus> {
  const set = new Set<OrderStatus>();
  for (const entry of history) {
    set.add(entry.status);
  }
  return set;
}

export function OrderProgressBar({ statusHistory, status }: Props): React.JSX.Element {
  const { colors, sp, r, typo } = useTheme();
  const isCancelled = isCancelledStatus(status);
  const completedStatuses = buildCompletedSet(statusHistory);

  // All statuses that should appear in the timeline: pipeline steps that
  // have been reached OR the special/terminal current status if not in ORDER_STEPS
  const timelineSteps: OrderStatus[] = [...ORDER_STEPS];

  // If the order has a special status not in the main pipeline, append it
  if (!ORDER_STEPS.includes(status) && status !== 'delivered_to_customer') {
    timelineSteps.push(status);
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.container, { paddingHorizontal: sp.base, paddingVertical: sp.sm }]}
    >
      {timelineSteps.map((stepKey, idx) => {
        const isReached = completedStatuses.has(stepKey);
        const isCurrent = stepKey === status;
        const isLast = idx === timelineSteps.length - 1;

        let circleColor = colors.panel;
        let borderColor = colors.border;
        let textColor = colors.textLow;

        if (isCancelled && isCurrent) {
          circleColor = colors.errorSubtle;
          borderColor = colors.error;
          textColor = colors.error;
        } else if (status === 'disputed' && isCurrent) {
          circleColor = colors.errorSubtle;
          borderColor = colors.error;
          textColor = colors.error;
        } else if (isReached && !isCurrent) {
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
                {isReached && !isCurrent && (
                  <Text style={{ fontSize: 10, color: colors.textOnAccent }}>✓</Text>
                )}
                {isCurrent && !isReached && (
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: r.pill,
                      backgroundColor: isCancelled || status === 'disputed' ? colors.error : colors.accent,
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
                      backgroundColor: isReached ? colors.accent : colors.border,
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
              numberOfLines={2}
            >
              {ORDER_STEP_LABELS[stepKey]}
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
