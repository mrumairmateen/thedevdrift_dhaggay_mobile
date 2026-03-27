import { api } from './api';
import type { ApiResponse } from '@features/shop/shop.types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminKPIs {
  totalGmv: number;
  ordersToday: number;
  activeTailors: number;
  revenueToday: number;
  pendingTailorApprovals: number;
  pendingSellerApprovals: number;
  openDisputes: number;
  flaggedReviews: number;
}

export interface AdminOverview {
  totalGmv: number;
  ordersToday: number;
  activeTailors: number;
  revenueToday: number;
  pendingTailorApprovals: number;
  pendingSellerApprovals: number;
  openDisputes: number;
  flaggedReviews: number;
}

export interface AdminOrder {
  _id: string;
  orderNumber: string;
  customerName: string;
  sellerName: string;
  tailorName: string | null;
  productTitle: string;
  totalAmount: number;
  status: string;
  placedAt: string;
  city: string | null;
}

export type AdminUserRole = 'customer' | 'seller' | 'tailor' | 'delivery' | 'admin';
export type AdminUserStatus = 'active' | 'pending' | 'suspended' | 'in_review';

export interface AdminUser {
  _id: string;
  name: string;
  phone: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  avatarUrl: string | null;
  createdAt: string;
}

export interface PaginatedAdminUsers {
  users: AdminUser[];
  total: number;
  page: number;
  pages: number;
}

export interface AdminUserQuery {
  role?: AdminUserRole;
  status?: AdminUserStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedAdminOrders {
  orders: AdminOrder[];
  total: number;
  page: number;
  pages: number;
}

export interface AdminOrderQuery {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export type DisputeOutcome =
  | 'refund_customer'
  | 'warn_tailor'
  | 'close_no_action'
  | 'suspend_tailor';

export interface AdminDispute {
  _id: string;
  orderNumber: string;
  customerName: string;
  sellerName: string;
  reason: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  openedAt: string;
  resolvedAt: string | null;
  resolution: string | null;
}

export interface PaginatedDisputes {
  disputes: AdminDispute[];
  total: number;
  page: number;
  pages: number;
}

export interface FinanceData {
  totalRevenue: number;
  platformFees: number;
  sellerPayouts: number;
  tailorPayouts: number;
  refundsIssued: number;
  revenueByDay: Array<{ date: string; revenue: number }>;
}

// ─── Phase 3 Types ────────────────────────────────────────────────────────────

export interface FlaggedReview {
  _id: string;
  reviewerId: { name: string } | null;
  targetType: 'product' | 'tailor' | 'seller' | 'platform';
  targetName: string | null;
  ratings: { overall: number };
  comment: string;
  flagged: { reason: string; flaggedAt: string };
  moderation: { status: 'pending' | 'approved' | 'removed'; removedReason?: string };
  createdAt: string;
}

export interface PaginatedFlaggedReviews {
  reviews: FlaggedReview[];
  total: number;
  page: number;
  pages: number;
}

export interface AdminDesign {
  _id: string;
  slug: string;
  title: string;
  garmentCategorySlug: string;
  occasion: string[];
  gender: string;
  isTrending: boolean;
  imageUrl: string | null;
  usageCount: number;
  createdAt: string;
}

export interface AdminCategory {
  _id: string;
  slug: string;
  name: string;
  gender: string;
  isActive: boolean;
  sortOrder: number;
  tailorSpecialisation: string;
  measurementFields: string[];
}

export interface PlatformPromo {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderValue: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
}

export interface AdminBanner {
  _id: string;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  order: number;
}

export interface PlatformSettings {
  commissionRate: number;
  maintenanceMode: boolean;
  loyaltyConversionRate: number;
  loyaltyExpiryDays: number;
  minRedemptionPts: number;
  tierThresholds: { premium: number; master: number };
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const adminApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAdminOverview: build.query<AdminOverview, void>({
      query: () => '/admin/overview',
      transformResponse: (res: ApiResponse<AdminOverview>) => res.data,
      providesTags: ['AdminUser', 'AdminOrder', 'AdminDispute'],
    }),

    getAdminUsers: build.query<PaginatedAdminUsers, AdminUserQuery>({
      query: ({ role, status, search, page, limit }) => ({
        url: '/admin/users',
        params: { role, status, search, page, limit },
      }),
      transformResponse: (res: ApiResponse<PaginatedAdminUsers>) => res.data,
      providesTags: ['AdminUser'],
    }),

    approveUser: build.mutation<AdminUser, { id: string }>({
      query: ({ id }) => ({
        url: `/admin/users/${id}/approve`,
        method: 'PATCH',
      }),
      transformResponse: (res: ApiResponse<AdminUser>) => res.data,
      invalidatesTags: ['AdminUser'],
    }),

    suspendUser: build.mutation<AdminUser, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/admin/users/${id}/suspend`,
        method: 'PATCH',
        body: { reason },
      }),
      transformResponse: (res: ApiResponse<AdminUser>) => res.data,
      invalidatesTags: ['AdminUser'],
    }),

    getAdminOrders: build.query<PaginatedAdminOrders, AdminOrderQuery>({
      query: ({ status, search, page, limit }) => ({
        url: '/admin/orders',
        params: { status, search, page, limit },
      }),
      transformResponse: (res: ApiResponse<PaginatedAdminOrders>) => res.data,
      providesTags: ['AdminOrder'],
    }),

    forceCancel: build.mutation<{ success: boolean }, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/admin/orders/${id}/cancel`,
        method: 'POST',
        body: { reason },
      }),
      transformResponse: (res: ApiResponse<{ success: boolean }>) => res.data,
      invalidatesTags: ['AdminOrder'],
    }),

    getDisputes: build.query<PaginatedDisputes, { status?: string; page?: number; limit?: number }>({
      query: ({ status, page, limit }) => ({
        url: '/admin/disputes',
        params: { status, page, limit },
      }),
      transformResponse: (res: ApiResponse<PaginatedDisputes>) => res.data,
      providesTags: ['AdminDispute'],
    }),

    resolveDispute: build.mutation<
      AdminDispute,
      { id: string; resolution: string; outcome: DisputeOutcome }
    >({
      query: ({ id, resolution, outcome }) => ({
        url: `/admin/disputes/${id}/resolve`,
        method: 'PATCH',
        body: { outcome, notes: resolution },
      }),
      transformResponse: (res: ApiResponse<AdminDispute>) => res.data,
      invalidatesTags: ['AdminDispute'],
    }),

    getFinanceData: build.query<FinanceData, void>({
      query: () => '/admin/finance',
      transformResponse: (res: ApiResponse<FinanceData>) => res.data,
    }),

    // ─── Phase 3 endpoints ──────────────────────────────────────────────────

    getFlaggedReviews: build.query<PaginatedFlaggedReviews, { page?: number; limit?: number }>({
      query: ({ page, limit }) => ({
        url: '/admin/reviews/flagged',
        params: { page, limit },
      }),
      transformResponse: (res: ApiResponse<PaginatedFlaggedReviews>) => res.data,
      providesTags: ['AdminReview'],
    }),

    moderateReview: build.mutation<
      FlaggedReview,
      { id: string; action: 'approve' | 'remove'; removedReason?: string }
    >({
      query: ({ id, action, removedReason }) => ({
        url: `/admin/reviews/${id}/moderate`,
        method: 'PATCH',
        body: { action, ...(removedReason !== undefined ? { reason: removedReason } : {}) },
      }),
      transformResponse: (res: ApiResponse<FlaggedReview>) => res.data,
      invalidatesTags: ['AdminReview'],
    }),

    getAdminDesigns: build.query<
      { designs: AdminDesign[]; total: number; page: number; pages: number },
      { page?: number; limit?: number }
    >({
      query: ({ page, limit }) => ({
        url: '/designs',
        params: { page, limit },
      }),
      transformResponse: (res: ApiResponse<{ designs: AdminDesign[]; total: number; page: number; pages: number }>) =>
        res.data,
      providesTags: ['AdminDesign'],
    }),

    toggleDesignTrending: build.mutation<AdminDesign, { id: string; isTrending: boolean }>({
      query: ({ id, isTrending }) => ({
        url: `/designs/${id}`,
        method: 'PATCH',
        body: { isTrending },
      }),
      transformResponse: (res: ApiResponse<AdminDesign>) => res.data,
      invalidatesTags: ['AdminDesign'],
    }),

    getAdminCategories: build.query<AdminCategory[], void>({
      query: () => '/garment-categories',
      transformResponse: (res: ApiResponse<AdminCategory[]>) => res.data,
    }),

    toggleCategoryActive: build.mutation<AdminCategory, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `/garment-categories/${id}`,
        method: 'PATCH',
        body: { isActive },
      }),
      transformResponse: (res: ApiResponse<AdminCategory>) => res.data,
    }),

    getPlatformPromos: build.query<PlatformPromo[], void>({
      query: () => '/admin/promotions',
      transformResponse: (res: ApiResponse<PlatformPromo[]>) => res.data,
      providesTags: ['AdminPromo'],
    }),

    createPlatformPromo: build.mutation<
      PlatformPromo,
      {
        code: string;
        type: 'percentage' | 'fixed';
        value: number;
        minOrderValue?: number;
        maxUses?: number;
        expiresAt?: string;
      }
    >({
      query: (body) => ({
        url: '/admin/promotions',
        method: 'POST',
        body,
      }),
      transformResponse: (res: ApiResponse<PlatformPromo>) => res.data,
      invalidatesTags: ['AdminPromo'],
    }),

    togglePlatformPromo: build.mutation<PlatformPromo, { id: string }>({
      query: ({ id }) => ({
        url: `/admin/promotions/${id}/toggle`,
        method: 'PATCH',
      }),
      transformResponse: (res: ApiResponse<PlatformPromo>) => res.data,
      invalidatesTags: ['AdminPromo'],
    }),

    getAdminBanners: build.query<AdminBanner[], void>({
      query: () => '/admin/banners',
      transformResponse: (res: ApiResponse<AdminBanner[]>) => res.data,
      providesTags: ['AdminBanner'],
    }),

    toggleBanner: build.mutation<AdminBanner, { id: string; isActive: boolean }>({
      query: ({ id, isActive }) => ({
        url: `/admin/banners/${id}`,
        method: 'PATCH',
        body: { isActive },
      }),
      transformResponse: (res: ApiResponse<AdminBanner>) => res.data,
      invalidatesTags: ['AdminBanner'],
    }),

    getPlatformSettings: build.query<PlatformSettings, void>({
      query: () => '/admin/settings',
      transformResponse: (res: ApiResponse<PlatformSettings>) => res.data,
    }),

    updatePlatformSettings: build.mutation<PlatformSettings, Partial<PlatformSettings>>({
      query: (body) => ({
        url: '/admin/settings',
        method: 'PATCH',
        body,
      }),
      transformResponse: (res: ApiResponse<PlatformSettings>) => res.data,
    }),

    broadcastNotification: build.mutation<
      { sent: number },
      {
        title: string;
        body: string;
        targetRole?: 'customer' | 'seller' | 'tailor' | 'delivery' | 'all';
      }
    >({
      query: (body) => ({
        url: '/admin/notifications/broadcast',
        method: 'POST',
        body,
      }),
      transformResponse: (res: ApiResponse<{ sent: number }>) => res.data,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAdminOverviewQuery,
  useGetAdminUsersQuery,
  useApproveUserMutation,
  useSuspendUserMutation,
  useGetAdminOrdersQuery,
  useForceCancelMutation,
  useGetDisputesQuery,
  useResolveDisputeMutation,
  useGetFinanceDataQuery,
  useGetFlaggedReviewsQuery,
  useModerateReviewMutation,
  useGetAdminDesignsQuery,
  useToggleDesignTrendingMutation,
  useGetAdminCategoriesQuery,
  useToggleCategoryActiveMutation,
  useGetPlatformPromosQuery,
  useCreatePlatformPromoMutation,
  useTogglePlatformPromoMutation,
  useGetAdminBannersQuery,
  useToggleBannerMutation,
  useGetPlatformSettingsQuery,
  useUpdatePlatformSettingsMutation,
  useBroadcastNotificationMutation,
} = adminApi;
