import { api } from './api';
import type { ApiResponse } from '@features/shop/shop.types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Measurement {
  _id: string;
  label: string;
  chest: number;
  waist: number;
  hips: number;
  shoulder: number;
  length: number;
  sleeveLength?: number;
  customNotes?: string;
  isDefault: boolean;
  createdAt?: string;
}

export interface MeasurementPayload {
  label: string;
  chest: number;
  waist: number;
  hips: number;
  shoulder: number;
  length: number;
  sleeveLength?: number;
  customNotes?: string;
  isDefault?: boolean;
}

// ─── API slice ────────────────────────────────────────────────────────────────

export const measurementsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getMeasurements: build.query<Measurement[], void>({
      query: () => '/measurements',
      transformResponse: (res: ApiResponse<Measurement[]>) => res.data,
      providesTags: ['Measurement'],
    }),

    createMeasurement: build.mutation<Measurement, MeasurementPayload>({
      query: (body) => ({ url: '/measurements', method: 'POST', body }),
      transformResponse: (res: ApiResponse<Measurement>) => res.data,
      invalidatesTags: ['Measurement'],
    }),

    updateMeasurement: build.mutation<Measurement, { id: string; body: Partial<MeasurementPayload> }>({
      query: ({ id, body }) => ({ url: `/measurements/${id}`, method: 'PUT', body }),
      transformResponse: (res: ApiResponse<Measurement>) => res.data,
      invalidatesTags: ['Measurement'],
    }),

    deleteMeasurement: build.mutation<void, string>({
      query: (id) => ({ url: `/measurements/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Measurement'],
    }),

    setDefaultMeasurement: build.mutation<Measurement, string>({
      query: (id) => ({ url: `/measurements/${id}/default`, method: 'PATCH' }),
      transformResponse: (res: ApiResponse<Measurement>) => res.data,
      invalidatesTags: ['Measurement'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMeasurementsQuery,
  useCreateMeasurementMutation,
  useUpdateMeasurementMutation,
  useDeleteMeasurementMutation,
  useSetDefaultMeasurementMutation,
} = measurementsApi;
