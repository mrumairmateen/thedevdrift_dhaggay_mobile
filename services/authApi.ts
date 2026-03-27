import { api } from './api';
import type { AuthUser } from '@store/authSlice';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

interface AuthPayload {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

interface RefreshPayload {
  accessToken: string;
  refreshToken: string;
}

export const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    mobileLogin: build.mutation<AuthPayload, { phone: string; password: string }>({
      query: (body) => ({ url: '/auth/mobile/login', method: 'POST', body }),
      transformResponse: (res: ApiResponse<AuthPayload>) => res.data,
    }),

    mobileRegister: build.mutation<
      AuthPayload,
      { name: string; phone: string; password: string; role: 'customer' | 'seller' | 'tailor' }
    >({
      query: (body) => ({ url: '/auth/mobile/register', method: 'POST', body }),
      transformResponse: (res: ApiResponse<AuthPayload>) => res.data,
    }),

    refreshToken: build.mutation<RefreshPayload, { refreshToken: string }>({
      query: (body) => ({ url: '/auth/mobile/refresh', method: 'POST', body }),
      transformResponse: (res: ApiResponse<RefreshPayload>) => res.data,
    }),

    logout: build.mutation<void, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useMobileLoginMutation,
  useMobileRegisterMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
} = authApi;
