import { api } from './api';
import type {
  ApiResponse,
  PaginatedTailors,
  Tailor,
  TailorQuery,
} from '@features/tailors/tailors.types';

export type { TailorQuery, PaginatedTailors, Tailor };

export const tailorsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getTailors: build.query<PaginatedTailors, TailorQuery>({
      query: (params) => ({ url: '/tailors', params }),
      transformResponse: (res: ApiResponse<PaginatedTailors>) => {
        console.log('[tailorsApi] getTailors raw response:', JSON.stringify(res));
        return res.data;
      },
      providesTags: ['Tailor'],
    }),

    getTailorBySlug: build.query<Tailor, string>({
      query: (slug) => `/tailors/${slug}`,
      transformResponse: (res: ApiResponse<Tailor>) => {
        console.log('[tailorsApi] getTailorBySlug raw response:', JSON.stringify(res));
        return res.data;
      },
      providesTags: (_r, _e, slug) => [{ type: 'Tailor' as const, id: slug }],
    }),

    getFeaturedTailors: build.query<Tailor[], void>({
      query: () => ({ url: '/tailors', params: { sort: 'rating', limit: 10 } }),
      transformResponse: (res: ApiResponse<PaginatedTailors>) => {
        console.log('[tailorsApi] getFeaturedTailors raw response:', JSON.stringify(res));
        return res.data.tailors;
      },
      providesTags: ['Tailor'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTailorsQuery,
  useGetTailorBySlugQuery,
  useGetFeaturedTailorsQuery,
} = tailorsApi;
