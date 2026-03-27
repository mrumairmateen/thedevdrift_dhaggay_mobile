import { api } from './api';
import type { ApiResponse } from '@features/shop/shop.types';
import type { CustomerDashboard, DashboardStats } from '@features/dashboard/dashboard.types';

export const dashboardApi = api.injectEndpoints({
  endpoints: (build) => ({
    getCustomerDashboard: build.query<CustomerDashboard, void>({
      query: () => '/dashboard/customer',
      transformResponse: (res: ApiResponse<CustomerDashboard>) => res.data,
      providesTags: ['User'],
    }),

    getOrderStats: build.query<DashboardStats, void>({
      query: () => '/dashboard/stats',
      transformResponse: (res: ApiResponse<DashboardStats>) => res.data,
      providesTags: ['User'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetCustomerDashboardQuery, useGetOrderStatsQuery } = dashboardApi;
