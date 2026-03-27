import { api } from './api';
import type { Order, OrderQuery, PaginatedOrders } from '@features/dashboard/dashboard.types';

export const ordersApi = api.injectEndpoints({
  endpoints: (build) => ({
    getOrders: build.query<PaginatedOrders, OrderQuery>({
      query: ({ page = 1, limit = 15, status } = {}) => {
        const params: Record<string, string> = { page: String(page), limit: String(limit) };
        if (status && status !== 'all') params.status = status;
        return { url: '/orders', params };
      },
      transformResponse: (res: any) => res.data,
      providesTags: ['Order'],
    }),

    getOrderById: build.query<Order, string>({
      query: (id) => `/orders/${id}`,
      transformResponse: (res: any) => res.data,
      providesTags: (_, __, id) => [{ type: 'Order', id }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetOrdersQuery, useGetOrderByIdQuery } = ordersApi;
