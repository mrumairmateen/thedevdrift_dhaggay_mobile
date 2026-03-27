import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import {
  useGetFlaggedReviewsQuery,
  useModerateReviewMutation,
} from '@services/adminApi';
import type { FlaggedReview } from '@services/adminApi';
import { useTheme } from '@shared/theme';
import {
  Badge,
  ErrorBanner,
  ScreenHeader,
  Skeleton,
} from '@shared/components/ui';
import type { BadgeVariant } from '@shared/components/ui';
import { IconSymbol } from '@shared/components/ui/icon-symbol';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function moderationVariant(status: FlaggedReview['moderation']['status']): BadgeVariant {
  switch (status) {
    case 'pending':  return 'warning';
    case 'approved': return 'success';
    case 'removed':  return 'error';
  }
}

function renderStars(rating: number): string {
  return '★'.repeat(Math.min(5, Math.max(0, rating))) +
    '☆'.repeat(5 - Math.min(5, Math.max(0, rating)));
}

// ─── Flagged Review Card ───────────────────────────────────────────────────────

interface FlaggedReviewCardProps {
  review: FlaggedReview;
}

const FlaggedReviewCard = React.memo(function FlaggedReviewCard({
  review,
}: FlaggedReviewCardProps): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();
  const [showRemoveInput, setShowRemoveInput] = useState(false);
  const [removedReason, setRemovedReason] = useState('');
  const [moderateReview, { isLoading }] = useModerateReviewMutation();

  const handleApprove = useCallback(() => {
    void moderateReview({ id: review._id, action: 'approve' });
  }, [moderateReview, review._id]);

  const handleRemovePress = useCallback(() => {
    setShowRemoveInput(true);
  }, []);

  const handleRemoveConfirm = useCallback(() => {
    const trimmed = removedReason.trim();
    if (trimmed.length < 10) return;
    void moderateReview({ id: review._id, action: 'remove', removedReason: trimmed });
  }, [moderateReview, review._id, removedReason]);

  const isPending = review.moderation.status === 'pending';
  const reviewerName = review.reviewerId?.name ?? 'Anonymous';

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      padding: sp.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: sp.sm,
      gap: sp.sm,
      ...elev.low,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    reviewer: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.textHigh,
    },
    targetBadge: {
      flexDirection: 'row',
      gap: sp.xs,
      alignItems: 'center',
    },
    stars: {
      ...typo.scale.body,
      color: colors.warning,
    },
    comment: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
      fontStyle: 'italic',
    },
    flagRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: sp.xs,
    },
    flagText: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.warning,
      flex: 1,
    },
    actionRow: {
      flexDirection: 'row',
      gap: sp.sm,
    },
    actionBtn: {
      flex: 1,
      borderRadius: r.sm,
      borderWidth: 1,
      paddingVertical: sp.sm,
      alignItems: 'center',
    },
    actionLabel: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansMed,
    },
    removeInput: {
      backgroundColor: colors.inputBg,
      borderRadius: r.sm,
      borderWidth: 1,
      borderColor: colors.border,
      padding: sp.sm,
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sans,
      color: colors.textHigh,
      minHeight: 60,
      textAlignVertical: 'top',
    },
    hint: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textLow,
    },
    confirmBtn: {
      borderRadius: r.sm,
      paddingVertical: sp.sm,
      paddingHorizontal: sp.md,
      alignItems: 'center',
      alignSelf: 'flex-end',
    },
    confirmLabel: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
    },
  });

  return (
    <View style={styles.card}>
      {/* Top row */}
      <View style={styles.topRow}>
        <Text style={styles.reviewer}>{reviewerName}</Text>
        <View style={styles.targetBadge}>
          <Badge label={review.targetType} variant="info" size="sm" />
          <Badge
            label={review.moderation.status}
            variant={moderationVariant(review.moderation.status)}
            size="sm"
          />
        </View>
      </View>

      {/* Stars */}
      <Text style={styles.stars}>{renderStars(review.ratings.overall)}</Text>

      {/* Comment */}
      {review.comment.length > 0 && (
        <Text style={styles.comment} numberOfLines={3}>
          "{review.comment}"
        </Text>
      )}

      {/* Flag reason */}
      <View style={styles.flagRow}>
        <IconSymbol name="exclamationmark.triangle" size={14} color={colors.warning} />
        <Text style={styles.flagText}>{review.flagged.reason}</Text>
      </View>

      {/* Actions — only for pending */}
      {isPending && !showRemoveInput && (
        <View style={styles.actionRow}>
          <Pressable
            style={[
              styles.actionBtn,
              { backgroundColor: colors.successSubtle, borderColor: colors.success },
            ]}
            onPress={handleApprove}
            disabled={isLoading}
          >
            <Text style={[styles.actionLabel, { color: colors.success }]}>Approve</Text>
          </Pressable>
          <Pressable
            style={[
              styles.actionBtn,
              { backgroundColor: colors.errorSubtle, borderColor: colors.error },
            ]}
            onPress={handleRemovePress}
            disabled={isLoading}
          >
            <Text style={[styles.actionLabel, { color: colors.error }]}>Remove</Text>
          </Pressable>
        </View>
      )}

      {/* Remove reason input */}
      {isPending && showRemoveInput && (
        <View style={{ gap: sp.sm }}>
          <TextInput
            style={styles.removeInput}
            value={removedReason}
            onChangeText={setRemovedReason}
            placeholder="Reason for removal (min 10 chars)..."
            placeholderTextColor={colors.textLow}
            multiline
          />
          <Text style={styles.hint}>{removedReason.trim().length}/10 minimum</Text>
          <Pressable
            style={[
              styles.confirmBtn,
              {
                backgroundColor:
                  removedReason.trim().length >= 10 ? colors.error : colors.panel,
              },
            ]}
            onPress={handleRemoveConfirm}
            disabled={isLoading || removedReason.trim().length < 10}
          >
            <Text
              style={[
                styles.confirmLabel,
                {
                  color:
                    removedReason.trim().length >= 10
                      ? colors.textOnAccent
                      : colors.textLow,
                },
              ]}
            >
              Confirm Removal
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
});

// ─── Skeleton Row ─────────────────────────────────────────────────────────────

function ReviewCardSkeleton(): React.JSX.Element {
  const { colors, sp, r } = useTheme();

  const styles = StyleSheet.create({
    card: {
      height: 140,
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: sp.sm,
    },
  });

  return <View style={styles.card} />;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AdminReviewsScreen(): React.JSX.Element {
  const { colors, sp } = useTheme();
  const router = useRouter();

  const { data, isLoading, isError, refetch } = useGetFlaggedReviewsQuery({ page: 1, limit: 30 });

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const renderReview = useCallback(
    ({ item }: { item: FlaggedReview }) => <FlaggedReviewCard review={item} />,
    [],
  );

  const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg },
    list: { flex: 1 },
    listContent: { padding: sp.base, paddingBottom: sp['4xl'] },
    errorWrap: { padding: sp.base },
    skeletonWrap: { padding: sp.base },
    emptyWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: sp['2xl'],
      gap: sp.md,
    },
    emptyTitle: {
      ...({ fontSize: 18, fontWeight: '600' } as object),
      color: colors.textHigh,
    },
    emptyMsg: {
      fontSize: 14,
      color: colors.textMid,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Flagged Reviews" onBack={handleBack} />

      {isLoading ? (
        <View style={styles.skeletonWrap}>
          {[0, 1, 2, 3].map((i) => (
            <ReviewCardSkeleton key={i} />
          ))}
        </View>
      ) : isError ? (
        <View style={styles.errorWrap}>
          <ErrorBanner
            message="Could not load flagged reviews. Please try again."
            onRetry={refetch}
          />
        </View>
      ) : (
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={data?.reviews ?? []}
          keyExtractor={(item) => item._id}
          renderItem={renderReview}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <IconSymbol name="checkmark.circle.fill" size={40} color={colors.success} />
              <Text style={styles.emptyTitle}>Queue clear</Text>
              <Text style={styles.emptyMsg}>No flagged reviews awaiting moderation.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
