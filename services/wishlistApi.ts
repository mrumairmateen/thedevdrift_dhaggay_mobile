import { api } from './api';
import type { ApiResponse } from '@features/shop/shop.types';
import type { WishlistData } from '@features/dashboard/dashboard.types';

export const wishlistApi = api.injectEndpoints({
  endpoints: (build) => ({
    getWishlist: build.query<WishlistData, void>({
      query: () => '/users/wishlist',
      transformResponse: (res: ApiResponse<WishlistData>) => res.data,
      providesTags: ['Wishlist'],
    }),

    toggleProductWishlist: build.mutation<{ added: boolean }, string>({
      query: (productId) => ({
        url: `/products/${productId}/wishlist`,
        method: 'POST',
      }),
      transformResponse: (res: ApiResponse<{ added: boolean }>) => res.data,
      invalidatesTags: ['Wishlist'],
    }),

    toggleDesignWishlist: build.mutation<{ added: boolean }, string>({
      query: (designId) => ({
        url: `/designs/${designId}/wishlist`,
        method: 'POST',
      }),
      transformResponse: (res: ApiResponse<{ added: boolean }>) => res.data,
      invalidatesTags: ['Wishlist'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetWishlistQuery,
  useToggleProductWishlistMutation,
  useToggleDesignWishlistMutation,
} = wishlistApi;
