import React, { useCallback, useState } from 'react';
import {
  FlatList,
  ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  useGetSellerReviewsQuery,
  useReplyToReviewMutation,
} from '@services/sellerApi';
import type { SellerReview } from '@services/sellerApi';
import { useTheme } from '@shared/theme';
import {
  Avatar,
  Button,
  EmptyState,
  ErrorBanner,
  Skeleton,
} from '@shared/components/ui';
import { IconSymbol } from '@shared/components/ui/icon-symbol';

// ─── Star renderer ────────────────────────────────────────────────────────────

function renderStars(rating: number): string {
  const filled = Math.round(Math.max(0, Math.min(5, rating)));
  return '★'.repeat(filled) + '☆'.repeat(5 - filled);
}

// ─── Rating summary card ──────────────────────────────────────────────────────

interface RatingSummaryProps {
  reviews: SellerReview[];
}

const RatingSummaryCard = React.memo(function RatingSummaryCard({
  reviews,
}: RatingSummaryProps): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.elevated,
      borderRadius: r.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: sp.base,
      marginHorizontal: sp.base,
      marginBottom: sp.base,
      gap: sp.sm,
      ...elev.low,
    },
    mainRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: sp.base,
    },
    avgNumber: {
      ...typo.scale.hero,
      fontFamily: typo.fonts.display,
      color: colors.accent,
    },
    stars: {
      ...typo.scale.title3,
      color: colors.accent,
    },
    totalText: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
    },
    dimensionRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: sp.sm,
    },
    dimension: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
    },
    dimensionValue: {
      fontFamily: typo.fonts.sansBold,
      color: colors.textHigh,
    },
  });

  if (reviews.length === 0) return <View />;

  const count = reviews.length;
  const avg = reviews.reduce((sum, r) => sum + r.ratings.overall, 0) / count;
  const quality = reviews.reduce((sum, r) => sum + r.ratings.quality, 0) / count;
  const communication = reviews.reduce((sum, r) => sum + r.ratings.communication, 0) / count;
  const timeliness = reviews.reduce((sum, r) => sum + r.ratings.timeliness, 0) / count;

  return (
    <View style={styles.card}>
      <View style={styles.mainRow}>
        <Text style={styles.avgNumber}>{avg.toFixed(1)}</Text>
        <View>
          <Text style={styles.stars}>{renderStars(avg)}</Text>
          <Text style={styles.totalText}>{count} review{count !== 1 ? 's' : ''}</Text>
        </View>
      </View>
      <View style={styles.dimensionRow}>
        <Text style={styles.dimension}>
          Quality: <Text style={styles.dimensionValue}>{quality.toFixed(1)}</Text>
        </Text>
        <Text style={styles.dimension}>
          Communication: <Text style={styles.dimensionValue}>{communication.toFixed(1)}</Text>
        </Text>
        <Text style={styles.dimension}>
          Timeliness: <Text style={styles.dimensionValue}>{timeliness.toFixed(1)}</Text>
        </Text>
      </View>
    </View>
  );
});

// ─── ReviewCard ───────────────────────────────────────────────────────────────

export interface ReviewCardProps {
  review: SellerReview;
  onSendReply: (id: string, text: string) => Promise<void>;
  isReplying: boolean;
}

export const ReviewCard = React.memo(function ReviewCard({
  review,
  onSendReply,
  isReplying,
}: ReviewCardProps): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();

  const [expanded, setExpanded]       = useState(false);
  const [replyOpen, setReplyOpen]     = useState(false);
  const [replyText, setReplyText]     = useState('');

  const handleToggleExpand = useCallback(() => setExpanded((p) => !p), []);
  const handleOpenReply    = useCallback(() => setReplyOpen(true), []);
  const handleCancelReply  = useCallback(() => { setReplyOpen(false); setReplyText(''); }, []);

  const handleSendReply = useCallback(async () => {
    if (replyText.trim().length < 1) return;
    await onSendReply(review._id, replyText.trim());
    setReplyOpen(false);
    setReplyText('');
  }, [onSendReply, review._id, replyText]);

  const reviewerName = review.isAnonymous ? 'Anonymous' : (review.reviewerId.name || 'Customer');
  const avatarUri    = (!review.isAnonymous && review.reviewerId.avatarUrl) ? review.reviewerId.avatarUrl : undefined;

  const date = new Date(review.createdAt).toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.elevated,
      borderRadius: r.lg,
      borderWidth: 1,
      borderColor: colors.border,
      padding: sp.md,
      marginBottom: sp.sm,
      gap: sp.sm,
      ...elev.low,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: sp.sm,
    },
    nameMeta: { flex: 1 },
    reviewerName: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.textHigh,
    },
    dateMeta: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
    },
    stars: {
      ...typo.scale.body,
      color: colors.accent,
    },
    comment: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sans,
      color: colors.textHigh,
      lineHeight: 20,
    },
    readMore: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sansMed,
      color: colors.accent,
      marginTop: sp.xs,
    },
    productBadge: {
      alignSelf: 'flex-start',
      backgroundColor: colors.accentSubtle,
      borderRadius: r.sharp,
      paddingHorizontal: sp.sm,
      paddingVertical: 2,
    },
    productBadgeText: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sansMed,
      color: colors.accent,
    },
    dimensionsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: sp.sm,
    },
    dimText: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
    },
    dimValue: {
      fontFamily: typo.fonts.sansBold,
      color: colors.textHigh,
    },
    replyCard: {
      backgroundColor: colors.accentSubtle,
      borderRadius: r.md,
      padding: sp.md,
      borderLeftWidth: 3,
      borderLeftColor: colors.accent,
    },
    replyLabel: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sansBold,
      color: colors.accent,
      marginBottom: sp.xs,
    },
    replyText: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sans,
      color: colors.textHigh,
    },
    replyBtn: {
      alignSelf: 'flex-start',
    },
    replyInput: {
      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: r.sm,
      paddingHorizontal: sp.md,
      paddingVertical: sp.sm,
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sans,
      color: colors.textHigh,
      minHeight: 80,
      textAlignVertical: 'top',
    },
    replyActions: {
      flexDirection: 'row',
      gap: sp.sm,
      marginTop: sp.xs,
    },
  });

  return (
    <View style={styles.card}>
      {/* Header: avatar + name + date + stars */}
      <View style={styles.headerRow}>
        <Avatar uri={avatarUri} name={reviewerName} size={36} />
        <View style={styles.nameMeta}>
          <Text style={styles.reviewerName}>{reviewerName}</Text>
          <Text style={styles.dateMeta}>{date}</Text>
        </View>
        <Text style={styles.stars}>{renderStars(review.ratings.overall)}</Text>
      </View>

      {/* Product badge */}
      {review.targetType === 'product' && review.productTitle !== null && (
        <View style={styles.productBadge}>
          <Text style={styles.productBadgeText}>{review.productTitle}</Text>
        </View>
      )}

      {/* Comment with read-more toggle */}
      {review.comment.length > 0 && (
        <View>
          <Text
            style={styles.comment}
            numberOfLines={expanded ? undefined : 2}
          >
            "{review.comment}"
          </Text>
          {review.comment.length > 80 && (
            <Pressable onPress={handleToggleExpand}>
              <Text style={styles.readMore}>
                {expanded ? 'Show less' : 'Read more'}
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Dimension scores */}
      <View style={styles.dimensionsRow}>
        <Text style={styles.dimText}>
          Quality <Text style={styles.dimValue}>{review.ratings.quality}</Text>
        </Text>
        <Text style={[styles.dimText, { color: colors.border }]}>|</Text>
        <Text style={styles.dimText}>
          Comm <Text style={styles.dimValue}>{review.ratings.communication}</Text>
        </Text>
        <Text style={[styles.dimText, { color: colors.border }]}>|</Text>
        <Text style={styles.dimText}>
          Time <Text style={styles.dimValue}>{review.ratings.timeliness}</Text>
        </Text>
      </View>

      {/* Reply section */}
      {review.reply !== null ? (
        <View style={styles.replyCard}>
          <Text style={styles.replyLabel}>Your reply</Text>
          <Text style={styles.replyText}>{review.reply.text}</Text>
        </View>
      ) : replyOpen ? (
        <View>
          <TextInput
            style={styles.replyInput}
            value={replyText}
            onChangeText={setReplyText}
            placeholder="Write a professional reply visible to all customers…"
            placeholderTextColor={colors.textLow}
            multiline
            maxLength={500}
          />
          <View style={styles.replyActions}>
            <Button
              label="Cancel"
              variant="ghost"
              size="sm"
              onPress={handleCancelReply}
            />
            <Button
              label={isReplying ? 'Sending…' : 'Send Reply'}
              variant="primary"
              size="sm"
              onPress={() => { void handleSendReply(); }}
              loading={isReplying}
              disabled={replyText.trim().length < 1}
            />
          </View>
        </View>
      ) : (
        <Pressable onPress={handleOpenReply} style={styles.replyBtn}>
          <Text
            style={[
              typo.scale.caption,
              { fontFamily: typo.fonts.sansMed, color: colors.accent },
            ]}
          >
            Reply →
          </Text>
        </Pressable>
      )}
    </View>
  );
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SellerReviewsScreen(): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();
  const insets = useSafeAreaInsets();

  const { data, isLoading, isError, refetch } = useGetSellerReviewsQuery({
    page: 1,
    limit: 50,
  });

  const [replyToReview, { isLoading: isReplying }] = useReplyToReviewMutation();

  const handleSendReply = useCallback(
    async (id: string, text: string) => {
      await replyToReview({ id, text }).unwrap();
    },
    [replyToReview],
  );

  const renderReview = useCallback<ListRenderItem<SellerReview>>(
    ({ item }) => (
      <ReviewCard
        review={item}
        onSendReply={handleSendReply}
        isReplying={isReplying}
      />
    ),
    [handleSendReply, isReplying],
  );

  const reviews = data?.reviews ?? [];

  const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg },
    header: {
      backgroundColor: colors.navSolid,
      paddingTop: insets.top + sp.sm,
      paddingHorizontal: sp.base,
      paddingBottom: sp.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      ...elev.high,
    },
    headerTitle: {
      ...typo.scale.title3,
      fontFamily: typo.fonts.serifBold,
      color: colors.textHigh,
    },
    skeletonWrap: {
      padding: sp.base,
      gap: sp.sm,
    },
    listContent: {
      paddingHorizontal: sp.base,
      paddingBottom: sp['4xl'],
    },
  });

  const skeletons = [0, 1, 2];

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Customer Reviews</Text>
      </View>

      {isLoading ? (
        <View style={styles.skeletonWrap}>
          {skeletons.map((i) => (
            <Skeleton key={i} width="100%" height={160} radius={r.lg} />
          ))}
        </View>
      ) : isError ? (
        <View style={{ padding: sp.base }}>
          <ErrorBanner
            message="Could not load reviews. Please try again."
            onRetry={refetch}
          />
        </View>
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={<IconSymbol name="star.fill" size={32} color={colors.textLow} />}
          title="No reviews yet"
          message="Reviews from customers will appear here after delivery."
        />
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item._id}
          renderItem={renderReview}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
          ListHeaderComponent={<RatingSummaryCard reviews={reviews} />}
          ListHeaderComponentStyle={{ paddingTop: sp.base }}
        />
      )}
    </View>
  );
}
