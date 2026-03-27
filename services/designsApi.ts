import type { Design, DesignQuery, PaginatedDesigns } from '@features/designs/designs.types';

import { api } from './api';

export const designsApi = api.injectEndpoints({
  endpoints: build => ({
    getDesigns: build.query<PaginatedDesigns, DesignQuery>({
      query: params => ({ url: '/designs', params }),
      transformResponse: (res: any) => res.data,
      providesTags: ['Design'],
    }),
    getDesignBySlug: build.query<Design, string>({
      query: slug => `/designs/${slug}`,
      transformResponse: (res: any) => res.data,
      providesTags: (_r, _e, slug) => [{ type: 'Design' as const, id: slug }],
    }),
  }),
});

export const { useGetDesignsQuery, useGetDesignBySlugQuery } = designsApi;
