import { api } from './api';
import type { ApiResponse } from '@features/shop/shop.types';
import type {
  Address,
  AddressInput,
  ChangePasswordInput,
  NotificationPrefs,
  UpdateProfileInput,
  UserProfile,
} from '@features/dashboard/dashboard.types';

export const userApi = api.injectEndpoints({
  endpoints: (build) => ({
    getProfile: build.query<UserProfile, void>({
      query: () => '/users/me',
      transformResponse: (res: ApiResponse<UserProfile>) => res.data,
      providesTags: ['User'],
    }),

    updateProfile: build.mutation<UserProfile, UpdateProfileInput>({
      query: (body) => ({ url: '/users/me', method: 'PATCH', body }),
      transformResponse: (res: ApiResponse<UserProfile>) => res.data,
      invalidatesTags: ['User'],
    }),

    changePassword: build.mutation<{ message: string }, ChangePasswordInput>({
      query: (body) => ({ url: '/users/me/password', method: 'PATCH', body }),
      transformResponse: (res: ApiResponse<{ message: string }>) => res.data,
    }),

    getAddresses: build.query<Address[], void>({
      query: () => '/users/me/addresses',
      transformResponse: (res: ApiResponse<Address[]>) => res.data,
      providesTags: ['User'],
    }),

    addAddress: build.mutation<Address, AddressInput>({
      query: (body) => ({ url: '/users/me/addresses', method: 'POST', body }),
      transformResponse: (res: ApiResponse<Address>) => res.data,
      invalidatesTags: ['User'],
    }),

    updateAddress: build.mutation<Address, { id: string; body: AddressInput }>({
      query: ({ id, body }) => ({ url: `/users/me/addresses/${id}`, method: 'PATCH', body }),
      transformResponse: (res: ApiResponse<Address>) => res.data,
      invalidatesTags: ['User'],
    }),

    deleteAddress: build.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/users/me/addresses/${id}`, method: 'DELETE' }),
      transformResponse: (res: ApiResponse<{ message: string }>) => res.data,
      invalidatesTags: ['User'],
    }),

    setDefaultAddress: build.mutation<Address, string>({
      query: (id) => ({ url: `/users/me/addresses/${id}/default`, method: 'PATCH' }),
      transformResponse: (res: ApiResponse<Address>) => res.data,
      invalidatesTags: ['User'],
    }),

    updateNotificationPrefs: build.mutation<NotificationPrefs, Partial<NotificationPrefs>>({
      query: (body) => ({ url: '/users/me/notifications', method: 'PATCH', body }),
      transformResponse: (res: ApiResponse<NotificationPrefs>) => res.data,
      invalidatesTags: ['User'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useGetAddressesQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
  useUpdateNotificationPrefsMutation,
} = userApi;
