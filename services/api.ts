import Constants from 'expo-constants';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { setCredentials, clearCredentials } from '@store/authSlice';
import { saveAuthTokens, clearAuthTokens } from '@store/secureAuth';

/**
 * Resolves the API base URL in priority order:
 *  1. EXPO_PUBLIC_API_URL   — explicit override (.env / EAS secrets for staging & prod)
 *  2. Constants.hostUri     — Metro-derived host in dev, auto-works on physical device,
 *                             Android emulator (10.0.2.2) and iOS simulator (127.0.0.1)
 *  3. localhost fallback    — Expo Go / iOS simulator without Metro host info
 */
function getBaseUrl(): string {
  const apiUrl = process.env['EXPO_PUBLIC_API_URL'];
  if (apiUrl) return apiUrl;
  const host = Constants.expoConfig?.hostUri?.split(':')[0] ?? 'localhost';
  return `http://${host}:3000/api/v1`;
}

const BASE_URL = getBaseUrl();

const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    headers.set('X-Client', 'mobile');
    const token = (getState() as { auth?: { accessToken?: string } }).auth?.accessToken;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

/**
 * Mutex so that only one concurrent refresh runs at a time.
 * Any other request that hits 401 while a refresh is in flight
 * will wait for the same promise rather than firing a second refresh.
 */
let refreshPromise: Promise<boolean> | null = null;

/**
 * Base query with:
 *  - Console logging for every request/response
 *  - Automatic token refresh on 401: calls /auth/mobile/refresh, retries once,
 *    then clears credentials (forces re-login) if refresh also fails.
 *  - Mutex: concurrent 401s share a single refresh attempt (no token-rotation races).
 */
const loggedBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  const url = typeof args === 'string' ? args : args.url;
  const method = typeof args === 'string' ? 'GET' : (args.method ?? 'GET');
  console.log(`[API] --> ${method} ${BASE_URL}${url}`);

  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error) {
    console.warn(`[API] <-- ERROR ${method} ${url}`, result.error);
  } else {
    console.log(`[API] <-- OK ${method} ${url}`, result.data);
  }

  // On 401 — attempt token refresh once, then retry the original request
  if (result.error?.status === 401) {
    const authState = (api.getState() as { auth?: { user?: unknown; refreshToken?: string | null } }).auth;
    const refreshToken = authState?.refreshToken;

    if (refreshToken) {
      // If no refresh is in flight, start one; otherwise reuse the existing promise
      if (refreshPromise === null) {
        console.log('[API] --> Token refresh attempt');
        refreshPromise = (async (): Promise<boolean> => {
          try {
            const refreshResult = await rawBaseQuery(
              { url: '/auth/mobile/refresh', method: 'POST', body: { refreshToken } },
              api,
              extraOptions,
            );

            if (refreshResult.data) {
              const refreshed = refreshResult.data as { accessToken: string; refreshToken: string };
              const user = authState?.user as Parameters<typeof setCredentials>[0]['user'];
              console.log('[API] <-- Token refreshed OK');
              api.dispatch(setCredentials({ user, accessToken: refreshed.accessToken, refreshToken: refreshed.refreshToken }));
              void saveAuthTokens({ user, accessToken: refreshed.accessToken, refreshToken: refreshed.refreshToken });
              return true;
            }

            console.warn('[API] <-- Token refresh FAILED — clearing session');
            api.dispatch(clearCredentials());
            void clearAuthTokens();
            return false;
          } finally {
            refreshPromise = null;
          }
        })();
      } else {
        console.log('[API] --> Waiting for in-flight token refresh');
      }

      const refreshed = await refreshPromise;
      if (refreshed) {
        console.log(`[API] --> Retrying ${method} ${url}`);
        result = await rawBaseQuery(args, api, extraOptions);
        if (result.error) {
          console.warn(`[API] <-- ERROR (retry) ${method} ${url}`, result.error);
        } else {
          console.log(`[API] <-- OK (retry) ${method} ${url}`);
        }
      }
    } else {
      console.warn('[API] <-- 401 and no refresh token — clearing session');
      api.dispatch(clearCredentials());
      void clearAuthTokens();
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: loggedBaseQuery,
  tagTypes: ['Product', 'Shop', 'Cart', 'Order', 'User', 'Tailor', 'Design', 'Auth', 'Loyalty', 'Wishlist', 'Measurement', 'SellerOrder', 'SellerProduct', 'SellerPromo', 'SellerReview', 'TailorOrder', 'TailorCalendar', 'AdminUser', 'AdminOrder', 'AdminDispute', 'DeliveryTask', 'AdminReview', 'AdminDesign', 'AdminPromo', 'AdminBanner'],
  endpoints: () => ({}),
});
