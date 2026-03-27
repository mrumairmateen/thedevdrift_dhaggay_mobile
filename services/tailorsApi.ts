import type { PaginatedTailors, Tailor, TailorQuery } from '@features/tailors/tailors.types';

import { api } from './api';

export const tailorsApi = api.injectEndpoints({
  endpoints: build => ({
    getTailors: build.query<PaginatedTailors, TailorQuery>({
      query: params => ({ url: '/tailors', params }),
      transformResponse: (res: any) => res.data,
      providesTags: ['Tailor'],
    }),
    getTailorBySlug: build.query<Tailor, string>({
      query: slug => `/tailors/${slug}`,
      transformResponse: (res: any) => res.data,
      providesTags: (_r, _e, slug) => [{ type: 'Tailor' as const, id: slug }],
    }),
  }),
});

export const { useGetTailorsQuery, useGetTailorBySlugQuery } = tailorsApi;
