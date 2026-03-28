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
    },
    qtyBtn: {
      width: 32,
      height: 32,
      borderRadius: r.sm,
      backgroundColor: colors.elevated,
      alignItems: 'center',
      justifyContent: 'center',
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
      gap: sp.sm,
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
            style={[styles.qtyBtn, item.quantity <= 1 && { opacity: 0.4 }]}
            onPress={handleDecrease}
            disabled={item.quantity <= 1}
          >
            <IconSymbol name="minus" size={14} color={colors.textHigh} />
          </Pressable>
          <Text style={styles.qtyText}>{item.quantity}</Text>
          <Pressable
            style={[styles.qtyBtn, item.quantity >= item.stock && { opacity: 0.4 }]}
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

export default function CartTabScreen(): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const items = useAppSelector(s => s.cart?.items ?? []);
  const subtotal = useAppSelector(selectCartTotal);

  const platformFee = useMemo(() => Math.round(subtotal * PLATFORM_FEE_RATE), [subtotal]);
  const total = useMemo(() => subtotal + DELIVERY_FEE + platformFee, [subtotal, platformFee]);

  const handleRemove = useCallback((productId: string) => {
    dispatch(removeFromCart(productId));
  }, [dispatch]);

  const handleQuantityChange = useCallback((productId: string, quantity: number) => {
    dispatch(updateQuantity({ productId, quantity }));
  }, [dispatch]);

  const handleClearCart = useCallback(() => {
    dispatch(clearCart());
  }, [dispatch]);

  const handleProceed = useCallback(() => {
    router.push('/orders/new' as never);
  }, [router]);

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

  const styles = StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    header: {
      backgroundColor: colors.navSolid,
      paddingTop: insets.top + sp.sm,
      paddingHorizontal: sp.base,
      paddingBottom: sp.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      ...elev.high,
    },
    headerTitle: {
      ...typo.scale.title2,
      fontFamily: typo.fonts.serifBold,
      color: colors.textHigh,
    },
    clearBtn: {
      paddingHorizontal: sp.sm,
      paddingVertical: sp.xs,
    },
    clearText: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansMed,
      color: colors.error,
    },
    headerSpacer: {
      width: 60,
    },
    emptyWrapper: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
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
    listContent: {
      paddingBottom: sp.sm,
    },
  });

  if (items.length === 0) {
    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>Cart</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.emptyWrapper}>
          <EmptyState
            icon={<IconSymbol name="cart.fill" size={40} color={colors.textLow} />}
            title="Your cart is empty"
            message="Start browsing fabrics"
            action={{ label: 'Browse Shop', onPress: () => router.push('/(tabs)/shop' as never) }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Cart</Text>
        <Pressable style={styles.clearBtn} onPress={handleClearCart}>
          <Text style={styles.clearText}>Clear</Text>
        </Pressable>
      </View>

      {/* Items */}
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
        <Pressable style={styles.proceedBtn} onPress={handleProceed}>
          <Text style={styles.proceedText}>PROCEED TO ORDER</Text>
        </Pressable>
      </View>
    </View>
  );
}
