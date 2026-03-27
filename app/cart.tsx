import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import {
  FlatList,
  ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@shared/components/ui/icon-symbol';
import { ScreenHeader } from '@shared/components/ui/ScreenHeader';
import { EmptyState } from '@shared/components/ui/EmptyState';
import { useTheme } from '@shared/theme';
import { useAppDispatch, useAppSelector } from '@store/index';
import {
  clearCart,
  removeFromCart,
  updateQuantity,
  selectCartTotal,
} from '@store/cartSlice';
import type { CartItem } from '@store/cartSlice';
import { formatPkr } from '@shared/utils';

const DELIVERY_FEE = 200;
const PLATFORM_FEE_RATE = 0.17;

interface CartItemRowProps {
  item: CartItem;
  onRemove: (productId: string) => void;
  onQuantityChange: (productId: string, quantity: number) => void;
}

function CartItemRow({ item, onRemove, onQuantityChange }: CartItemRowProps): React.JSX.Element {
  const { colors, sp, r, typo } = useTheme();

  const handleDecrease = useCallback(() => {
    if (item.quantity > 1) {
      onQuantityChange(item.productId, item.quantity - 1);
    }
  }, [item.productId, item.quantity, onQuantityChange]);

  const handleIncrease = useCallback(() => {
    onQuantityChange(item.productId, item.quantity + 1);
  }, [item.productId, item.quantity, onQuantityChange]);

  const handleRemove = useCallback(() => {
    onRemove(item.productId);
  }, [item.productId, onRemove]);

  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: sp.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
      gap: sp.md,
    },
    image: {
      width: 48,
      height: 48,
      borderRadius: r.sm,
      backgroundColor: colors.panel,
      flexShrink: 0,
    },
    info: {
      flex: 1,
      gap: 2,
    },
    title: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.serifBold,
      color: colors.textHigh,
    },
    category: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sansMed,
      color: colors.accent,
    },
    shopName: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textLow,
    },
    qtyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: sp.xs,
      marginTop: sp.xs,
    },
    qtyBtn: {
      width: 32,
      height: 32,
      borderRadius: r.sm,
      backgroundColor: colors.elevated,
      alignItems: 'center',
      justifyContent: 'center',
    },
    qtyBtnDisabled: {
      opacity: 0.4,
    },
    qtyText: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.textHigh,
      minWidth: 24,
      textAlign: 'center',
    },
    rightCol: {
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: sp.sm,
      flexShrink: 0,
    },
    price: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.textHigh,
    },
    deleteBtn: {
      padding: sp.xs,
    },
  });

  return (
    <View style={styles.row}>
      {item.imageUrl !== null ? (
        <Image source={{ uri: item.imageUrl }} style={styles.image} contentFit="cover" />
      ) : (
        <View style={styles.image} />
      )}

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.shopName}>{item.shopName}</Text>
        <View style={styles.qtyRow}>
          <Pressable
            style={[styles.qtyBtn, item.quantity <= 1 && styles.qtyBtnDisabled]}
            onPress={handleDecrease}
            disabled={item.quantity <= 1}
          >
            <IconSymbol name="minus" size={14} color={colors.textHigh} />
          </Pressable>
          <Text style={styles.qtyText}>{item.quantity}</Text>
          <Pressable
            style={[styles.qtyBtn, item.quantity >= item.stock && styles.qtyBtnDisabled]}
            onPress={handleIncrease}
            disabled={item.quantity >= item.stock}
          >
            <IconSymbol name="plus" size={14} color={colors.textHigh} />
          </Pressable>
        </View>
      </View>

      <View style={styles.rightCol}>
        <Text style={styles.price}>{formatPkr(item.pricePerSuit * item.quantity)}</Text>
        <Pressable style={styles.deleteBtn} onPress={handleRemove} hitSlop={8}>
          <IconSymbol name="trash" size={18} color={colors.error} />
        </Pressable>
      </View>
    </View>
  );
}

export default function CartPageScreen(): React.JSX.Element {
  const { colors, sp, r, typo } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const items = useAppSelector(s => s.cart?.items ?? []);
  const subtotal = useAppSelector(selectCartTotal);

  const platformFee = useMemo(() => Math.round(subtotal * PLATFORM_FEE_RATE), [subtotal]);
  const total = useMemo(() => subtotal + DELIVERY_FEE + platformFee, [subtotal, platformFee]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleClearCart = useCallback(() => {
    dispatch(clearCart());
  }, [dispatch]);

  const handleRemove = useCallback((productId: string) => {
    dispatch(removeFromCart(productId));
  }, [dispatch]);

  const handleQuantityChange = useCallback((productId: string, quantity: number) => {
    dispatch(updateQuantity({ productId, quantity }));
  }, [dispatch]);

  const renderItem = useCallback<ListRenderItem<CartItem>>(
    ({ item }) => (
      <CartItemRow
        item={item}
        onRemove={handleRemove}
        onQuantityChange={handleQuantityChange}
      />
    ),
    [handleRemove, handleQuantityChange],
  );

  const clearAction = items.length > 0 ? (
    <Pressable onPress={handleClearCart} hitSlop={8} style={{ paddingHorizontal: sp.sm }}>
      <Text style={{ ...typo.scale.bodySmall, fontFamily: typo.fonts.sansMed, color: colors.error }}>
        Clear
      </Text>
    </Pressable>
  ) : undefined;

  const styles = StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    emptyWrapper: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    listContent: {
      paddingBottom: sp.sm,
    },
    summaryBar: {
      backgroundColor: colors.navSolid,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      padding: sp.base,
      paddingBottom: insets.bottom + sp.base,
      gap: sp.sm,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    summaryLabel: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
    },
    summaryValue: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
    },
    totalLabel: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.textHigh,
    },
    totalValue: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.textHigh,
    },
    proceedBtn: {
      backgroundColor: colors.accent,
      borderRadius: r.pill,
      height: 52,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: sp.xs,
    },
    proceedText: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansBold,
      color: colors.textOnAccent,
    },
  });

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="My Cart"
        onBack={handleBack}
        rightAction={clearAction}
      />

      {items.length === 0 ? (
        <View style={styles.emptyWrapper}>
          <EmptyState
            icon={<IconSymbol name="cart.fill" size={40} color={colors.textLow} />}
            title="Your cart is empty"
            message="Start browsing fabrics"
            action={{ label: 'Browse Shop', onPress: () => router.push('/(tabs)/shop' as never) }}
          />
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={item => item.productId}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />

          {/* Order summary */}
          <View style={styles.summaryBar}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatPkr(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery</Text>
              <Text style={styles.summaryValue}>{formatPkr(DELIVERY_FEE)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Platform fee (17%)</Text>
              <Text style={styles.summaryValue}>{formatPkr(platformFee)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatPkr(total)}</Text>
            </View>
            <Pressable style={styles.proceedBtn}>
              <Text style={styles.proceedText}>PROCEED TO ORDER</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}
