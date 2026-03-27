import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

/** Minimal root-state shape needed by this slice's selectors.
 *  Avoids a circular import with store/index.ts while remaining
 *  fully compatible with the real RootState (structural typing). */
interface RootStateSlice {
  cart: CartState;
}

export interface CartItemConfig {
  designId?: string;
  designTitle?: string;
  tailorId?: string;
  tailorName?: string;
  stitchingFee?: number;
}

export interface CartItem {
  productId: string;
  title: string;
  category: string;
  pricePerSuit: number;
  imageUrl: string | null;
  shopId: string;
  shopSlug: string;
  shopName: string;
  quantity: number;
  stock: number;
  targetGender?: 'male' | 'female' | 'kids' | 'unisex';
  addedAt: string;
  config?: CartItemConfig;
}

export interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, { payload }: PayloadAction<CartItem>) {
      const existing = state.items.find((item) => item.productId === payload.productId);
      if (existing) {
        existing.quantity = Math.min(existing.quantity + 1, existing.stock);
      } else {
        state.items.push(payload);
      }
    },

    removeFromCart(state, { payload }: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.productId !== payload);
    },

    updateQuantity(
      state,
      { payload }: PayloadAction<{ productId: string; quantity: number }>,
    ) {
      const item = state.items.find((i) => i.productId === payload.productId);
      if (item) {
        item.quantity = Math.min(Math.max(1, payload.quantity), item.stock);
      }
    },

    clearCart(state) {
      state.items = [];
    },

    updateConfig(
      state,
      { payload }: PayloadAction<{ productId: string; config: CartItemConfig }>,
    ) {
      const item = state.items.find((i) => i.productId === payload.productId);
      if (item) {
        item.config = payload.config;
      }
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, updateConfig } =
  cartSlice.actions;

export default cartSlice.reducer;

// ─── Selectors ────────────────────────────────────────────────────────────────

export function selectCartItems(state: RootStateSlice): CartItem[] {
  return state.cart.items;
}

export function selectCartCount(state: RootStateSlice): number {
  return state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

export function selectCartTotal(state: RootStateSlice): number {
  return state.cart.items.reduce(
    (sum, item) =>
      sum + item.pricePerSuit * item.quantity + (item.config?.stitchingFee ?? 0),
    0,
  );
}
