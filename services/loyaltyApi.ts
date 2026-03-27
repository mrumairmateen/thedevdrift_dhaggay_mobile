import { api } from './api';
import type { LoyaltyData, ReferralData } from '@features/dashboard/dashboard.types';

export const loyaltyApi = api.injectEndpoints({
  endpoints: (build) => ({
    getLoyalty: build.query<LoyaltyData, void>({
      query: () => '/loyalty',
      transformResponse: (res: any) => res.data,
      providesTags: ['Loyalty'],
    }),

    getReferrals: build.query<ReferralData, void>({
      query: () => '/loyalty/referrals',
      transformResponse: (res: any) => res.data,
      providesTags: ['Loyalty'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetLoyaltyQuery, useGetReferralsQuery } = loyaltyApi;
