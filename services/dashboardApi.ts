import { api } from './api';
import type { ApiResponse } from '@features/shop/shop.types';
import type {
  ActiveOrder,
  CustomerDashboard,
  DashboardStats,
  OrderStatus,
} from '@features/dashboard/dashboard.types';

// ─── Raw API shapes (as returned by /dashboard/customer) ──────────────────────

interface RawActiveOrderImage {
  url: string;
  publicId: string;
  _id: string;
}

interface RawActiveOrderProduct {
  _id: string;
  title: string;
  images: RawActiveOrderImage[];
}

interface RawActiveOrderItem {
  _id: string;
  productId: RawActiveOrderProduct;
  pricing: { fabricPrice: number; stitchingFee: number; platformFee: number };
}

interface RawActiveOrder {
  _id: string;
  orderId: string;
  items: RawActiveOrderItem[];
  status: OrderStatus;
  pricing: { deliveryFee: number; loyaltyDiscount: number; promoDiscount: number; total: number };
  estimatedDelivery?: string | null;
  createdAt: string;
}

interface RawCustomerDashboard {
  stats: CustomerDashboard['stats'];
  activeOrders: RawActiveOrder[];
  user: CustomerDashboard['user'];
}

function mapActiveOrder(raw: RawActiveOrder): ActiveOrder {
  const firstItem = raw.items[0];
  const firstImage = firstItem?.productId.images[0];
  return {
    _id: raw._id,
    orderId: raw.orderId,
    productTitle: firstItem?.productId.title ?? '',
    productImage: firstImage?.url ?? null,
    status: raw.status,
    statusHistory: [],
    estimatedDelivery: raw.estimatedDelivery ?? null,
    totalAmount: raw.pricing.total,
  };
}

export const dashboardApi = api.injectEndpoints({
  endpoints: (build) => ({
    getCustomerDashboard: build.query<CustomerDashboard, void>({
      query: () => '/dashboard/customer',
      transformResponse: (res: ApiResponse<RawCustomerDashboard>): CustomerDashboard => ({
        stats: res.data.stats,
        activeOrders: res.data.activeOrders.map(mapActiveOrder),
        user: res.data.user,
      }),
      providesTags: ['User'],
    }),

    getOrderStats: build.query<DashboardStats, void>({
      query: () => '/dashboard/stats',
      transformResponse: (res: ApiResponse<DashboardStats>) => res.data,
      providesTags: ['User'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetCustomerDashboardQuery, useGetOrderStatsQuery } = dashboardApi;
