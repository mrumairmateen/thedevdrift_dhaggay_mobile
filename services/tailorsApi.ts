import { api } from './api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface TailorQuery {
  page?: number;
  limit?: number;
  city?: string;
  tier?: 'Master' | 'Premium' | 'Standard';
  search?: string;
  sort?: 'rating' | 'newest' | 'popular';
  available?: boolean;
}

export interface TailorProfile {
  _id: string;
  slug: string;
  name: string;
  bio?: string;
  city: string;
  tier: 'Master' | 'Premium' | 'Standard';
  rating: number;
  reviewCount: number;
  completedOrders: number;
  startingPrice: number;
  isAvailable: boolean;
  avatarUrl: string | null;
  portfolioImages: string[];
  specialties: string[];
  turnaroundDays: number;
  isVerified: boolean;
}

export interface PaginatedTailors {
  tailors: TailorProfile[];
  total: number;
  page: number;
  pages: number;
}

export const tailorsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getTailors: build.query<PaginatedTailors, TailorQuery>({
      query: (params) => ({ url: '/tailors', params }),
      transformResponse: (res: ApiResponse<PaginatedTailors>) => res.data,
      providesTags: ['Tailor'],
    }),

    getTailorBySlug: build.query<TailorProfile, string>({
      query: (slug) => `/tailors/${slug}`,
      transformResponse: (res: ApiResponse<TailorProfile>) => res.data,
      providesTags: (_r, _e, slug) => [{ type: 'Tailor' as const, id: slug }],
    }),

    getFeaturedTailors: build.query<TailorProfile[], void>({
      query: () => ({ url: '/tailors', params: { sort: 'rating', limit: 10 } }),
      transformResponse: (res: ApiResponse<PaginatedTailors>) => res.data.tailors,
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
