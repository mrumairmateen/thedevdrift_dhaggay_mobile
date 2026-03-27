import { api } from './api';
import type { ApiResponse } from '@features/shop/shop.types';

// ─── Types ────────────────────────────────────────────────────────────────────

export type DeliveryTaskStatus =
  | 'assigned'
  | 'en_route_pickup'
  | 'picked_up'
  | 'en_route_delivery'
  | 'delivered'
  | 'failed'
  | 'returned';

export interface DeliveryTask {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  productTitle: string;
  pickupAddress: {
    type: 'seller' | 'tailor';
    name: string;
    line1: string;
    city: string;
    area?: string;
    phone?: string;
  };
  deliveryAddress: {
    line1: string;
    city: string;
    area?: string;
    phone: string;
  };
  status: DeliveryTaskStatus;
  assignedAt: string;
  estimatedDelivery: string | null;
  deliveryFee: number;
  notes: string | null;
}

export interface DeliveryStats {
  todayDeliveries: number;
  todayEarnings: number;
  totalDelivered: number;
  successRate: number;
}

export interface DeliveryDashboard {
  stats: DeliveryStats;
  activeTasks: DeliveryTask[];
  isOnDuty: boolean;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const deliveryApi = api.injectEndpoints({
  endpoints: (build) => ({
    getDeliveryDashboard: build.query<DeliveryDashboard, void>({
      query: () => '/delivery/dashboard',
      transformResponse: (res: ApiResponse<DeliveryDashboard>) => res.data,
      providesTags: ['DeliveryTask'],
    }),

    updateTaskStatus: build.mutation<
      DeliveryTask,
      { id: string; status: DeliveryTaskStatus; note?: string }
    >({
      query: ({ id, status, note }) => ({
        url: `/delivery/tasks/${id}/status`,
        method: 'PATCH',
        body: { status, ...(note !== undefined ? { note } : {}) },
      }),
      transformResponse: (res: ApiResponse<DeliveryTask>) => res.data,
      invalidatesTags: ['DeliveryTask'],
    }),

    toggleDutyStatus: build.mutation<{ isOnDuty: boolean }, { isOnDuty: boolean }>({
      query: (body) => ({
        url: '/delivery/duty',
        method: 'PATCH',
        body,
      }),
      transformResponse: (res: ApiResponse<{ isOnDuty: boolean }>) => res.data,
      invalidatesTags: ['DeliveryTask'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDeliveryDashboardQuery,
  useUpdateTaskStatusMutation,
  useToggleDutyStatusMutation,
} = deliveryApi;
