import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// In development, point to the local Express server
// TODO: swap to env var / EAS secret for staging/prod
const BASE_URL = 'http://localhost:3000/api/v1';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: headers => {
      headers.set('X-Client', 'mobile');
      return headers;
    },
  }),
  tagTypes: ['Product', 'Shop', 'Cart', 'Order', 'User'],
  endpoints: () => ({}),
});
