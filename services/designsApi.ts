import { api } from './api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface DesignQuery {
  page?: number;
  limit?: number;
  occasion?: string;
  gender?: 'male' | 'female' | 'kids' | 'unisex';
  search?: string;
  sort?: 'newest' | 'trending' | 'popular';
  category?: string;
}

export interface Design {
  _id: string;
  slug: string;
  title: string;
  occasion: string[];
  gender: string;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  isTrending: boolean;
  category: string;
  description?: string;
  tailorId?: string;
  createdAt: string;
}

export interface PaginatedDesigns {
  designs: Design[];
  total: number;
  page: number;
  pages: number;
}

export const designsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getDesigns: build.query<PaginatedDesigns, DesignQuery>({
      query: (params) => ({ url: '/designs', params }),
      transformResponse: (res: ApiResponse<PaginatedDesigns>) => res.data,
      providesTags: ['Design'],
    }),

    getDesignBySlug: build.query<Design, string>({
      query: (slug) => `/designs/${slug}`,
      transformResponse: (res: ApiResponse<Design>) => res.data,
      providesTags: (_r, _e, slug) => [{ type: 'Design' as const, id: slug }],
    }),

    getTrendingDesigns: build.query<Design[], void>({
      query: () => ({ url: '/designs', params: { sort: 'trending', limit: 20 } }),
      transformResponse: (res: ApiResponse<PaginatedDesigns>) => res.data.designs,
      providesTags: ['Design'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDesignsQuery,
  useGetDesignBySlugQuery,
  useGetTrendingDesignsQuery,
} = designsApi;
