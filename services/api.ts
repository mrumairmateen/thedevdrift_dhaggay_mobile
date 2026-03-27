import Constants from 'expo-constants';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

/**
 * Resolves the API base URL in priority order:
 *  1. EXPO_PUBLIC_API_URL   — explicit override (.env / EAS secrets for staging & prod)
 *  2. Constants.hostUri     — Metro-derived host in dev, auto-works on physical device,
 *                             Android emulator (10.0.2.2) and iOS simulator (127.0.0.1)
 *  3. localhost fallback    — Expo Go / iOS simulator without Metro host info
 */
function getBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  const host = Constants.expoConfig?.hostUri?.split(':')[0] ?? 'localhost';
  return `http://${host}:3000/api/v1`;
}

const BASE_URL = getBaseUrl();

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: headers => {
      headers.set('X-Client', 'mobile');
      return headers;
    },
  }),
  tagTypes: ['Product', 'Shop', 'Cart', 'Order', 'User', 'Tailor', 'Design'],
  endpoints: () => ({}),
});
