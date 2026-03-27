import { api } from './api';
import type { WishlistData } from '@features/dashboard/dashboard.types';

export const wishlistApi = api.injectEndpoints({
  endpoints: (build) => ({
    getWishlist: build.query<WishlistData, void>({
      query: () => '/users/wishlist',
      transformResponse: (res: any) => res.data,
      providesTags: ['Wishlist'],
    }),

    toggleProductWishlist: build.mutation<void, { productId: string; action: 'add' | 'remove' }>({
      query: ({ productId, action }) => ({
        url: `/products/${productId}/wishlist`,
        method: action === 'add' ? 'POST' : 'DELETE',
      }),
      invalidatesTags: ['Wishlist'],
    }),

    toggleDesignWishlist: build.mutation<void, { designId: string; action: 'add' | 'remove' }>({
      query: ({ designId, action }) => ({
        url: `/designs/${designId}/wishlist`,
        method: action === 'add' ? 'POST' : 'DELETE',
      }),
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
