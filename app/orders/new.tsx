import React, { memo, useCallback, useMemo, useReducer, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { ListRenderItem } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@shared/theme';
import {
  Button,
  EmptyState,
  ErrorBanner,
  IconSymbol,
  Input,
  ScreenHeader,
  Skeleton,
} from '@shared/components/ui';
import { formatPkr } from '@shared/utils';
import { useAppDispatch, useAppSelector } from '@store/index';
import {
  clearCart,
  removeFromCart,
  selectCartItems,
  updateQuantity,
} from '@store/cartSlice';
import type { CartItem } from '@store/cartSlice';
import {
  useCreateMeasurementMutation,
  useGetMeasurementsQuery,
} from '@services/measurementsApi';
import type { Measurement } from '@services/measurementsApi';
import { useAddAddressMutation, useGetAddressesQuery } from '@services/userApi';
import type { Address } from '@features/dashboard/dashboard.types';
import { usePlaceOrderMutation } from '@services/ordersApi';
import type { OrderItemPayload, PlaceOrderPayload } from '@services/ordersApi';
import { useGetDesignsQuery } from '@services/designsApi';
import type { Design } from '@services/designsApi';
import { useGetTailorsQuery } from '@services/tailorsApi';
import type { Tailor } from '@services/tailorsApi';

// ─── Wizard State ─────────────────────────────────────────────────────────────

interface ItemConfig {
  designId?: string;
  designTitle?: string;
  designCategory?: string;
  tailorId?: string;
  tailorName?: string;
  stitchingFee?: number;
}

interface DeliveryAddress {
  line1: string;
  city: string;
  area: string;
  phone: string;
}

interface WizardState {
  step: 1 | 2 | 3 | 4 | 5;
  itemConfigs: Record<string, ItemConfig>;
  measurementId: string | null;
  deliveryAddress: DeliveryAddress | null;
  paymentMethod: 'jazzcash' | 'easypaisa' | 'cod';
  isRushOrder: boolean;
  isGift: boolean;
  giftMessage: string;
}

type WizardAction =
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'GO_TO'; step: 1 | 2 | 3 | 4 | 5 }
  | { type: 'SET_ITEM_CONFIG'; productId: string; config: ItemConfig }
  | { type: 'SET_MEASUREMENT'; measurementId: string }
  | { type: 'SET_ADDRESS'; address: DeliveryAddress }
  | { type: 'SET_PAYMENT'; method: WizardState['paymentMethod'] }
  | { type: 'TOGGLE_RUSH' }
  | { type: 'TOGGLE_GIFT' }
  | { type: 'SET_GIFT_MESSAGE'; message: string };

const initialWizardState: WizardState = {
  step: 1,
  itemConfigs: {},
  measurementId: null,
  deliveryAddress: null,
  paymentMethod: 'cod',
  isRushOrder: false,
  isGift: false,
  giftMessage: '',
};

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'NEXT':
      return state.step < 5
        ? { ...state, step: (state.step + 1) as WizardState['step'] }
        : state;
    case 'PREV':
      return state.step > 1
        ? { ...state, step: (state.step - 1) as WizardState['step'] }
        : state;
    case 'GO_TO':
      return { ...state, step: action.step };
    case 'SET_ITEM_CONFIG':
      return {
        ...state,
        itemConfigs: { ...state.itemConfigs, [action.productId]: action.config },
      };
    case 'SET_MEASUREMENT':
      return { ...state, measurementId: action.measurementId };
    case 'SET_ADDRESS':
      return { ...state, deliveryAddress: action.address };
    case 'SET_PAYMENT':
      return { ...state, paymentMethod: action.method };
    case 'TOGGLE_RUSH':
      return { ...state, isRushOrder: !state.isRushOrder };
    case 'TOGGLE_GIFT':
      return { ...state, isGift: !state.isGift };
    case 'SET_GIFT_MESSAGE':
      return { ...state, giftMessage: action.message };
  }
}

// ─── Step Labels ──────────────────────────────────────────────────────────────

const STEP_LABELS = ['Cart', 'Design', 'Measurements', 'Delivery', 'Review'] as const;

// ─── Progress Indicator ───────────────────────────────────────────────────────

interface ProgressProps {
  currentStep: 1 | 2 | 3 | 4 | 5;
}

const StepProgress = memo(function StepProgress({ currentStep }: ProgressProps): React.JSX.Element {
  const { colors, sp, r, typo } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: sp.md,
      paddingHorizontal: sp.base,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    stepItem: {
      alignItems: 'center',
      flex: 1,
    },
    dot: {
      width: 28,
      height: 28,
      borderRadius: r.pill,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: sp.xs,
    },
    dotNumber: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sansBold,
    },
    label: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sans,
      textAlign: 'center',
    },
    connector: {
      height: 2,
      flex: 1,
      marginBottom: sp.lg,
    },
  });

  return (
    <View style={styles.container}>
      {STEP_LABELS.map((label, idx) => {
        const stepNum = (idx + 1) as 1 | 2 | 3 | 4 | 5;
        const isCompleted = stepNum < currentStep;
        const isActive = stepNum === currentStep;

        const dotBg = isCompleted || isActive ? colors.accent : colors.panel;
        const dotTextColor = isCompleted || isActive ? colors.textOnAccent : colors.textLow;
        const labelColor = isActive ? colors.accent : isCompleted ? colors.textMid : colors.textLow;

        return (
          <React.Fragment key={label}>
            {idx > 0 && (
              <View
                style={[
                  styles.connector,
                  { backgroundColor: isCompleted ? colors.accent : colors.border },
                ]}
              />
            )}
            <View style={styles.stepItem}>
              <View style={[styles.dot, { backgroundColor: dotBg }]}>
                {isCompleted ? (
                  <IconSymbol name="checkmark" size={14} color={colors.textOnAccent} />
                ) : (
                  <Text style={[styles.dotNumber, { color: dotTextColor }]}>{stepNum}</Text>
                )}
              </View>
              <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
});

// ─── Step 1: Cart Review ──────────────────────────────────────────────────────

interface Step1Props {
  cartItems: CartItem[];
  onContinue: () => void;
  dispatch: React.Dispatch<WizardAction>;
}

interface CartRowProps {
  item: CartItem;
  onIncrement: (productId: string, qty: number) => void;
  onDecrement: (productId: string, qty: number) => void;
  onRemove: (productId: string) => void;
}

const CartRow = memo(function CartRow({
  item,
  onIncrement,
  onDecrement,
  onRemove,
}: CartRowProps): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      padding: sp.md,
      marginBottom: sp.md,
      ...elev.low,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: sp.md,
    },
    image: {
      width: 72,
      height: 72,
      borderRadius: r.sm,
      backgroundColor: colors.panel,
    },
    info: {
      flex: 1,
    },
    title: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.textHigh,
      marginBottom: sp.xs,
    },
    category: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
      marginBottom: sp.xs,
    },
    price: {
      ...typo.scale.price,
      fontFamily: typo.fonts.sansBold,
      color: colors.accent,
    },
    qtyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: sp.sm,
      gap: sp.sm,
    },
    qtyBtn: {
      width: 32,
      height: 32,
      borderRadius: r.sm,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    qtyText: {
      ...typo.scale.body,
      fontFamily: typo.fonts.sansBold,
      color: colors.textHigh,
      minWidth: 24,
      textAlign: 'center',
    },
    removeBtn: {
      padding: sp.xs,
    },
  });

  const handleIncrement = useCallback(() => {
    onIncrement(item.productId, item.quantity + 1);
  }, [item.productId, item.quantity, onIncrement]);

  const handleDecrement = useCallback(() => {
    onDecrement(item.productId, item.quantity - 1);
  }, [item.productId, item.quantity, onDecrement]);

  const handleRemove = useCallback(() => {
    onRemove(item.productId);
  }, [item.productId, onRemove]);

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        {item.imageUrl !== null ? (
          <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.image} />
        )}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.price}>{formatPkr(item.pricePerSuit * item.quantity)}</Text>
          <View style={styles.qtyRow}>
            <Pressable
              style={styles.qtyBtn}
              onPress={handleDecrement}
              disabled={item.quantity <= 1}
              hitSlop={sp.xs}
            >
              <IconSymbol name="minus" size={16} color={colors.textMid} />
            </Pressable>
            <Text style={styles.qtyText}>{item.quantity}</Text>
            <Pressable
              style={styles.qtyBtn}
              onPress={handleIncrement}
              disabled={item.quantity >= item.stock}
              hitSlop={sp.xs}
            >
              <IconSymbol name="plus" size={16} color={colors.textMid} />
            </Pressable>
            <Pressable style={styles.removeBtn} onPress={handleRemove} hitSlop={sp.xs}>
              <IconSymbol name="trash" size={18} color={colors.error} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
});

const Step1CartReview = memo(function Step1CartReview({
  cartItems,
  onContinue,
  dispatch,
}: Step1Props): React.JSX.Element {
  const { colors, sp, typo } = useTheme();
  const reduxDispatch = useAppDispatch();
  const router = useRouter();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    listContent: {
      padding: sp.base,
    },
    summaryText: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
      marginBottom: sp.md,
    },
  });

  const handleIncrement = useCallback(
    (productId: string, qty: number) => {
      reduxDispatch(updateQuantity({ productId, quantity: qty }));
    },
    [reduxDispatch],
  );

  const handleDecrement = useCallback(
    (productId: string, qty: number) => {
      if (qty < 1) {
        reduxDispatch(removeFromCart(productId));
      } else {
        reduxDispatch(updateQuantity({ productId, quantity: qty }));
      }
    },
    [reduxDispatch],
  );

  const handleRemove = useCallback(
    (productId: string) => {
      reduxDispatch(removeFromCart(productId));
    },
    [reduxDispatch],
  );

  const renderItem = useCallback<ListRenderItem<CartItem>>(
    ({ item }) => (
      <CartRow
        item={item}
        onIncrement={handleIncrement}
        onDecrement={handleDecrement}
        onRemove={handleRemove}
      />
    ),
    [handleIncrement, handleDecrement, handleRemove],
  );

  if (cartItems.length === 0) {
    return (
      <EmptyState
        icon={<IconSymbol name="cart" size={40} color={colors.textLow} />}
        title="Your cart is empty"
        message="Add some fabric suits before placing an order."
        action={{
          label: 'Browse Designs',
          onPress: () => router.push('/(tabs)/designs' as never),
        }}
      />
    );
  }

  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <View style={styles.container}>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.productId}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Text style={styles.summaryText}>
            {totalItems} {totalItems === 1 ? 'item' : 'items'} in cart
          </Text>
        }
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
    </View>
  );
});

// ─── Step 2: Per-item Design + Tailor pickers ────────────────────────────────

// Helper: resolve display name from Tailor (userId may be populated object or string)
function getTailorDisplayName(tailor: Tailor): string {
  if (typeof tailor.userId === 'object' && tailor.userId !== null) {
    return tailor.userId.name;
  }
  return 'Tailor';
}

// Helper: get tailor's price for a specific design category
function getTailorPriceForCategory(tailor: Tailor, category: string): number | null {
  const entry = tailor.categoryPricing?.find(
    (cp) => cp.garmentCategorySlug === category,
  );
  return entry?.price ?? null;
}

// ── Design Picker Modal ───────────────────────────────────────────────────────

interface DesignPickerModalProps {
  visible: boolean;
  targetGender?: string;
  onSelect: (design: Design) => void;
  onClose: () => void;
}

const DesignPickerModal = memo(function DesignPickerModal({
  visible,
  targetGender,
  onSelect,
  onClose,
}: DesignPickerModalProps): React.JSX.Element {
  const { colors, sp, r, typo } = useTheme();
  const [search, setSearch] = useState('');

  const genderParam =
    targetGender === 'male' || targetGender === 'female' || targetGender === 'kids'
      ? (targetGender as 'male' | 'female' | 'kids')
      : undefined;

  const { data, isLoading } = useGetDesignsQuery(
    { limit: 50, sort: 'popular', ...(genderParam ? { gender: genderParam } : {}) },
    { skip: !visible },
  );

  const designs = useMemo(() => {
    const all = data?.designs ?? [];
    if (!search.trim()) return all;
    const q = search.toLowerCase();
    return all.filter(
      (d) => d.title.toLowerCase().includes(q) || d.category.toLowerCase().includes(q),
    );
  }, [data, search]);

  const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: r['2xl'],
      borderTopRightRadius: r['2xl'],
      maxHeight: '80%',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: sp.base,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: { ...typo.scale.body, fontFamily: typo.fonts.sansBold, color: colors.textHigh },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: sp.sm,
      margin: sp.base,
      backgroundColor: colors.inputBg,
      borderRadius: r.sm,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: sp.md,
      height: 40,
    },
    searchInput: {
      flex: 1,
      ...typo.scale.body,
      fontFamily: typo.fonts.sans,
      color: colors.textHigh,
      padding: 0,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: sp.md,
      paddingHorizontal: sp.base,
      paddingVertical: sp.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    thumb: { width: 56, height: 56, borderRadius: r.sm, backgroundColor: colors.panel },
    itemTitle: { ...typo.scale.bodySmall, fontFamily: typo.fonts.sansBold, color: colors.textHigh },
    itemMeta: { ...typo.scale.caption, fontFamily: typo.fonts.sans, color: colors.textMid, marginTop: 2 },
    empty: { paddingVertical: sp['3xl'], alignItems: 'center' },
    emptyText: { ...typo.scale.body, fontFamily: typo.fonts.sans, color: colors.textMid },
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Design</Text>
            <Pressable onPress={onClose} hitSlop={sp.sm}>
              <IconSymbol name="xmark" size={18} color={colors.textMid} />
            </Pressable>
          </View>

          <View style={styles.searchBar}>
            <IconSymbol name="magnifyingglass" size={14} color={colors.textLow} />
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search designs…"
              placeholderTextColor={colors.textLow}
            />
          </View>

          {isLoading ? (
            <View style={styles.empty}>
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : designs.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No designs found.</Text>
            </View>
          ) : (
            <FlatList
              data={designs}
              keyExtractor={(d) => d._id}
              renderItem={({ item }) => (
                <Pressable style={styles.item} onPress={() => { onSelect(item); onClose(); }}>
                  {item.imageUrl !== null ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.thumb} resizeMode="cover" />
                  ) : (
                    <View style={styles.thumb} />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.itemMeta}>{item.category} · {item.gender}</Text>
                  </View>
                  <IconSymbol name="chevron.right" size={14} color={colors.textLow} />
                </Pressable>
              )}
            />
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
});

// ── Tailor Picker Modal ───────────────────────────────────────────────────────

interface TailorPickerModalProps {
  visible: boolean;
  designCategory: string;
  onSelect: (tailor: Tailor, price: number | null) => void;
  onClose: () => void;
}

const TailorPickerModal = memo(function TailorPickerModal({
  visible,
  designCategory,
  onSelect,
  onClose,
}: TailorPickerModalProps): React.JSX.Element {
  const { colors, sp, r, typo } = useTheme();

  const { data, isLoading } = useGetTailorsQuery(
    { limit: 50, sort: 'rating', available: true },
    { skip: !visible },
  );

  // Show tailors that specialise in the design's category first; others below
  const { specialists, others } = useMemo(() => {
    const all = data?.tailors ?? [];
    const s: Tailor[] = [];
    const o: Tailor[] = [];
    for (const t of all) {
      const hasSpec = t.specialisations.some(
        (sp) => sp.toLowerCase() === designCategory.toLowerCase(),
      );
      const hasPricing = t.categoryPricing?.some(
        (cp) => cp.garmentCategorySlug.toLowerCase() === designCategory.toLowerCase(),
      );
      if (hasSpec || hasPricing) {
        s.push(t);
      } else {
        o.push(t);
      }
    }
    return { specialists: s, others: o };
  }, [data, designCategory]);

  const sections = useMemo(() => [
    ...(specialists.length > 0 ? [{ type: 'header' as const, label: 'SPECIALISTS' }, ...specialists.map((t) => ({ type: 'tailor' as const, tailor: t }))] : []),
    ...(others.length > 0 ? [{ type: 'header' as const, label: 'ALL TAILORS' }, ...others.map((t) => ({ type: 'tailor' as const, tailor: t }))] : []),
  ], [specialists, others]);

  const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: r['2xl'],
      borderTopRightRadius: r['2xl'],
      maxHeight: '80%',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: sp.base,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: { ...typo.scale.body, fontFamily: typo.fonts.sansBold, color: colors.textHigh },
    sectionHeader: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansMed,
      color: colors.textMid,
      backgroundColor: colors.panel,
      paddingHorizontal: sp.base,
      paddingVertical: sp.xs,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: sp.base,
      paddingVertical: sp.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    itemName: { ...typo.scale.bodySmall, fontFamily: typo.fonts.sansBold, color: colors.textHigh },
    itemMeta: { ...typo.scale.caption, fontFamily: typo.fonts.sans, color: colors.textMid, marginTop: 2 },
    itemPrice: { ...typo.scale.bodySmall, fontFamily: typo.fonts.sansBold, color: colors.accent },
    tierBadge: {
      paddingHorizontal: sp.xs,
      paddingVertical: 2,
      borderRadius: r.sharp,
      backgroundColor: colors.accentSubtle,
      alignSelf: 'flex-start',
      marginTop: sp.xs,
    },
    tierText: { ...typo.scale.label, fontFamily: typo.fonts.sansMed, color: colors.accent },
    empty: { paddingVertical: sp['3xl'], alignItems: 'center' },
    emptyText: { ...typo.scale.body, fontFamily: typo.fonts.sans, color: colors.textMid },
  });

  type SectionRow =
    | { type: 'header'; label: string }
    | { type: 'tailor'; tailor: Tailor };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Select Tailor</Text>
            <Pressable onPress={onClose} hitSlop={sp.sm}>
              <IconSymbol name="xmark" size={18} color={colors.textMid} />
            </Pressable>
          </View>

          {isLoading ? (
            <View style={styles.empty}>
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : sections.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No tailors available.</Text>
            </View>
          ) : (
            <FlatList
              data={sections as SectionRow[]}
              keyExtractor={(row, i) =>
                row.type === 'header' ? `hdr-${i}` : row.tailor._id
              }
              renderItem={({ item: row }) => {
                if (row.type === 'header') {
                  return <Text style={styles.sectionHeader}>{row.label}</Text>;
                }
                const { tailor } = row;
                const price = getTailorPriceForCategory(tailor, designCategory);
                const name = getTailorDisplayName(tailor);
                return (
                  <Pressable
                    style={styles.item}
                    onPress={() => { onSelect(tailor, price); onClose(); }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{name}</Text>
                      <View style={styles.tierBadge}>
                        <Text style={styles.tierText}>{tailor.tier.toUpperCase()}</Text>
                      </View>
                      <Text style={styles.itemMeta}>
                        ★ {tailor.rating.toFixed(1)} · {tailor.completedOrders} orders
                      </Text>
                    </View>
                    {price !== null ? (
                      <Text style={styles.itemPrice}>PKR {price.toLocaleString()}</Text>
                    ) : (
                      <IconSymbol name="chevron.right" size={14} color={colors.textLow} />
                    )}
                  </Pressable>
                );
              }}
            />
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
});

// ── Per-item config card ──────────────────────────────────────────────────────

interface Step2Props {
  cartItems: CartItem[];
  itemConfigs: WizardState['itemConfigs'];
  dispatch: React.Dispatch<WizardAction>;
}

interface ItemConfigCardProps {
  item: CartItem;
  itemIndex: number;
  config: ItemConfig;
  onUpdate: (productId: string, config: ItemConfig) => void;
}

const ItemConfigCard = memo(function ItemConfigCard({
  item,
  itemIndex,
  config,
  onUpdate,
}: ItemConfigCardProps): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();
  const [designOpen, setDesignOpen] = useState(false);
  const [tailorOpen, setTailorOpen] = useState(false);

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      padding: sp.md,
      marginBottom: sp.md,
      ...elev.low,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: sp.md,
    },
    suitLabel: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansMed,
      color: colors.textMid,
    },
    title: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.textHigh,
      flex: 1,
      marginRight: sp.sm,
    },
    pickBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: sp.xs,
      backgroundColor: colors.accentSubtle,
      borderRadius: r.sm,
      paddingVertical: sp.sm,
      paddingHorizontal: sp.md,
    },
    pickBtnText: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansMed,
      color: colors.accent,
    },
    selectedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.panel,
      borderRadius: r.sm,
      padding: sp.sm,
    },
    selectedName: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.textHigh,
      flex: 1,
    },
    selectedMeta: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
      marginTop: 2,
    },
    sectionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: sp.sm,
    },
    sectionLabel: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansMed,
      color: colors.textMid,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: sp.sm,
    },
    disabledHint: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textLow,
      fontStyle: 'italic',
    },
  });

  const handleDesignSelect = useCallback(
    (design: Design) => {
      onUpdate(item.productId, {
        ...config,
        designId: design._id,
        designTitle: design.title,
        designCategory: design.category,
        // Reset tailor when design changes
        tailorId: undefined,
        tailorName: undefined,
        stitchingFee: undefined,
      });
    },
    [item.productId, config, onUpdate],
  );

  const handleTailorSelect = useCallback(
    (tailor: Tailor, price: number | null) => {
      onUpdate(item.productId, {
        ...config,
        tailorId: tailor._id,
        tailorName: getTailorDisplayName(tailor),
        stitchingFee: price ?? undefined,
      });
    },
    [item.productId, config, onUpdate],
  );

  const handleClearDesign = useCallback(() => {
    onUpdate(item.productId, {
      ...config,
      designId: undefined,
      designTitle: undefined,
      designCategory: undefined,
      tailorId: undefined,
      tailorName: undefined,
      stitchingFee: undefined,
    });
  }, [item.productId, config, onUpdate]);

  const handleClearTailor = useCallback(() => {
    onUpdate(item.productId, {
      ...config,
      tailorId: undefined,
      tailorName: undefined,
      stitchingFee: undefined,
    });
  }, [item.productId, config, onUpdate]);

  const hasDesign = config.designId !== undefined && config.designId.length > 0;
  const hasTailor = config.tailorId !== undefined && config.tailorId.length > 0;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.suitLabel}>SUIT {itemIndex + 1}</Text>
      </View>
      <Text style={styles.title} numberOfLines={2}>{item.title}</Text>

      <View style={styles.divider} />

      {/* Design section */}
      <View style={[styles.sectionRow, { marginTop: sp.xs }]}>
        <Text style={styles.sectionLabel}>DESIGN</Text>
        {hasDesign ? (
          <Pressable onPress={handleClearDesign} hitSlop={sp.xs}>
            <Text style={[typo.scale.caption, { fontFamily: typo.fonts.sans, color: colors.error }]}>
              Clear
            </Text>
          </Pressable>
        ) : null}
      </View>

      {hasDesign ? (
        <Pressable style={styles.selectedRow} onPress={() => setDesignOpen(true)}>
          <View style={{ flex: 1 }}>
            <Text style={styles.selectedName} numberOfLines={1}>{config.designTitle}</Text>
            {config.designCategory !== undefined && (
              <Text style={styles.selectedMeta}>{config.designCategory}</Text>
            )}
          </View>
          <IconSymbol name="pencil" size={14} color={colors.accent} />
        </Pressable>
      ) : (
        <Pressable style={styles.pickBtn} onPress={() => setDesignOpen(true)}>
          <IconSymbol name="paintbrush" size={14} color={colors.accent} />
          <Text style={styles.pickBtnText}>Pick a Design</Text>
        </Pressable>
      )}

      <DesignPickerModal
        visible={designOpen}
        targetGender={item.targetGender}
        onSelect={handleDesignSelect}
        onClose={() => setDesignOpen(false)}
      />

      <View style={styles.divider} />

      {/* Tailor section */}
      <View style={[styles.sectionRow, { marginTop: sp.xs }]}>
        <Text style={styles.sectionLabel}>TAILOR</Text>
        {hasTailor ? (
          <Pressable onPress={handleClearTailor} hitSlop={sp.xs}>
            <Text style={[typo.scale.caption, { fontFamily: typo.fonts.sans, color: colors.error }]}>
              Clear
            </Text>
          </Pressable>
        ) : null}
      </View>

      {!hasDesign ? (
        <Text style={styles.disabledHint}>Select a design first to see tailors.</Text>
      ) : hasTailor ? (
        <Pressable style={styles.selectedRow} onPress={() => setTailorOpen(true)}>
          <View style={{ flex: 1 }}>
            <Text style={styles.selectedName} numberOfLines={1}>{config.tailorName}</Text>
            {config.stitchingFee !== undefined && (
              <Text style={styles.selectedMeta}>Stitching: PKR {config.stitchingFee.toLocaleString()}</Text>
            )}
          </View>
          <IconSymbol name="pencil" size={14} color={colors.accent} />
        </Pressable>
      ) : (
        <Pressable style={styles.pickBtn} onPress={() => setTailorOpen(true)}>
          <IconSymbol name="scissors" size={14} color={colors.accent} />
          <Text style={styles.pickBtnText}>Pick a Tailor</Text>
        </Pressable>
      )}

      {hasDesign && (
        <TailorPickerModal
          visible={tailorOpen}
          designCategory={config.designCategory ?? ''}
          onSelect={handleTailorSelect}
          onClose={() => setTailorOpen(false)}
        />
      )}
    </View>
  );
});

const Step2DesignTailor = memo(function Step2DesignTailor({
  cartItems,
  itemConfigs,
  dispatch,
}: Step2Props): React.JSX.Element {
  const { colors, sp, r, typo } = useTheme();

  const styles = StyleSheet.create({
    container: {
      padding: sp.base,
    },
    intro: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
      marginBottom: sp.md,
    },
    copyBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: sp.xs,
      backgroundColor: colors.accentSubtle,
      borderRadius: r.sm,
      paddingVertical: sp.sm,
      paddingHorizontal: sp.md,
      alignSelf: 'flex-start',
      marginBottom: sp.md,
    },
    copyBtnText: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sansMed,
      color: colors.accent,
    },
  });

  const handleUpdate = useCallback(
    (productId: string, config: ItemConfig) => {
      dispatch({ type: 'SET_ITEM_CONFIG', productId, config });
    },
    [dispatch],
  );

  const firstItem = cartItems[0];

  const handleCopyFromFirst = useCallback(() => {
    if (firstItem === undefined) return;
    const firstConfig = itemConfigs[firstItem.productId] ?? {};
    cartItems.forEach((item, idx) => {
      if (idx === 0) return;
      dispatch({
        type: 'SET_ITEM_CONFIG',
        productId: item.productId,
        config: { ...firstConfig },
      });
    });
  }, [cartItems, firstItem, itemConfigs, dispatch]);

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} scrollEnabled={false}>
      <Text style={styles.intro}>
        For each suit, pick a design then choose a tailor. Tailors are filtered by the design's garment category.
      </Text>

      {cartItems.length > 1 && (
        <Pressable style={styles.copyBtn} onPress={handleCopyFromFirst}>
          <IconSymbol name="doc.on.doc" size={14} color={colors.accent} />
          <Text style={styles.copyBtnText}>Copy Suit 1 to all</Text>
        </Pressable>
      )}

      {cartItems.map((item, idx) => (
        <ItemConfigCard
          key={item.productId}
          item={item}
          itemIndex={idx}
          config={itemConfigs[item.productId] ?? {}}
          onUpdate={handleUpdate}
        />
      ))}
    </ScrollView>
  );
});

// ─── Step 3: Measurements ─────────────────────────────────────────────────────

interface Step3Props {
  selectedMeasurementId: string | null;
  dispatch: React.Dispatch<WizardAction>;
}

const Step3Measurements = memo(function Step3Measurements({
  selectedMeasurementId,
  dispatch,
}: Step3Props): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();
  const { data: measurements, isLoading } = useGetMeasurementsQuery();
  const [createMeasurement, { isLoading: isCreating }] = useCreateMeasurementMutation();

  const [label, setLabel] = useState('');
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');
  const [shoulder, setShoulder] = useState('');
  const [length, setLength] = useState('');
  const [sleeveLength, setSleeveLength] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [formError, setFormError] = useState<string | undefined>(undefined);

  const styles = StyleSheet.create({
    container: {
      padding: sp.base,
    },
    sectionLabel: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansMed,
      color: colors.textMid,
      marginBottom: sp.sm,
      marginTop: sp.md,
    },
    measureCard: {
      borderRadius: r.md,
      padding: sp.md,
      marginBottom: sp.sm,
      borderWidth: 1.5,
      ...elev.low,
    },
    measureLabel: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.textHigh,
      marginBottom: sp.xs,
    },
    measureMeta: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
    },
    fieldGap: {
      marginBottom: sp.sm,
    },
    saveBtn: {
      marginTop: sp.md,
    },
    skeletonGap: {
      marginBottom: sp.sm,
    },
    noSavedText: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textLow,
      marginBottom: sp.sm,
    },
  });

  const handleSelect = useCallback(
    (id: string) => {
      dispatch({ type: 'SET_MEASUREMENT', measurementId: id });
    },
    [dispatch],
  );

  const handleSaveAndUse = useCallback(async () => {
    setFormError(undefined);
    if (!label.trim()) { setFormError('Label is required'); return; }
    const chestN = parseFloat(chest);
    const waistN = parseFloat(waist);
    const hipsN = parseFloat(hips);
    const shoulderN = parseFloat(shoulder);
    const lengthN = parseFloat(length);
    if (isNaN(chestN) || isNaN(waistN) || isNaN(hipsN) || isNaN(shoulderN) || isNaN(lengthN)) {
      setFormError('Chest, Waist, Hips, Shoulder and Length are required numbers');
      return;
    }
    const sleeveLengthN = sleeveLength.trim() ? parseFloat(sleeveLength) : undefined;

    try {
      const result = await createMeasurement({
        label: label.trim(),
        chest: chestN,
        waist: waistN,
        hips: hipsN,
        shoulder: shoulderN,
        length: lengthN,
        ...(sleeveLengthN !== undefined ? { sleeveLength: sleeveLengthN } : {}),
        ...(customNotes.trim() ? { customNotes: customNotes.trim() } : {}),
      }).unwrap();
      dispatch({ type: 'SET_MEASUREMENT', measurementId: result._id });
      setLabel(''); setChest(''); setWaist(''); setHips(''); setShoulder(''); setLength('');
      setSleeveLength(''); setCustomNotes('');
    } catch {
      setFormError('Failed to save measurement. Please try again.');
    }
  }, [label, chest, waist, hips, shoulder, length, sleeveLength, customNotes, createMeasurement, dispatch]);

  const renderMeasurement = useCallback<ListRenderItem<Measurement>>(
    ({ item }) => {
      const isSelected = item._id === selectedMeasurementId;
      return (
        <Pressable
          style={[
            styles.measureCard,
            {
              backgroundColor: isSelected ? colors.accentSubtle : colors.elevated,
              borderColor: isSelected ? colors.accent : colors.border,
            },
          ]}
          onPress={() => handleSelect(item._id)}
        >
          <Text style={styles.measureLabel}>{item.label}</Text>
          <Text style={styles.measureMeta}>
            Chest {item.chest}" · Waist {item.waist}" · Hips {item.hips}"
          </Text>
          {item.isDefault && (
            <Text style={[styles.measureMeta, { color: colors.accent, marginTop: 2 }]}>
              Default
            </Text>
          )}
        </Pressable>
      );
    },
    [selectedMeasurementId, handleSelect, styles, colors],
  );

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} scrollEnabled={false}>
      <Text style={styles.sectionLabel}>SAVED MEASUREMENTS</Text>
      {isLoading ? (
        <>
          <View style={styles.skeletonGap}><Skeleton width="100%" height={64} /></View>
          <View style={styles.skeletonGap}><Skeleton width="100%" height={64} /></View>
        </>
      ) : (measurements ?? []).length === 0 ? (
        <Text style={styles.noSavedText}>No saved measurements yet.</Text>
      ) : (
        <FlatList
          data={measurements ?? []}
          keyExtractor={(item) => item._id}
          renderItem={renderMeasurement}
          scrollEnabled={false}
        />
      )}

      <Text style={[styles.sectionLabel, { marginTop: sp['2xl'] }]}>ADD NEW MEASUREMENT</Text>
      <View style={styles.fieldGap}>
        <Input label="Label *" value={label} onChangeText={setLabel} placeholder="e.g. My Kameez Size" />
      </View>
      <View style={styles.fieldGap}>
        <Input label="Chest (inches) *" value={chest} onChangeText={setChest} placeholder="e.g. 40" keyboardType="numeric" />
      </View>
      <View style={styles.fieldGap}>
        <Input label="Waist (inches) *" value={waist} onChangeText={setWaist} placeholder="e.g. 34" keyboardType="numeric" />
      </View>
      <View style={styles.fieldGap}>
        <Input label="Hips (inches) *" value={hips} onChangeText={setHips} placeholder="e.g. 40" keyboardType="numeric" />
      </View>
      <View style={styles.fieldGap}>
        <Input label="Shoulder (inches) *" value={shoulder} onChangeText={setShoulder} placeholder="e.g. 17" keyboardType="numeric" />
      </View>
      <View style={styles.fieldGap}>
        <Input label="Length (inches) *" value={length} onChangeText={setLength} placeholder="e.g. 42" keyboardType="numeric" />
      </View>
      <View style={styles.fieldGap}>
        <Input label="Sleeve Length (optional)" value={sleeveLength} onChangeText={setSleeveLength} placeholder="e.g. 23" keyboardType="numeric" />
      </View>
      <View style={styles.fieldGap}>
        <Input label="Custom Notes (optional)" value={customNotes} onChangeText={setCustomNotes} placeholder="Any special instructions..." multiline numberOfLines={3} />
      </View>
      {formError !== undefined && (
        <View style={{ marginBottom: sp.sm }}>
          <ErrorBanner message={formError} />
        </View>
      )}
      <View style={styles.saveBtn}>
        <Button
          label={isCreating ? 'Saving...' : 'Save & Use'}
          onPress={handleSaveAndUse}
          variant="secondary"
          loading={isCreating}
          fullWidth
        />
      </View>
    </ScrollView>
  );
});

// ─── Step 4: Delivery Address ─────────────────────────────────────────────────

interface Step4Props {
  deliveryAddress: DeliveryAddress | null;
  dispatch: React.Dispatch<WizardAction>;
}

const Step4Delivery = memo(function Step4Delivery({
  deliveryAddress,
  dispatch,
}: Step4Props): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();
  const { data: addresses, isLoading } = useGetAddressesQuery();
  const [addAddress, { isLoading: isAdding }] = useAddAddressMutation();

  const [addrLabel, setAddrLabel] = useState('');
  const [line1, setLine1] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [phone, setPhone] = useState('');
  const [formError, setFormError] = useState<string | undefined>(undefined);

  const styles = StyleSheet.create({
    container: {
      padding: sp.base,
    },
    sectionLabel: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansMed,
      color: colors.textMid,
      marginBottom: sp.sm,
      marginTop: sp.md,
    },
    addrCard: {
      borderRadius: r.md,
      padding: sp.md,
      marginBottom: sp.sm,
      borderWidth: 1.5,
      ...elev.low,
    },
    addrLabel: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.textHigh,
      marginBottom: sp.xs,
    },
    addrMeta: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
    },
    fieldGap: {
      marginBottom: sp.sm,
    },
    skeletonGap: {
      marginBottom: sp.sm,
    },
    noSavedText: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textLow,
      marginBottom: sp.sm,
    },
  });

  const isAddressSelected = useCallback(
    (addr: Address) => {
      if (deliveryAddress === null) return false;
      return (
        deliveryAddress.line1 === addr.line1 &&
        deliveryAddress.city === addr.city
      );
    },
    [deliveryAddress],
  );

  const handleSelectAddress = useCallback(
    (addr: Address) => {
      dispatch({
        type: 'SET_ADDRESS',
        address: {
          line1: addr.line1,
          city: addr.city,
          area: addr.area ?? '',
          phone: addr.phone ?? '',
        },
      });
    },
    [dispatch],
  );

  const handleSaveAndUse = useCallback(async () => {
    setFormError(undefined);
    if (!addrLabel.trim()) { setFormError('Label is required'); return; }
    if (!line1.trim()) { setFormError('Address line 1 is required'); return; }
    if (!city.trim()) { setFormError('City is required'); return; }
    if (!phone.trim()) { setFormError('Phone is required'); return; }

    const payload = {
      label: addrLabel.trim(),
      line1: line1.trim(),
      city: city.trim(),
      ...(area.trim() ? { area: area.trim() } : {}),
      ...(phone.trim() ? { phone: phone.trim() } : {}),
      isDefault: false,
    };

    try {
      const result = await addAddress(payload).unwrap();
      dispatch({
        type: 'SET_ADDRESS',
        address: {
          line1: result.line1,
          city: result.city,
          area: result.area ?? '',
          phone: result.phone ?? '',
        },
      });
      setAddrLabel(''); setLine1(''); setCity(''); setArea(''); setPhone('');
    } catch {
      setFormError('Failed to save address. Please try again.');
    }
  }, [addrLabel, line1, city, area, phone, addAddress, dispatch]);

  const renderAddress = useCallback<ListRenderItem<Address>>(
    ({ item }) => {
      const isSelected = isAddressSelected(item);
      return (
        <Pressable
          style={[
            styles.addrCard,
            {
              backgroundColor: isSelected ? colors.accentSubtle : colors.elevated,
              borderColor: isSelected ? colors.accent : colors.border,
            },
          ]}
          onPress={() => handleSelectAddress(item)}
        >
          <Text style={styles.addrLabel}>{item.label}</Text>
          <Text style={styles.addrMeta}>{item.line1}</Text>
          <Text style={styles.addrMeta}>
            {item.area !== undefined && item.area.length > 0 ? `${item.area}, ` : ''}{item.city}
          </Text>
          {item.phone !== undefined && item.phone.length > 0 && (
            <Text style={styles.addrMeta}>{item.phone}</Text>
          )}
        </Pressable>
      );
    },
    [isAddressSelected, handleSelectAddress, styles, colors],
  );

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} scrollEnabled={false}>
      <Text style={styles.sectionLabel}>SAVED ADDRESSES</Text>
      {isLoading ? (
        <>
          <View style={styles.skeletonGap}><Skeleton width="100%" height={72} /></View>
          <View style={styles.skeletonGap}><Skeleton width="100%" height={72} /></View>
        </>
      ) : (addresses ?? []).length === 0 ? (
        <Text style={styles.noSavedText}>No saved addresses yet.</Text>
      ) : (
        <FlatList
          data={addresses ?? []}
          keyExtractor={(item) => item._id}
          renderItem={renderAddress}
          scrollEnabled={false}
        />
      )}

      <Text style={[styles.sectionLabel, { marginTop: sp['2xl'] }]}>ADD NEW ADDRESS</Text>
      <View style={styles.fieldGap}>
        <Input label="Label *" value={addrLabel} onChangeText={setAddrLabel} placeholder="e.g. Home" />
      </View>
      <View style={styles.fieldGap}>
        <Input label="Address Line 1 *" value={line1} onChangeText={setLine1} placeholder="Street, neighbourhood..." />
      </View>
      <View style={styles.fieldGap}>
        <Input label="City *" value={city} onChangeText={setCity} placeholder="e.g. Karachi" />
      </View>
      <View style={styles.fieldGap}>
        <Input label="Area (optional)" value={area} onChangeText={setArea} placeholder="e.g. DHA Phase 5" />
      </View>
      <View style={styles.fieldGap}>
        <Input label="Phone *" value={phone} onChangeText={setPhone} placeholder="e.g. 0300-1234567" keyboardType="phone-pad" />
      </View>
      {formError !== undefined && (
        <View style={{ marginBottom: sp.sm }}>
          <ErrorBanner message={formError} />
        </View>
      )}
      <Button
        label={isAdding ? 'Saving...' : 'Save & Use'}
        onPress={handleSaveAndUse}
        variant="secondary"
        loading={isAdding}
        fullWidth
      />
    </ScrollView>
  );
});

// ─── Step 5: Review & Submit ──────────────────────────────────────────────────

interface Step5Props {
  cartItems: CartItem[];
  wizardState: WizardState;
  dispatch: React.Dispatch<WizardAction>;
  placeError: unknown;
}

const DELIVERY_FEE = 200;
const PLATFORM_FEE_RATE = 0.17;
const RUSH_SURCHARGE = 500;

type PaymentMethod = 'jazzcash' | 'easypaisa' | 'cod';
const PAYMENT_OPTIONS: { key: PaymentMethod; label: string }[] = [
  { key: 'jazzcash', label: 'JazzCash' },
  { key: 'easypaisa', label: 'EasyPaisa' },
  { key: 'cod', label: 'COD' },
];

const Step5Review = memo(function Step5Review({
  cartItems,
  wizardState,
  dispatch,
  placeError,
}: Step5Props): React.JSX.Element {
  const { colors, sp, r, typo, elev } = useTheme();

  const styles = StyleSheet.create({
    container: {
      padding: sp.base,
    },
    sectionLabel: {
      ...typo.scale.label,
      fontFamily: typo.fonts.sansMed,
      color: colors.textMid,
      marginBottom: sp.sm,
      marginTop: sp.md,
    },
    itemRow: {
      backgroundColor: colors.elevated,
      borderRadius: r.md,
      padding: sp.md,
      marginBottom: sp.sm,
      ...elev.low,
    },
    itemTitle: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.textHigh,
      marginBottom: sp.xs,
    },
    itemMeta: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
    },
    priceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: sp.xs,
    },
    priceLabel: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
    },
    priceValue: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansBold,
      color: colors.textHigh,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: sp.md,
      borderTopWidth: 1,
      marginTop: sp.sm,
    },
    totalLabel: {
      ...typo.scale.body,
      fontFamily: typo.fonts.sansBold,
      color: colors.textHigh,
    },
    totalValue: {
      ...typo.scale.price,
      fontFamily: typo.fonts.sansBold,
      color: colors.accent,
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: sp.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    toggleLabel: {
      ...typo.scale.body,
      fontFamily: typo.fonts.sans,
      color: colors.textHigh,
    },
    toggleSubLabel: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textMid,
    },
    paymentRow: {
      flexDirection: 'row',
      gap: sp.sm,
      marginTop: sp.sm,
    },
    paymentPill: {
      flex: 1,
      paddingVertical: sp.sm,
      borderRadius: r.pill,
      borderWidth: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    paymentPillText: {
      ...typo.scale.bodySmall,
      fontFamily: typo.fonts.sansMed,
    },
    errorGap: {
      marginTop: sp.md,
    },
  });

  const fabricTotal = cartItems.reduce(
    (sum, item) => sum + item.pricePerSuit * item.quantity,
    0,
  );

  const stitchingBaseTotal = cartItems.reduce((sum, item) => {
    const config = wizardState.itemConfigs[item.productId];
    return sum + (config?.stitchingFee ?? 0);
  }, 0);

  const stitchingTotal = stitchingBaseTotal + (wizardState.isRushOrder ? RUSH_SURCHARGE : 0);
  const platformFee = Math.round(stitchingTotal * PLATFORM_FEE_RATE);
  const grandTotal = fabricTotal + stitchingTotal + platformFee + DELIVERY_FEE;

  const handleToggleRush = useCallback(() => {
    dispatch({ type: 'TOGGLE_RUSH' });
  }, [dispatch]);

  const handleToggleGift = useCallback(() => {
    dispatch({ type: 'TOGGLE_GIFT' });
  }, [dispatch]);

  const handleGiftMessageChange = useCallback(
    (text: string) => {
      dispatch({ type: 'SET_GIFT_MESSAGE', message: text });
    },
    [dispatch],
  );

  const handleSelectPayment = useCallback(
    (method: PaymentMethod) => {
      dispatch({ type: 'SET_PAYMENT', method });
    },
    [dispatch],
  );

  const errorMessage = (() => {
    if (placeError === undefined || placeError === null) return undefined;
    if (
      typeof placeError === 'object' &&
      'data' in placeError &&
      typeof (placeError as Record<string, unknown>).data === 'object'
    ) {
      const data = (placeError as Record<string, unknown>).data as Record<string, unknown>;
      if (typeof data['message'] === 'string') return data['message'];
    }
    return 'Failed to place order. Please try again.';
  })();

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} scrollEnabled={false}>
      {/* Per-item breakdown */}
      <Text style={styles.sectionLabel}>ORDER ITEMS</Text>
      {cartItems.map((item) => {
        const config = wizardState.itemConfigs[item.productId];
        return (
          <View key={item.productId} style={styles.itemRow}>
            <Text style={styles.itemTitle}>{item.title} × {item.quantity}</Text>
            {config?.designTitle !== undefined && config.designTitle.length > 0 && (
              <Text style={styles.itemMeta}>Design: {config.designTitle}</Text>
            )}
            {config?.tailorName !== undefined && config.tailorName.trim().length > 0 && (
              <Text style={styles.itemMeta}>Tailor: {config.tailorName}</Text>
            )}
            {config?.stitchingFee !== undefined && (
              <Text style={styles.itemMeta}>Stitching: {formatPkr(config.stitchingFee)}</Text>
            )}
          </View>
        );
      })}

      {/* Pricing */}
      <Text style={[styles.sectionLabel, { marginTop: sp.lg }]}>PRICING</Text>
      <View style={{ backgroundColor: colors.elevated, borderRadius: r.md, padding: sp.md, ...elev.low }}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Fabric Total</Text>
          <Text style={styles.priceValue}>{formatPkr(fabricTotal)}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>
            Stitching{wizardState.isRushOrder ? ' (+ Rush PKR 500)' : ''}
          </Text>
          <Text style={styles.priceValue}>{formatPkr(stitchingTotal)}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Platform Fee (17%)</Text>
          <Text style={styles.priceValue}>{formatPkr(platformFee)}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Delivery</Text>
          <Text style={styles.priceValue}>{formatPkr(DELIVERY_FEE)}</Text>
        </View>
        <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatPkr(grandTotal)}</Text>
        </View>
      </View>

      {/* Options */}
      <Text style={[styles.sectionLabel, { marginTop: sp.lg }]}>OPTIONS</Text>
      <View style={styles.toggleRow}>
        <View>
          <Text style={styles.toggleLabel}>Rush Order</Text>
          <Text style={styles.toggleSubLabel}>+PKR 500 stitching surcharge</Text>
        </View>
        <Switch
          value={wizardState.isRushOrder}
          onValueChange={handleToggleRush}
          trackColor={{ false: colors.border, true: colors.accentMid }}
          thumbColor={wizardState.isRushOrder ? colors.accent : colors.textLow}
        />
      </View>
      <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
        <View>
          <Text style={styles.toggleLabel}>Gift Order</Text>
          <Text style={styles.toggleSubLabel}>Add a message for the recipient</Text>
        </View>
        <Switch
          value={wizardState.isGift}
          onValueChange={handleToggleGift}
          trackColor={{ false: colors.border, true: colors.accentMid }}
          thumbColor={wizardState.isGift ? colors.accent : colors.textLow}
        />
      </View>
      {wizardState.isGift && (
        <View style={{ marginTop: sp.sm }}>
          <Input
            label="Gift Message"
            value={wizardState.giftMessage}
            onChangeText={handleGiftMessageChange}
            placeholder="Write a message for the recipient..."
            multiline
            numberOfLines={3}
          />
        </View>
      )}

      {/* Payment method */}
      <Text style={[styles.sectionLabel, { marginTop: sp.lg }]}>PAYMENT METHOD</Text>
      <View style={styles.paymentRow}>
        {PAYMENT_OPTIONS.map((opt) => {
          const isSelected = wizardState.paymentMethod === opt.key;
          return (
            <Pressable
              key={opt.key}
              style={[
                styles.paymentPill,
                {
                  backgroundColor: isSelected ? colors.accentSubtle : colors.elevated,
                  borderColor: isSelected ? colors.accent : colors.border,
                },
              ]}
              onPress={() => handleSelectPayment(opt.key)}
            >
              <Text
                style={[
                  styles.paymentPillText,
                  { color: isSelected ? colors.accent : colors.textMid },
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {errorMessage !== undefined && (
        <View style={styles.errorGap}>
          <ErrorBanner message={errorMessage} />
        </View>
      )}
    </ScrollView>
  );
});

// ─── Main Wizard Screen ───────────────────────────────────────────────────────

export default function NewOrderScreen(): React.JSX.Element {
  const { colors, sp, elev, typo, r } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const reduxDispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);

  const [wizardState, dispatch] = useReducer(wizardReducer, initialWizardState);
  const [placeOrder, { isLoading: isPlacing, error: placeError }] = usePlaceOrderMutation();

  // ── Validation per step ──────────────────────────────────────────────────────

  const canProceed = useCallback((): boolean => {
    switch (wizardState.step) {
      case 1:
        return cartItems.length > 0;
      case 2:
        return cartItems.every((item) => {
          const cfg = wizardState.itemConfigs[item.productId];
          return (
            cfg?.designId !== undefined && cfg.designId.length > 0 &&
            cfg?.tailorId !== undefined && cfg.tailorId.length > 0
          );
        });
      case 3:
        return wizardState.measurementId !== null;
      case 4:
        return wizardState.deliveryAddress !== null;
      case 5:
        return true;
    }
  }, [wizardState, cartItems]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleBack = useCallback(() => {
    if (wizardState.step === 1) {
      router.back();
    } else {
      dispatch({ type: 'PREV' });
    }
  }, [wizardState.step, router]);

  const handleContinue = useCallback(() => {
    dispatch({ type: 'NEXT' });
  }, []);

  const handleSuccess = useCallback(() => {
    reduxDispatch(clearCart());
    router.replace('/(dashboard)/orders' as never);
  }, [reduxDispatch, router]);

  const handlePlaceOrder = useCallback(async () => {
    if (wizardState.deliveryAddress === null || wizardState.measurementId === null) return;
    if (!canProceed()) return;

    // Expand each cart item by quantity → one row per suit
    interface ExpandedItem {
      productId: string;
      tailorId: string;
      payload: OrderItemPayload;
    }
    const expanded: ExpandedItem[] = cartItems.flatMap((item) => {
      const cfg = wizardState.itemConfigs[item.productId];
      const tailorId = cfg?.tailorId ?? '';
      const row: OrderItemPayload = {
        productId: item.productId,
        measurementId: wizardState.measurementId as string,
        ...(cfg?.designId ? { designId: cfg.designId } : {}),
        ...(wizardState.isRushOrder ? { isRushOrder: true as const } : {}),
      };
      return Array.from({ length: item.quantity }, () => ({ productId: item.productId, tailorId, payload: row }));
    });

    // Group by tailorId — each group becomes one POST /orders request
    const groups = new Map<string, OrderItemPayload[]>();
    for (const e of expanded) {
      const existing = groups.get(e.tailorId);
      if (existing !== undefined) {
        existing.push(e.payload);
      } else {
        groups.set(e.tailorId, [e.payload]);
      }
    }

    const baseAddress = {
      line1: wizardState.deliveryAddress.line1,
      city: wizardState.deliveryAddress.city,
      ...(wizardState.deliveryAddress.area.length > 0 ? { area: wizardState.deliveryAddress.area } : {}),
      ...(wizardState.deliveryAddress.phone.length > 0 ? { phone: wizardState.deliveryAddress.phone } : {}),
    };

    try {
      await Promise.all(
        Array.from(groups.entries()).map(([tailorId, items]) => {
          const payload: PlaceOrderPayload = {
            tailorId,
            items,
            deliveryAddress: baseAddress,
            paymentMethod: wizardState.paymentMethod,
            ...(wizardState.isGift ? { isGift: true } : {}),
            ...(wizardState.isGift && wizardState.giftMessage.trim()
              ? { giftMessage: wizardState.giftMessage.trim() }
              : {}),
          };
          return placeOrder(payload).unwrap();
        }),
      );
      handleSuccess();
    } catch {
      // Error surfaced via placeError passed to Step5Review
    }
  }, [cartItems, wizardState, placeOrder, handleSuccess]);

  // ── Styles ────────────────────────────────────────────────────────────────────

  const styles = StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: insets.bottom + sp['4xl'] + sp['3xl'],
    },
    bottomBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      gap: sp.md,
      paddingHorizontal: sp.base,
      paddingTop: sp.md,
      paddingBottom: insets.bottom + sp.md,
      backgroundColor: colors.navSolid,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      ...elev.high,
    },
    validationHint: {
      ...typo.scale.caption,
      fontFamily: typo.fonts.sans,
      color: colors.textLow,
      textAlign: 'center',
      paddingHorizontal: sp.base,
      paddingVertical: sp.xs,
      backgroundColor: colors.warningSubtle,
    },
  });

  const isStep5 = wizardState.step === 5;
  const proceedEnabled = canProceed();

  return (
    <View style={styles.screen}>
      <ScreenHeader title="New Order" onBack={handleBack} />
      <StepProgress currentStep={wizardState.step} />

      {!proceedEnabled && (
        <Text style={styles.validationHint}>
          {wizardState.step === 2
            ? 'Select a design and tailor for every suit to continue.'
            : wizardState.step === 3
              ? 'Select or add a measurement to continue.'
              : wizardState.step === 4
                ? 'Add a delivery address to continue.'
                : ''}
        </Text>
      )}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {wizardState.step === 1 && (
          <Step1CartReview
            cartItems={cartItems}
            onContinue={handleContinue}
            dispatch={dispatch}
          />
        )}
        {wizardState.step === 2 && (
          <Step2DesignTailor
            cartItems={cartItems}
            itemConfigs={wizardState.itemConfigs}
            dispatch={dispatch}
          />
        )}
        {wizardState.step === 3 && (
          <Step3Measurements
            selectedMeasurementId={wizardState.measurementId}
            dispatch={dispatch}
          />
        )}
        {wizardState.step === 4 && (
          <Step4Delivery
            deliveryAddress={wizardState.deliveryAddress}
            dispatch={dispatch}
          />
        )}
        {wizardState.step === 5 && (
          <Step5Review
            cartItems={cartItems}
            wizardState={wizardState}
            dispatch={dispatch}
            placeError={placeError}
          />
        )}
      </ScrollView>

      {/* Sticky bottom bar */}
      <View style={styles.bottomBar}>
        {wizardState.step > 1 && (
          <Button label="Back" onPress={handleBack} variant="ghost" size="lg" />
        )}
        <View style={{ flex: 1 }}>
          {isStep5 ? (
            <Button
              label={isPlacing ? 'Placing Order...' : 'Place Order'}
              onPress={handlePlaceOrder}
              variant="primary"
              size="lg"
              loading={isPlacing}
              disabled={isPlacing}
              fullWidth
            />
          ) : (
            <Button
              label="Continue"
              onPress={handleContinue}
              variant="primary"
              size="lg"
              disabled={!proceedEnabled}
              fullWidth
            />
          )}
        </View>
      </View>
    </View>
  );
}
