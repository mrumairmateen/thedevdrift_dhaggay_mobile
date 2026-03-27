import { api } from './api';
import type {
  ApiResponse,
  PaginatedProducts,
  PaginatedShops,
  ProductQuery,
  Shop,
  ShopProduct,
  StoreQuery,
} from '@features/shop/shop.types';

export const shopApi = api.injectEndpoints({
  endpoints: builder => ({
    getProducts: builder.query<PaginatedProducts, ProductQuery>({
      query: params => ({ url: '/products', params }),
      transformResponse: (res: ApiResponse<PaginatedProducts>) => res.data,
      providesTags: ['Product'],
    }),

    getProductBySlug: builder.query<ShopProduct, string>({
      query: slug => `/products/${slug}`,
      transformResponse: (res: ApiResponse<ShopProduct>) => res.data,
      providesTags: (_, __, slug) => [{ type: 'Product', id: slug }],
    }),

    getShops: builder.query<PaginatedShops, StoreQuery>({
      query: params => ({ url: '/shops', params }),
      transformResponse: (res: ApiResponse<PaginatedShops>) => res.data,
      providesTags: ['Shop'],
    }),

    getShopBySlug: builder.query<Shop, string>({
      query: slug => `/shops/${slug}`,
      transformResponse: (res: ApiResponse<Shop>) => res.data,
      providesTags: (_, __, slug) => [{ type: 'Shop', id: slug }],
    }),

    getShopProducts: builder.query<PaginatedProducts, { slug: string } & ProductQuery>({
      query: ({ slug, ...params }) => ({ url: `/shops/${slug}/products`, params }),
      transformResponse: (res: ApiResponse<PaginatedProducts>) => res.data,
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductBySlugQuery,
  useGetShopsQuery,
  useGetShopBySlugQuery,
  useGetShopProductsQuery,
} = shopApi;
