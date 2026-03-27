import { api } from './api';
import type { ApiResponse } from '@features/shop/shop.types';
import type { LoyaltyData, ReferralData } from '@features/dashboard/dashboard.types';

export const loyaltyApi = api.injectEndpoints({
  endpoints: (build) => ({
    getLoyaltyData: build.query<LoyaltyData, void>({
      query: () => '/loyalty',
      transformResponse: (res: ApiResponse<LoyaltyData>) => res.data,
      providesTags: ['Loyalty'],
    }),

    getReferralData: build.query<ReferralData, void>({
      query: () => '/loyalty/referrals',
      transformResponse: (res: ApiResponse<ReferralData>) => res.data,
      providesTags: ['Loyalty'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetLoyaltyDataQuery, useGetReferralDataQuery } = loyaltyApi;
