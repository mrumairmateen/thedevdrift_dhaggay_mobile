import { api } from './api';
import type { ApiResponse } from '@features/shop/shop.types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SellerStats {
  totalProducts: number;
  pendingOrders: number;
  revenueThisMonth: number;
  storeRating: number;
}

export interface SellerApproval {
  status: 'active' | 'pending' | 'suspended';
  rejectedReason: string | null;
  rejectedAt: string | null;
}

/**
 * The real API status pipeline values (from orders.md).
 * The mobile UI maps these to human-readable tab labels.
 */
export type SellerOrderApiStatus =
  | 'placed'
  | 'accepted_by_seller'
  | 'ready_to_dispatch_to_tailor'
  | 'dispatching_to_tailor'
  | 'delivered_to_tailor'
  | 'tailor_working'
  | 'ready_for_customer_delivery'
  | 'dispatching_to_customer'
  | 'delivered_to_customer'
  | 'cancelled_by_customer'
  | 'cancelled_by_seller'
  | 'cancelled_by_tailor'
  | 'cancelled_by_admin'
  | 'cancelled_post_dispute'
  | 'finding_replacement_tailor'
  | 'disputed';

export interface SellerOrder {
  _id: string;
  orderNumber: string;
  customerName: string;
  productTitle: string;
  productImage: string | null;
  quantity: number;
  fabricPrice: number;
  stitchingFee: number;
  totalAmount: number;
  status: SellerOrderApiStatus;
  placedAt: string;
  tailorName: string | null;
}

export interface SellerProduct {
  _id: string;
  title: string;
  category: string;
  pricePerSuit: number;
  stock: number;
  imageUrl: string | null;
  status: 'active' | 'inactive' | 'out_of_stock';
}

export interface SellerDashboard {
  approval: SellerApproval;
  shopId: string;
  stats: SellerStats;
  pendingOrders: SellerOrder[];
  lowStockProducts: SellerProduct[];
}

export interface SellerOrderQuery {
  /** Pass the real API status string, or omit for all */
  status?: SellerOrderApiStatus;
  page?: number;
  limit?: number;
}

export interface PaginatedSellerOrders {
  orders: SellerOrder[];
}

export interface PaginatedSellerProducts {
  products: SellerProduct[];
}

export interface SellerAnalytics {
  months: Array<{ label: string; amount: number }>;
  topProducts: Array<{ productId: string; title: string; totalSold: number; revenue: number }>;
}

// ─── Promo Types ─────────────────────────────────────────────────────────────

export interface PromoCode {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number; // percentage max 90, fixed in PKR
  minOrderValue: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CreatePromoPayload {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderValue?: number;
  maxUses?: number;
  expiresAt?: string;
}

// ─── Review Types ─────────────────────────────────────────────────────────────

export interface SellerReview {
  _id: string;
  reviewerId: { name: string; avatarUrl: string | null };
  targetType: 'product' | 'seller';
  ratings: { overall: number; quality: number; communication: number; timeliness: number };
  comment: string;
  isAnonymous: boolean;
  reply: { text: string; repliedAt: string } | null;
  canEditUntil: string;
  createdAt: string;
  productTitle: string | null;
}

export interface PaginatedSellerReviews {
  reviews: SellerReview[];
  total: number;
  page: number;
  pages: number;
}

// ─── Raw API shapes ───────────────────────────────────────────────────────────

interface RawOrderImage {
  url: string;
  publicId: string;
  _id: string;
}

interface RawOrderItem {
  _id: string;
  productId: { _id: string; title: string; images: RawOrderImage[] };
  designId: { _id: string; title: string };
  pricing: { fabricPrice: number; stitchingFee: number; platformFee: number };
}

interface RawTailorId {
  _id: string;
  userId: { _id: string; name: string };
}

interface RawPendingOrder {
  _id: string;
  orderId: string;
  customerId: { _id: string; name: string };
  tailorId: RawTailorId | null;
  items: RawOrderItem[];
  status: SellerOrderApiStatus;
  pricing: { deliveryFee: number; loyaltyDiscount: number; promoDiscount: number; total: number };
  estimatedDelivery: string | null;
  createdAt: string;
}

interface RawSellerProduct {
  _id: string;
  title: string;
  category: string;
  pricePerSuit: number;
  stock: number;
  images: Array<{ url: string; publicId: string; _id: string }>;
  status: 'active' | 'inactive' | 'out_of_stock';
}

function mapRawProduct(raw: RawSellerProduct): SellerProduct {
  return {
    _id: raw._id,
    title: raw.title,
    category: raw.category,
    pricePerSuit: raw.pricePerSuit,
    stock: raw.stock,
    imageUrl: raw.images[0]?.url ?? null,
    status: raw.status,
  };
}

interface RawSellerDashboard {
  approval: SellerApproval;
  shopId: string;
  stats: SellerStats;
  pendingOrders: RawPendingOrder[];
  lowStock: RawSellerProduct[];
}

function mapRawOrder(raw: RawPendingOrder): SellerOrder {
  const item = raw.items[0];
  return {
    _id: raw._id,
    orderNumber: raw.orderId,
    customerName: raw.customerId.name,
    productTitle: item?.productId.title ?? '',
    productImage: item?.productId.images[0]?.url ?? null,
    quantity: raw.items.length,
    fabricPrice: item?.pricing.fabricPrice ?? 0,
    stitchingFee: item?.pricing.stitchingFee ?? 0,
    totalAmount: raw.pricing.total,
    status: raw.status,
    placedAt: raw.createdAt,
    tailorName: raw.tailorId?.userId.name ?? null,
  };
}

// ─── API slice ────────────────────────────────────────────────────────────────

export const sellerApi = api.injectEndpoints({
  endpoints: (build) => ({
    getSellerDashboard: build.query<SellerDashboard, void>({
      query: () => '/dashboard/seller',
      transformResponse: (res: ApiResponse<RawSellerDashboard>): SellerDashboard => ({
        approval: res.data.approval,
        shopId: res.data.shopId,
        stats: res.data.stats,
        pendingOrders: res.data.pendingOrders.map(mapRawOrder),
        lowStockProducts: res.data.lowStock.map(mapRawProduct),
      }),
      providesTags: ['SellerOrder', 'SellerProduct'],
    }),

    getSellerOrders: build.query<PaginatedSellerOrders, SellerOrderQuery>({
      query: ({ status, page = 1, limit = 20 }) => ({
        url: '/orders',
        params: {
          ...(status !== undefined ? { status } : {}),
          page,
          limit,
        },
      }),
      transformResponse: (res: ApiResponse<{ orders: RawPendingOrder[] }>): PaginatedSellerOrders => ({
        orders: res.data.orders.map(mapRawOrder),
      }),
      providesTags: ['SellerOrder'],
    }),

    /**
     * Accept a placed order → advances to accepted_by_seller.
     * Uses the milestone endpoint as per orders.md.
     */
    acceptOrder: build.mutation<SellerOrder, string>({
      query: (id) => ({
        url: `/orders/${id}/milestone`,
        method: 'PATCH',
        body: { stage: 'accepted_by_seller' },
      }),
      transformResponse: (res: ApiResponse<SellerOrder>) => res.data,
      invalidatesTags: ['SellerOrder'],
    }),

    /**
     * Reject/cancel a placed order from the seller side.
     * Uses the cancel endpoint with a reason as per orders.md.
     */
    rejectOrder: build.mutation<SellerOrder, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/orders/${id}/cancel`,
        method: 'PATCH',
        body: { reason },
      }),
      transformResponse: (res: ApiResponse<SellerOrder>) => res.data,
      invalidatesTags: ['SellerOrder'],
    }),

    /**
     * Mark an accepted order as ready to dispatch → advances to ready_to_dispatch_to_tailor.
     */
    markReadyToDispatch: build.mutation<SellerOrder, string>({
      query: (id) => ({
        url: `/orders/${id}/milestone`,
        method: 'PATCH',
        body: { stage: 'ready_to_dispatch_to_tailor' },
      }),
      transformResponse: (res: ApiResponse<SellerOrder>) => res.data,
      invalidatesTags: ['SellerOrder'],
    }),

    /**
     * @deprecated Use markReadyToDispatch instead.
     * Kept for backwards-compat with existing screens during migration.
     */
    markDispatched: build.mutation<SellerOrder, string>({
      query: (id) => ({
        url: `/orders/${id}/milestone`,
        method: 'PATCH',
        body: { stage: 'ready_to_dispatch_to_tailor' },
      }),
      transformResponse: (res: ApiResponse<SellerOrder>) => res.data,
      invalidatesTags: ['SellerOrder'],
    }),

    getSellerProducts: build.query<PaginatedSellerProducts, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 20 }) => ({
        url: '/shops/my/products',
        params: { page, limit },
      }),
      transformResponse: (res: ApiResponse<{ products: RawSellerProduct[] }>): PaginatedSellerProducts => ({
        products: res.data.products.map(mapRawProduct),
      }),
      providesTags: ['SellerProduct'],
    }),

    toggleProductStatus: build.mutation<SellerProduct, { id: string; status: 'active' | 'inactive' }>({
      query: ({ id, status }) => ({
        url: `/shops/my/products/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: (res: ApiResponse<SellerProduct>) => res.data,
      invalidatesTags: ['SellerProduct'],
    }),

    getSellerAnalytics: build.query<SellerAnalytics, void>({
      query: () => '/dashboard/seller/analytics',
      transformResponse: (res: ApiResponse<SellerAnalytics>) => res.data,
    }),

    // ─── Promos ──────────────────────────────────────────────────────────────

    getMyPromos: build.query<PromoCode[], void>({
      query: () => '/shops/my/promotions',
      transformResponse: (res: ApiResponse<{ promos: PromoCode[]; total: number }>) => res.data.promos,
      providesTags: ['SellerPromo'],
    }),

    createPromo: build.mutation<PromoCode, CreatePromoPayload>({
      query: (body) => ({
        url: '/shops/my/promotions',
        method: 'POST',
        body,
      }),
      transformResponse: (res: ApiResponse<PromoCode>) => res.data,
      invalidatesTags: ['SellerPromo'],
    }),

    togglePromo: build.mutation<PromoCode, string>({
      query: (id) => ({
        url: `/shops/my/promotions/${id}/toggle`,
        method: 'PATCH',
      }),
      transformResponse: (res: ApiResponse<PromoCode>) => res.data,
      invalidatesTags: ['SellerPromo'],
    }),

    deletePromo: build.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/shops/my/promotions/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (res: ApiResponse<{ success: boolean }>) => res.data,
      invalidatesTags: ['SellerPromo'],
    }),

    // ─── Reviews ─────────────────────────────────────────────────────────────

    getSellerReviews: build.query<PaginatedSellerReviews, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 20 }) => ({
        url: '/reviews',
        params: { targetType: 'seller', page, limit },
      }),
      transformResponse: (res: ApiResponse<PaginatedSellerReviews>) => res.data,
      providesTags: ['SellerReview'],
    }),

    replyToReview: build.mutation<SellerReview, { id: string; text: string }>({
      query: ({ id, text }) => ({
        url: `/reviews/${id}/reply`,
        method: 'POST',
        body: { text },
      }),
      transformResponse: (res: ApiResponse<SellerReview>) => res.data,
      invalidatesTags: (_result, _error, { id }) => [{ type: 'SellerReview', id }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSellerDashboardQuery,
  useGetSellerOrdersQuery,
  useAcceptOrderMutation,
  useRejectOrderMutation,
  useMarkReadyToDispatchMutation,
  useMarkDispatchedMutation,
  useGetSellerProductsQuery,
  useToggleProductStatusMutation,
  useGetSellerAnalyticsQuery,
  useGetMyPromosQuery,
  useCreatePromoMutation,
  useTogglePromoMutation,
  useDeletePromoMutation,
  useGetSellerReviewsQuery,
  useReplyToReviewMutation,
} = sellerApi;
