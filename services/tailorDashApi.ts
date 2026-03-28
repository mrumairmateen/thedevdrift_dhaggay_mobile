import { api } from './api';
import type { ApiResponse } from '@features/shop/shop.types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TailorStats {
  activeOrders: number;
  completedThisMonth: number;
  earningsThisMonth: number;
  rating: number;
}

export interface TailorApproval {
  status: 'active' | 'pending' | 'suspended' | 'in_review' | 'rejected';
  rejectedReason: string | null;
  rejectedAt: string | null;
}

/**
 * The backend's 16-status pipeline, scoped to statuses the tailor dashboard cares about.
 * These are the ACTUAL values stored in the Order.status field — NOT custom mobile values.
 */
export type OrderStatus =
  | 'placed'
  | 'accepted_by_seller'
  | 'ready_to_dispatch_to_tailor'
  | 'dispatching_to_tailor'
  | 'delivered_to_tailor'
  | 'tailor_working'
  | 'ready_for_customer_delivery'
  | 'dispatching_to_customer'
  | 'delivered_to_customer'
  | 'finding_replacement_tailor'
  | 'disputed'
  | 'cancelled_by_customer'
  | 'cancelled_by_seller'
  | 'cancelled_by_tailor'
  | 'cancelled_by_admin'
  | 'cancelled_post_dispute';

/** Alias kept for backward-compat — always matches the real pipeline */
export type TailorOrderStatus = OrderStatus;

/**
 * Tab → API status groupings per docs:
 *  new       → delivered_to_tailor
 *  pipeline  → placed | accepted_by_seller | ready_to_dispatch_to_tailor | dispatching_to_tailor
 *  progress  → tailor_working
 *  ready     → ready_for_customer_delivery
 *  completed → delivered_to_customer | cancelled_* | disputed
 */
export type TailorOrderTab = 'new' | 'pipeline' | 'progress' | 'ready' | 'completed' | 'all';

export interface TailorOrderItem {
  _id: string;
  orderNumber: string;
  customerName: string;
  productTitle: string;
  productImage: string | null;
  designTitle: string | null;
  status: OrderStatus;
  stitchingFee: number;
  deadline: string | null;
  measurements: Record<string, number> | null;
  notes: string | null;
  deliveryAddress: {
    line1: string;
    city: string;
    area?: string;
    phone?: string;
  } | null;
  statusHistory: Array<{ status: string; changedAt: string; note?: string }>;
  placedAt: string;
}

export interface PaginatedTailorOrders {
  orders: TailorOrderItem[];
}

export interface TailorOrderQuery {
  tab?: TailorOrderTab;
  page?: number;
  limit?: number;
}

export interface TailorDashboard {
  approval: TailorApproval;
  stats: TailorStats;
  newOrders: TailorOrderItem[];
  activeOrders: TailorOrderItem[];
}

// ─── Profile types ────────────────────────────────────────────────────────────

export interface TailorServiceArea {
  _id: string;
  city: string;
  area: string | null;
}

export interface TailorPortfolioEntry {
  _id: string;
  imageUrl: string;
  publicId: string;
  caption: string | null;
  createdAt: string;
}

export interface TailorPricing {
  shalwarKameez: number;
  suit: number;
  bridal: number;
  custom: number;
}

export interface TailorRatingBreakdown {
  quality: number;
  communication: number;
  timeliness: number;
}

export interface TailorWorkshopAddress {
  line1: string;
  city: string;
  area: string | null;
  phone: string | null;
}

export interface TailorProfileData {
  _id: string;
  userId: string;
  specialisations: string[];
  serviceAreas: TailorServiceArea[];
  pricing: TailorPricing;
  gendersServed: string[];
  portfolio: TailorPortfolioEntry[];
  tier: 'standard' | 'premium' | 'master';
  rating: number;
  ratingBreakdown: TailorRatingBreakdown;
  reviewCount: number;
  completedOrders: number;
  isAvailable: boolean;
  blockedDates: string[];
  weeklyCapacity: number;
  currentLoad: number;
  workshopAddress: TailorWorkshopAddress | null;
  isVerified: boolean;
  status: 'active' | 'pending' | 'suspended' | 'in_review';
  categoryPricing: Array<{ garmentCategoryId: string; garmentCategorySlug: string; price: number }>;
}

// ─── Earnings types ───────────────────────────────────────────────────────────

export interface EarningsPayout {
  _id: string;
  orderNumber: string;
  amount: number;
  status: 'pending' | 'paid' | 'reversed';
  paidAt: string | null;
}

export interface EarningsData {
  thisMonth: number;
  platformFee: number;
  netPayout: number;
  months: Array<{ label: string; amount: number }>;
  tier: 'standard' | 'premium' | 'master';
  rating: number;
  completedOrders: number;
  payouts: EarningsPayout[];
}

export interface TailorProfileInput {
  specialisations?: string[];
  serviceAreas?: Array<{ city: string; area?: string }>;
  weeklyCapacity?: number;
  eidOptIn?: boolean;
  bio?: string;
}

/**
 * Milestone update payload — PATCH /api/v1/orders/:id/milestone
 * The backend field is `stage` (current status) + optional note.
 */
export interface MilestonePayload {
  status: OrderStatus;
  note?: string;
}

// ─── Calendar types ───────────────────────────────────────────────────────────

export interface CalendarDay {
  date: string; // ISO date YYYY-MM-DD
  isBlocked: boolean;
  orders: Array<{ orderId: string; orderNumber: string; deadline: string }>;
}

export interface CalendarData {
  blockedDates: string[]; // array of YYYY-MM-DD strings
  weeklyCapacity: number; // 1–30
  currentLoad: number; // active orders count
  isAvailable: boolean;
  eidOptIn: boolean;
  ordersByDate: Record<string, Array<{ orderId: string; orderNumber: string; deadline: string }>>;
}

export interface UpdateCalendarPayload {
  blockedDates?: string[];
  weeklyCapacity?: number;
  eidOptIn?: boolean;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const tailorDashApi = api.injectEndpoints({
  endpoints: (build) => ({
    getTailorDashboard: build.query<TailorDashboard, void>({
      query: () => '/dashboard/tailor',
      transformResponse: (res: ApiResponse<TailorDashboard>) => res.data,
      providesTags: ['TailorOrder'],
    }),

    getTailorOrders: build.query<PaginatedTailorOrders, TailorOrderQuery>({
      query: ({ tab, page = 1, limit = 20 }) => {
        const params: Record<string, string | number> = { page, limit };
        if (tab !== undefined && tab !== 'all') {
          params['tab'] = tab;
        }
        return { url: '/dashboard/tailor/orders', params };
      },
      transformResponse: (res: ApiResponse<PaginatedTailorOrders>) => res.data,
      providesTags: ['TailorOrder'],
    }),

    getTailorOrderById: build.query<TailorOrderItem, string>({
      query: (id) => `/orders/${id}`,
      transformResponse: (res: ApiResponse<TailorOrderItem>) => res.data,
      providesTags: (_result, _error, id) => [{ type: 'TailorOrder', id }],
    }),

    /**
     * Advance order milestone — PATCH /api/v1/orders/:id/milestone
     * Tailor can only call two transitions:
     *   delivered_to_tailor → tailor_working
     *   tailor_working → ready_for_customer_delivery
     */
    updateOrderMilestone: build.mutation<
      TailorOrderItem,
      { id: string; status: OrderStatus; note?: string }
    >({
      query: ({ id, status, note }) => ({
        url: `/orders/${id}/milestone`,
        method: 'PATCH',
        body: note !== undefined ? { status, note } : { status },
      }),
      transformResponse: (res: ApiResponse<TailorOrderItem>) => res.data,
      invalidatesTags: ['TailorOrder'],
    }),

    getEarnings: build.query<EarningsData, void>({
      query: () => '/dashboard/tailor/earnings',
      transformResponse: (res: ApiResponse<EarningsData>) => res.data,
    }),

    getTailorProfile: build.query<TailorProfileData, void>({
      query: () => '/dashboard/tailor/profile',
      transformResponse: (res: ApiResponse<TailorProfileData>) => res.data,
      providesTags: ['TailorOrder'],
    }),

    getTailorCalendar: build.query<CalendarData, void>({
      query: () => '/dashboard/tailor/calendar',
      transformResponse: (res: ApiResponse<CalendarData>) => res.data,
      providesTags: ['TailorCalendar'],
    }),

    updateCalendar: build.mutation<CalendarData, UpdateCalendarPayload>({
      query: (body) => ({
        url: '/tailors/calendar',
        method: 'PATCH',
        body,
      }),
      transformResponse: (res: ApiResponse<CalendarData>) => res.data,
      invalidatesTags: ['TailorCalendar'],
    }),

    updateTailorProfile: build.mutation<{ success: boolean }, TailorProfileInput>({
      query: (body) => ({
        url: '/tailors/profile',
        method: 'PATCH',
        body,
      }),
      transformResponse: (res: ApiResponse<{ success: boolean }>) => res.data,
    }),
  }),
  overrideExisting: process.env.NODE_ENV !== 'production',
});

export const {
  useGetTailorDashboardQuery,
  useGetTailorOrdersQuery,
  useGetTailorOrderByIdQuery,
  useUpdateOrderMilestoneMutation,
  useGetTailorProfileQuery,
  useGetEarningsQuery,
  useGetTailorCalendarQuery,
  useUpdateCalendarMutation,
  useUpdateTailorProfileMutation,
} = tailorDashApi;
