import { api } from './api';
import type { ApiResponse } from '@features/shop/shop.types';
import type { Order, OrderQuery, PaginatedOrders } from '@features/dashboard/dashboard.types';

// ─── Payload & Response Types ─────────────────────────────────────────────────

export interface OrderItemPayload {
  productId: string;
  quantity: number;
  designId?: string;
  tailorId?: string;
  measurementId?: string;
  stitchingFee?: number;
}

export interface PlaceOrderPayload {
  items: OrderItemPayload[];
  deliveryAddress: {
    line1: string;
    city: string;
    area?: string;
    phone: string;
  };
  paymentMethod: 'jazzcash' | 'easypaisa' | 'cod';
  isGift?: boolean;
  giftMessage?: string;
  isRushOrder?: boolean;
  loyaltyPointsToRedeem?: number;
}

export interface PlaceOrderResponse {
  orderId: string;
  orderNumber: string;
}

// ─── API slice ────────────────────────────────────────────────────────────────

export const ordersApi = api.injectEndpoints({
  endpoints: (build) => ({
    getOrders: build.query<PaginatedOrders, OrderQuery>({
      query: ({ page = 1, limit = 15, status } = {}) => {
        const params: Record<string, string> = { page: String(page), limit: String(limit) };
        if (status && status !== 'all') params['status'] = status;
        return { url: '/orders', params };
      },
      transformResponse: (res: ApiResponse<PaginatedOrders>) => res.data,
      providesTags: ['Order'],
    }),

    getOrderById: build.query<Order, string>({
      query: (id) => `/orders/${id}`,
      transformResponse: (res: ApiResponse<Order>) => res.data,
      providesTags: (_, __, id) => [{ type: 'Order', id }],
    }),

    placeOrder: build.mutation<PlaceOrderResponse, PlaceOrderPayload>({
      query: (body) => ({ url: '/orders', method: 'POST', body }),
      transformResponse: (res: ApiResponse<PlaceOrderResponse>) => res.data,
      invalidatesTags: ['Order'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetOrdersQuery, useGetOrderByIdQuery, usePlaceOrderMutation } = ordersApi;
