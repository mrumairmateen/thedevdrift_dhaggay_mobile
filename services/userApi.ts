import { api } from './api';
import type {
  AddressInput,
  ChangePasswordInput,
  NotificationPrefs,
  UpdateProfileInput,
  UserProfile,
} from '@features/dashboard/dashboard.types';

export const userApi = api.injectEndpoints({
  endpoints: (build) => ({
    getMe: build.query<UserProfile, void>({
      query: () => '/users/me',
      transformResponse: (res: any) => res.data,
      providesTags: ['User'],
    }),

    updateProfile: build.mutation<UserProfile, UpdateProfileInput>({
      query: (body) => ({ url: '/users/me', method: 'PATCH', body }),
      transformResponse: (res: any) => res.data,
      invalidatesTags: ['User'],
    }),

    changePassword: build.mutation<void, ChangePasswordInput>({
      query: (body) => ({ url: '/users/me/password', method: 'PATCH', body }),
    }),

    updateNotifications: build.mutation<void, Partial<NotificationPrefs>>({
      query: (body) => ({ url: '/users/me/notifications', method: 'PATCH', body }),
      invalidatesTags: ['User'],
    }),

    addAddress: build.mutation<UserProfile, AddressInput>({
      query: (body) => ({ url: '/users/me/addresses', method: 'POST', body }),
      transformResponse: (res: any) => res.data,
      invalidatesTags: ['User'],
    }),

    updateAddress: build.mutation<UserProfile, { id: string } & Partial<AddressInput>>({
      query: ({ id, ...body }) => ({ url: `/users/me/addresses/${id}`, method: 'PATCH', body }),
      transformResponse: (res: any) => res.data,
      invalidatesTags: ['User'],
    }),

    deleteAddress: build.mutation<void, string>({
      query: (id) => ({ url: `/users/me/addresses/${id}`, method: 'DELETE' }),
      invalidatesTags: ['User'],
    }),

    setDefaultAddress: build.mutation<void, string>({
      query: (id) => ({ url: `/users/me/addresses/${id}/default`, method: 'PATCH' }),
      invalidatesTags: ['User'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMeQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useUpdateNotificationsMutation,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
} = userApi;
