import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { CARE_LABELS, FabricCategory, ShopProduct } from '@features/shop/shop.types';
import { useGetProductBySlugQuery, useGetProductsQuery } from '@services/shopApi';
import { useTheme } from '@shared/theme';

const { width: SW } = Dimensions.get('window');

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCountdown(ms: number): string {
  if (ms <= 0) return '';
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const sc = Math.floor((ms % 60_000) / 1_000);
  return `${h}:${String(m).padStart(2, '0')}:${String(sc).padStart(2, '0')}`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StarRating({
  rating,
  count,
  dimColor,
}: {
  rating: number;
  count: number;
  dimColor: string;
}) {
  const { typo, colors } = useTheme();
  const filled = Math.round(rating);
  return (
    <View style={s.row}>
      {[1, 2, 3, 4, 5].map(i => (
        <IconSymbol
          key={i}
          name={i <= filled ? 'star.fill' : 'star'}
          size={13}
          color={i <= filled ? '#F59E0B' : dimColor}
        />
      ))}
      <Text
        style={[
          typo.scale.caption,
          { color: colors.textMid, fontFamily: typo.fonts.sans, marginLeft: 5 },
        ]}
      >
        {rating.toFixed(1)} · {count} reviews
      </Text>
    </View>
  );
}

function Divider() {
  const { colors, sp } = useTheme();
  return <View style={[s.divider, { backgroundColor: colors.border, marginVertical: sp.base }]} />;
}

function HowItWorksSection() {
  const { colors, sp, r, typo } = useTheme();
  const steps = [
    { n: '01', title: 'Pick your fabric', desc: 'Browse our curated fabrics and select unstitched cloth.' },
    { n: '02', title: 'Choose a design', desc: 'Browse stitching designs or share your own reference.' },
    { n: '03', title: 'Select a tailor', desc: 'Pick verified, rated tailors. Share your measurements.' },
    { n: '04', title: 'Receive your outfit', desc: 'We coordinate pickup, stitching & doorstep delivery.' },
  ];

  return (
    <View style={{ marginTop: sp['2xl'] }}>
      <Text
        style={[
          typo.scale.label,
          { color: colors.textLow, fontFamily: typo.fonts.sansMed, letterSpacing: 1.5 },
        ]}
      >
        THE PROCESS
      </Text>
      <Text
        style={[
          typo.scale.title3,
          {
            color: colors.textHigh,
            fontFamily: typo.fonts.serifBold,
            marginTop: sp.xs,
            marginBottom: sp.lg,
          },
        ]}
      >
        From fabric to outfit in 4 steps
      </Text>
      <View style={{ gap: sp.sm }}>
        {([steps.slice(0, 2), steps.slice(2, 4)] as (typeof steps)[]).map((pair, ri) => (
          <View key={ri} style={{ flexDirection: 'row', gap: sp.sm }}>
            {pair.map(step => (
              <View
                key={step.n}
                style={[
                  s.stepCard,
                  {
                    flex: 1,
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderRadius: r.md,
                    padding: sp.md,
                  },
                ]}
              >
                <Text
                  style={[
                    typo.scale.title1,
                    {
                      color: colors.textHigh,
                      fontFamily: typo.fonts.display,
                      opacity: 0.12,
                      position: 'absolute',
                      right: sp.sm,
                      top: 0,
                    },
                  ]}
                >
                  {step.n}
                </Text>
                <Text
                  style={[
                    typo.scale.bodySmall,
                    { color: colors.textHigh, fontFamily: typo.fonts.sansBold, marginBottom: sp.xs },
                  ]}
                >
                  {step.title}
                </Text>
                <Text
                  style={[
                    typo.scale.caption,
                    { color: colors.textMid, fontFamily: typo.fonts.sans, lineHeight: 16 },
                  ]}
                >
                  {step.desc}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

function RelatedProductsSection({
  category,
  currentSlug,
}: {
  category: FabricCategory;
  currentSlug: string;
}) {
  const { colors, sp, r, typo } = useTheme();
  const router = useRouter();
  const { data } = useGetProductsQuery({ category, limit: 8 });
  const related = data?.products.filter(p => p.slug !== currentSlug).slice(0, 6) ?? [];

  if (related.length === 0) return null;

  return (
    <View style={{ marginTop: sp['2xl'] }}>
      <View style={[s.row, { justifyContent: 'space-between', marginBottom: sp.md }]}>
        <View>
          <Text
            style={[
              typo.scale.label,
              { color: colors.textLow, fontFamily: typo.fonts.sansMed, letterSpacing: 1.5 },
            ]}
          >
            YOU MIGHT ALSO LIKE
          </Text>
          <Text
            style={[
              typo.scale.subtitle,
              { color: colors.textHigh, fontFamily: typo.fonts.serifBold },
            ]}
          >
            Similar fabrics
          </Text>
        </View>
        <Pressable onPress={() => router.push('/(tabs)/shop' as any)}>
          <Text
            style={[
              typo.scale.caption,
              { color: colors.accent, fontFamily: typo.fonts.sansMed },
            ]}
          >
            View all →
          </Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: sp.sm, paddingBottom: sp.xs }}
      >
        {related.map(p => {
          const img = p.images?.[0]?.url ?? p.imageUrl;
          const price = p.pricePerSuit ?? p.pricePerMetre ?? 0;
          return (
            <Pressable
              key={p._id}
              onPress={() => router.push(`/shop/${p.slug}` as any)}
              style={[
                s.relatedCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: r.md,
                },
              ]}
            >
              <View
                style={[
                  s.relatedImg,
                  {
                    borderTopLeftRadius: r.md,
                    borderTopRightRadius: r.md,
                    backgroundColor: colors.panel,
                  },
                ]}
              >
                {img ? (
                  <Image
                    source={{ uri: img }}
                    style={StyleSheet.absoluteFillObject}
                    contentFit="cover"
                  />
                ) : null}
                {p.isFeatured && (
                  <View style={s.relatedFeatBadge}>
                    <Text style={{ color: '#fff', fontSize: 8, fontWeight: '700' }}>✦</Text>
                  </View>
                )}
              </View>
              <View style={{ padding: sp.sm }}>
                <Text
                  numberOfLines={1}
                  style={[
                    typo.scale.caption,
                    { color: colors.textHigh, fontFamily: typo.fonts.sansMed },
                  ]}
                >
                  {p.title}
                </Text>
                <Text
                  style={[
                    typo.scale.caption,
                    { color: colors.accent, fontFamily: typo.fonts.sansBold, marginTop: 2 },
                  ]}
                >
                  PKR {price.toLocaleString('en-PK')}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function ProductDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data: product, isLoading, isError, refetch } = useGetProductBySlugQuery(slug ?? '');
  const { colors, sp, r, typo } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const galleryRef = useRef<FlatList>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [qty, setQty] = useState(1);
  const [countdown, setCountdown] = useState('');

  const images: string[] = product
    ? (product.images?.map(i => i.url) ?? (product.imageUrl ? [product.imageUrl] : []))
    : [];

  const flashActive =
    product?.flashSalePrice != null &&
    product?.flashSaleEndsAt != null &&
    new Date(product.flashSaleEndsAt).getTime() > Date.now();

  useEffect(() => {
    if (!flashActive || !product?.flashSaleEndsAt) return;
    const tick = () => {
      const diff = new Date(product.flashSaleEndsAt!).getTime() - Date.now();
      setCountdown(formatCountdown(diff));
    };
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [flashActive, product?.flashSaleEndsAt]);

  const isOutOfStock = product?.status === 'out_of_stock' || (product?.stock ?? 1) === 0;

  const displayPrice = flashActive
    ? product!.flashSalePrice!
    : (product?.pricePerSuit ?? product?.pricePerMetre ?? product?.price ?? 0);

  const shopRef =
    product?.shopId && typeof product.shopId === 'object' ? product.shopId : null;

  const fabricDetails = product
    ? ([
        product.colour && { label: 'Colour', value: product.colour },
        product.composition && { label: 'Composition', value: product.composition },
        product.fabricWeight && { label: 'Weight', value: `${product.fabricWeight} g/m²` },
        product.careInstructions && {
          label: 'Care',
          value: CARE_LABELS[product.careInstructions],
        },
        product.origin && { label: 'Origin', value: product.origin },
      ].filter(Boolean) as Array<{ label: string; value: string }>)
    : [];

  // Stable refs required by FlatList
  const onViewRef = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]) setActiveIdx(viewableItems[0].index ?? 0);
    },
  );
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const handleThumbPress = (idx: number) => {
    setActiveIdx(idx);
    galleryRef.current?.scrollToIndex({ index: idx, animated: true });
  };

  const handleShare = async () => {
    if (!product) return;
    await Share.share({
      message: `Check out ${product.title} on Dhaggay — PKR ${displayPrice.toLocaleString('en-PK')}`,
      title: product.title,
    });
  };

  const trustItems = [
    { icon: 'checkmark.seal.fill' as const, label: 'Secure payment', sub: 'JazzCash · EasyPaisa · COD' },
    { icon: 'shippingbox.fill' as const, label: 'Free delivery', sub: 'Orders above PKR 5,000' },
    { icon: 'arrow.up.arrow.down' as const, label: 'Easy returns', sub: '7-day return policy' },
    { icon: 'star.fill' as const, label: 'Vetted tailors', sub: 'ID-verified & rated' },
  ];

  // ── Loading / Error states ─────────────────────────────────────────────────

  if (isLoading) {
    return (
      <View style={[s.centered, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[s.centered, { backgroundColor: colors.bg, paddingHorizontal: sp['2xl'] }]}>
        <IconSymbol name="exclamationmark.triangle" size={40} color={colors.textLow} />
        <Text style={[typo.scale.body, { color: colors.textMid, fontFamily: typo.fonts.sans, marginTop: sp.md, textAlign: 'center' }]}>
          Couldn't load this product.{'\n'}Check your connection and try again.
        </Text>
        <Pressable
          onPress={() => refetch()}
          style={[{ marginTop: sp.lg, backgroundColor: colors.accent, borderRadius: r.pill, paddingHorizontal: sp.xl, paddingVertical: sp.sm }]}
        >
          <Text style={[typo.scale.label, { color: colors.textOnAccent, fontFamily: typo.fonts.sansBold }]}>
            RETRY
          </Text>
        </Pressable>
        <Pressable onPress={() => router.back()} style={{ marginTop: sp.md }}>
          <Text style={[typo.scale.bodySmall, { color: colors.textLow, fontFamily: typo.fonts.sans }]}>
            ← Go back
          </Text>
        </Pressable>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[s.centered, { backgroundColor: colors.bg }]}>
        <Text style={[typo.scale.body, { color: colors.textMid, fontFamily: typo.fonts.sans }]}>
          Product not found.
        </Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: sp.base }}>
          <Text style={[typo.scale.bodySmall, { color: colors.accent, fontFamily: typo.fonts.sansMed }]}>
            ← Go back
          </Text>
        </Pressable>
      </View>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const galleryData = images.length > 0 ? images : [''];

  return (
    <>
      <ScrollView
        style={{ backgroundColor: colors.bg }}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Gallery ───────────────────────────────────────────────────── */}
        <View>
          <FlatList
            ref={galleryRef}
            data={galleryData}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => String(i)}
            onViewableItemsChanged={onViewRef.current}
            viewabilityConfig={viewConfigRef.current}
            renderItem={({ item: url }) => (
              <Pressable
                onPress={() => url ? setLightboxOpen(true) : undefined}
                style={{ width: SW, height: SW }}
              >
                <Image
                  source={url ? { uri: url } : require('@/assets/images/icon.png')}
                  style={{ width: SW, height: SW }}
                  contentFit="cover"
                />
              </Pressable>
            )}
          />

          {/* Out of stock dim overlay */}
          {isOutOfStock && (
            <View style={s.soldOutOverlay} pointerEvents="none">
              <Text style={s.soldOutText}>SOLD OUT</Text>
            </View>
          )}

          {/* Top controls: back + share */}
          <View
            style={[s.galleryTopRow, { top: insets.top + sp.sm }]}
            pointerEvents="box-none"
          >
            <Pressable
              onPress={() => router.back()}
              style={[s.overlayBtn, { backgroundColor: 'rgba(0,0,0,0.38)' }]}
            >
              <IconSymbol name="chevron.left" size={20} color="#fff" />
            </Pressable>
            <Pressable
              onPress={handleShare}
              style={[s.overlayBtn, { backgroundColor: 'rgba(0,0,0,0.38)' }]}
            >
              <IconSymbol name="square.and.arrow.up" size={17} color="#fff" />
            </Pressable>
          </View>

          {/* Bottom-left: featured badge */}
          {product.isFeatured && (
            <View
              style={[s.featuredBadge, { bottom: images.length > 1 ? 36 : 12 }]}
              pointerEvents="none"
            >
              <Text style={s.featuredText}>✦ FEATURED</Text>
            </View>
          )}

          {/* Bottom-right: flash sale countdown */}
          {flashActive && countdown ? (
            <View
              style={[
                s.flashBadge,
                {
                  bottom: images.length > 1 ? 36 : 12,
                  backgroundColor: colors.error,
                },
              ]}
              pointerEvents="none"
            >
              <Text style={[s.flashText, { color: '#fff' }]}>FLASH · {countdown}</Text>
            </View>
          ) : null}

          {/* Dot indicators */}
          {images.length > 1 && (
            <View style={s.dots} pointerEvents="none">
              {images.map((_, i) => (
                <View
                  key={i}
                  style={[
                    s.dot,
                    {
                      backgroundColor:
                        i === activeIdx ? '#fff' : 'rgba(255,255,255,0.45)',
                      width: i === activeIdx ? 18 : 6,
                    },
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ backgroundColor: colors.surface }}
          >
            {images.map((url, i) => (
              <Pressable key={i} onPress={() => handleThumbPress(i)}>
                <Image
                  source={{ uri: url }}
                  style={[
                    s.thumb,
                    { borderColor: i === activeIdx ? colors.accent : colors.border },
                  ]}
                  contentFit="cover"
                />
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* ── Content ───────────────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: sp.base, paddingTop: sp.base }}>

          {/* Category + gender row */}
          <View style={[s.row, { gap: sp.sm }]}>
            <Text
              style={[
                typo.scale.label,
                { color: colors.accentMid, fontFamily: typo.fonts.sansMed },
              ]}
            >
              {product.category.toUpperCase()}
            </Text>
            {product.targetGender && (
              <View
                style={[
                  s.chip,
                  { backgroundColor: colors.accentSubtle, borderRadius: r.sharp },
                ]}
              >
                <Text
                  style={[
                    typo.scale.label,
                    { color: colors.accent, fontFamily: typo.fonts.sansMed },
                  ]}
                >
                  {product.targetGender.toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          {/* Title */}
          <Text
            style={[
              typo.scale.title2,
              {
                color: colors.textHigh,
                fontFamily: typo.fonts.serifBold,
                marginTop: sp.xs,
              },
            ]}
          >
            {product.title}
          </Text>

          {/* Rating */}
          <View style={{ marginTop: sp.xs }}>
            <StarRating
              rating={product.rating}
              count={product.reviewCount}
              dimColor={colors.textLow}
            />
          </View>

          <Divider />

          {/* Shop card */}
          {shopRef && (
            <>
              <Pressable
                onPress={() => router.push(`/store/${shopRef.slug}` as any)}
                style={[
                  s.shopRow,
                  {
                    backgroundColor: colors.surface,
                    borderRadius: r.md,
                    borderColor: colors.border,
                  },
                ]}
              >
                {shopRef.logo?.url ? (
                  <Image
                    source={{ uri: shopRef.logo.url }}
                    style={s.shopLogo}
                    contentFit="contain"
                  />
                ) : (
                  <View
                    style={[
                      s.shopLogoPlaceholder,
                      { backgroundColor: colors.accent },
                    ]}
                  >
                    <Text
                      style={{
                        color: colors.textOnAccent,
                        fontSize: 14,
                        fontFamily: typo.fonts.sansBold,
                      }}
                    >
                      {shopRef.name[0]?.toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <View style={[s.row, { gap: 4 }]}>
                    <Text
                      style={[
                        typo.scale.bodySmall,
                        { color: colors.textHigh, fontFamily: typo.fonts.sansBold },
                      ]}
                    >
                      {shopRef.name}
                    </Text>
                    {shopRef.isVerified && (
                      <IconSymbol name="checkmark.seal.fill" size={13} color={colors.accent} />
                    )}
                  </View>
                  {shopRef.address?.city && (
                    <Text
                      style={[
                        typo.scale.caption,
                        { color: colors.textMid, fontFamily: typo.fonts.sans },
                      ]}
                    >
                      {shopRef.address.city}
                    </Text>
                  )}
                </View>
                <IconSymbol name="chevron.right" size={14} color={colors.textLow} />
              </Pressable>
              <Divider />
            </>
          )}

          {/* Price block */}
          <View
            style={[s.row, { justifyContent: 'space-between', alignItems: 'flex-start' }]}
          >
            {product.pricePerSuit != null && (
              <View>
                <Text
                  style={[
                    typo.scale.label,
                    { color: colors.textLow, fontFamily: typo.fonts.sansMed, marginBottom: 2 },
                  ]}
                >
                  PER SUIT
                </Text>
                <Text
                  style={[
                    typo.scale.title2,
                    { color: colors.accent, fontFamily: typo.fonts.serifBold },
                  ]}
                >
                  PKR{' '}
                  {(flashActive
                    ? product.flashSalePrice!
                    : product.pricePerSuit
                  ).toLocaleString('en-PK')}
                </Text>
                {flashActive && (
                  <Text
                    style={[
                      typo.scale.bodySmall,
                      {
                        color: colors.textLow,
                        fontFamily: typo.fonts.sans,
                        textDecorationLine: 'line-through',
                      },
                    ]}
                  >
                    PKR {product.pricePerSuit.toLocaleString('en-PK')}
                  </Text>
                )}
              </View>
            )}
            {product.pricePerMetre != null && (
              <View style={{ alignItems: 'flex-end' }}>
                <Text
                  style={[
                    typo.scale.label,
                    { color: colors.textLow, fontFamily: typo.fonts.sansMed, marginBottom: 2 },
                  ]}
                >
                  PER METRE
                </Text>
                <Text
                  style={[
                    typo.scale.subtitle,
                    { color: colors.textHigh, fontFamily: typo.fonts.sansBold },
                  ]}
                >
                  PKR {product.pricePerMetre.toLocaleString('en-PK')}
                </Text>
              </View>
            )}
          </View>

          {/* Stitching note */}
          <View style={[s.row, { marginTop: sp.xs, gap: 4 }]}>
            <IconSymbol name="scissors" size={12} color={colors.textLow} />
            <Text
              style={[
                typo.scale.caption,
                { color: colors.textLow, fontFamily: typo.fonts.sans },
              ]}
            >
              + Stitching from PKR 1,500
            </Text>
          </View>

          <Divider />

          {/* Occasion tags */}
          {product.occasion && product.occasion.length > 0 && (
            <>
              <View style={[s.tagsRow, { marginBottom: sp.sm }]}>
                {product.occasion.map(occ => (
                  <View
                    key={occ}
                    style={[
                      s.tag,
                      {
                        backgroundColor: colors.accentSubtle,
                        borderRadius: r.sharp,
                        paddingHorizontal: sp.sm,
                        paddingVertical: 3,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        typo.scale.label,
                        { color: colors.accent, fontFamily: typo.fonts.sansMed },
                      ]}
                    >
                      {occ.toUpperCase()}
                    </Text>
                  </View>
                ))}
              </View>
              <Divider />
            </>
          )}

          {/* Fabric details card */}
          {fabricDetails.length > 0 && (
            <>
              <View
                style={[
                  s.detailsBlock,
                  {
                    backgroundColor: colors.surface,
                    borderRadius: r.md,
                    borderColor: colors.border,
                    padding: sp.md,
                  },
                ]}
              >
                <Text
                  style={[
                    typo.scale.label,
                    {
                      color: colors.textMid,
                      fontFamily: typo.fonts.sansBold,
                      letterSpacing: 1.5,
                      marginBottom: sp.sm,
                    },
                  ]}
                >
                  FABRIC DETAILS
                </Text>
                {fabricDetails.map((d, idx) => (
                  <View
                    key={d.label}
                    style={[
                      s.detailRow,
                      {
                        borderTopWidth: idx === 0 ? 0 : StyleSheet.hairlineWidth,
                        borderTopColor: colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        typo.scale.bodySmall,
                        { color: colors.textMid, fontFamily: typo.fonts.sans, width: 100 },
                      ]}
                    >
                      {d.label}
                    </Text>
                    <Text
                      style={[
                        typo.scale.bodySmall,
                        {
                          color: colors.textHigh,
                          fontFamily: typo.fonts.sansMed,
                          flex: 1,
                          textAlign: 'right',
                        },
                      ]}
                    >
                      {d.value}
                    </Text>
                  </View>
                ))}
              </View>
              <View style={{ height: sp.base }} />
            </>
          )}

          {/* Stock status + qty stepper inline */}
          <View style={[s.row, { justifyContent: 'space-between' }]}>
            <View style={[s.row, { gap: 6 }]}>
              <View
                style={[
                  s.stockDot,
                  { backgroundColor: isOutOfStock ? colors.error : colors.success },
                ]}
              />
              <Text
                style={[
                  typo.scale.bodySmall,
                  {
                    color: isOutOfStock ? colors.error : colors.success,
                    fontFamily: typo.fonts.sansMed,
                  },
                ]}
              >
                {isOutOfStock
                  ? 'Out of stock'
                  : `In stock${product.stock ? ` (${product.stock} units)` : ''}`}
              </Text>
            </View>

            {!isOutOfStock && (
              <View style={[s.row, { gap: sp.sm }]}>
                <Pressable
                  onPress={() => setQty(q => Math.max(1, q - 1))}
                  style={[s.qtyBtn, { backgroundColor: colors.chipBg, borderRadius: r.sm }]}
                >
                  <IconSymbol name="minus" size={14} color={colors.textHigh} />
                </Pressable>
                <Text
                  style={[
                    typo.scale.body,
                    {
                      color: colors.textHigh,
                      fontFamily: typo.fonts.sansBold,
                      minWidth: 24,
                      textAlign: 'center',
                    },
                  ]}
                >
                  {qty}
                </Text>
                <Pressable
                  onPress={() => setQty(q => Math.min(product.stock ?? 999, q + 1))}
                  style={[s.qtyBtn, { backgroundColor: colors.chipBg, borderRadius: r.sm }]}
                >
                  <IconSymbol name="plus" size={14} color={colors.textHigh} />
                </Pressable>
              </View>
            )}
          </View>

          <Divider />

          {/* Trust strip — 2×2 grid */}
          <View style={{ gap: sp.sm }}>
            {([trustItems.slice(0, 2), trustItems.slice(2, 4)] as (typeof trustItems)[]).map(
              (pair, ri) => (
                <View key={ri} style={{ flexDirection: 'row', gap: sp.sm }}>
                  {pair.map(t => (
                    <View
                      key={t.label}
                      style={[
                        s.trustCard,
                        {
                          flex: 1,
                          backgroundColor: colors.surface,
                          borderRadius: r.md,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <View
                        style={[
                          s.trustIconWrap,
                          { backgroundColor: colors.accentSubtle },
                        ]}
                      >
                        <IconSymbol name={t.icon} size={14} color={colors.accent} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            typo.scale.caption,
                            { color: colors.textHigh, fontFamily: typo.fonts.sansBold },
                          ]}
                        >
                          {t.label}
                        </Text>
                        <Text
                          style={[
                            typo.scale.caption,
                            {
                              color: colors.textLow,
                              fontFamily: typo.fonts.sans,
                              fontSize: 10,
                              marginTop: 1,
                            },
                          ]}
                        >
                          {t.sub}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              ),
            )}
          </View>

          {/* Delivery estimate */}
          <View
            style={[
              s.deliveryCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: r.md,
                marginTop: sp.sm,
              },
            ]}
          >
            <IconSymbol name="shippingbox.fill" size={22} color={colors.accent} />
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  typo.scale.bodySmall,
                  { color: colors.textHigh, fontFamily: typo.fonts.sansBold },
                ]}
              >
                Estimated delivery
              </Text>
              <Text
                style={[
                  typo.scale.caption,
                  { color: colors.textMid, fontFamily: typo.fonts.sans, marginTop: 2 },
                ]}
              >
                Fabric 2–4 days · Stitching 5–7 days · ~10 days total
              </Text>
            </View>
          </View>

          {/* How to order */}
          <HowItWorksSection />

          {/* Related products */}
          <RelatedProductsSection category={product.category} currentSlug={product.slug} />

          <View style={{ height: sp.xl }} />
        </View>
      </ScrollView>

      {/* ── Sticky CTA bar ────────────────────────────────────────────────── */}
      <View
        style={[
          s.ctaBar,
          {
            backgroundColor: colors.navSolid,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + sp.sm,
            paddingHorizontal: sp.base,
            paddingTop: sp.md,
            gap: sp.sm,
          },
        ]}
      >
        <Pressable
          disabled={isOutOfStock}
          style={[
            s.ctaBtn,
            {
              backgroundColor: isOutOfStock ? colors.panel : 'transparent',
              borderRadius: r.pill,
              borderWidth: 1.5,
              borderColor: isOutOfStock ? colors.border : colors.accent,
            },
          ]}
        >
          <Text
            style={[
              typo.scale.label,
              {
                color: isOutOfStock ? colors.textLow : colors.accent,
                fontFamily: typo.fonts.sansBold,
              },
            ]}
          >
            ADD TO CART
          </Text>
        </Pressable>
        <Pressable
          disabled={isOutOfStock}
          style={[
            s.ctaBtn,
            {
              backgroundColor: isOutOfStock ? colors.panel : colors.accent,
              borderRadius: r.pill,
            },
          ]}
        >
          <Text
            style={[
              typo.scale.label,
              {
                color: isOutOfStock ? colors.textLow : colors.textOnAccent,
                fontFamily: typo.fonts.sansBold,
              },
            ]}
          >
            ORDER & GET STITCHED
          </Text>
        </Pressable>
      </View>

      {/* ── Lightbox ──────────────────────────────────────────────────────── */}
      <Modal visible={lightboxOpen} transparent animationType="fade">
        <Pressable
          style={[s.lightbox, { backgroundColor: 'rgba(0,0,0,0.95)' }]}
          onPress={() => setLightboxOpen(false)}
        >
          {images[activeIdx] ? (
            <Image
              source={{ uri: images[activeIdx] }}
              style={{ width: SW, height: SW }}
              contentFit="contain"
            />
          ) : null}
          <Pressable
            onPress={() => setLightboxOpen(false)}
            style={[
              s.overlayBtn,
              {
                position: 'absolute',
                top: insets.top + sp.sm,
                right: sp.base,
                backgroundColor: 'rgba(255,255,255,0.15)',
              },
            ]}
          >
            <IconSymbol name="xmark" size={18} color="#fff" />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center' },
  divider: { height: 1 },

  // Gallery overlays
  galleryTopRow: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  overlayBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soldOutOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.38)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soldOutText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 3,
  },
  featuredBadge: {
    position: 'absolute',
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#B5872A',
    borderRadius: 999,
  },
  featuredText: { color: '#fff', fontSize: 9, fontWeight: '700', letterSpacing: 1.5 },
  flashBadge: {
    position: 'absolute',
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  flashText: { fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    gap: 4,
  },
  dot: { height: 6, borderRadius: 3 },
  thumb: { width: 64, height: 64, margin: 6, borderWidth: 2, borderRadius: 6 },

  // Chips / tags
  chip: { paddingHorizontal: 8, paddingVertical: 3 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {},

  // Shop card
  shopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    padding: 10,
    marginBottom: 0,
  },
  shopLogo: { width: 36, height: 36, borderRadius: 6, marginRight: 10 },
  shopLogoPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 6,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Fabric details
  detailsBlock: { borderWidth: 1 },
  detailRow: { flexDirection: 'row', paddingVertical: 6 },

  // Stock / qty
  stockDot: { width: 8, height: 8, borderRadius: 4 },
  qtyBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },

  // Trust 2×2
  trustCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderWidth: 1,
  },
  trustIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Delivery
  deliveryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderWidth: 1,
  },

  // How it works
  stepCard: { borderWidth: 1, overflow: 'hidden', minHeight: 90 },

  // Related products
  relatedCard: { width: 136, borderWidth: 1, overflow: 'hidden' },
  relatedImg: { width: 136, height: 164, overflow: 'hidden' },
  relatedFeatBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B5872A',
  },

  // CTAs
  ctaBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    borderTopWidth: 1,
  },
  ctaBtn: { flex: 1, alignItems: 'center', paddingVertical: 14 },

  // Lightbox
  lightbox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
