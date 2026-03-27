import { api } from './api';
import type { CustomerDashboard } from '@features/dashboard/dashboard.types';

export const dashboardApi = api.injectEndpoints({
  endpoints: (build) => ({
    getDashboard: build.query<CustomerDashboard, void>({
      query: () => '/dashboard/customer',
      transformResponse: (res: any) => res.data,
      providesTags: ['User', 'Order'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetDashboardQuery } = dashboardApi;
