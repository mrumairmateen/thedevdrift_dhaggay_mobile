// ─── Order Status Pipeline (16-status) ───────────────────────────────────────

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

export interface OrderStep {
  status: OrderStatus;
  changedAt: string;
  changedBy?: string;
  note?: string;
}

/** Ordered forward pipeline steps (excludes terminal/special statuses) */
export const ORDER_STEPS: OrderStatus[] = [
  'placed',
  'accepted_by_seller',
  'ready_to_dispatch_to_tailor',
  'dispatching_to_tailor',
  'delivered_to_tailor',
  'tailor_working',
  'ready_for_customer_delivery',
  'dispatching_to_customer',
  'delivered_to_customer',
];

export const ORDER_STEP_LABELS: Record<OrderStatus, string> = {
  placed: 'Order Placed',
  accepted_by_seller: 'Accepted by Seller',
  ready_to_dispatch_to_tailor: 'Ready to Dispatch',
  dispatching_to_tailor: 'Dispatching to Tailor',
  delivered_to_tailor: 'Delivered to Tailor',
  tailor_working: 'Tailor Working',
  ready_for_customer_delivery: 'Ready for Delivery',
  dispatching_to_customer: 'Out for Delivery',
  delivered_to_customer: 'Delivered',
  finding_replacement_tailor: 'Finding Tailor',
  disputed: 'Disputed',
  cancelled_by_customer: 'Cancelled',
  cancelled_by_seller: 'Cancelled by Seller',
  cancelled_by_tailor: 'Cancelled by Tailor',
  cancelled_by_admin: 'Cancelled by Admin',
  cancelled_post_dispute: 'Cancelled (Dispute)',
};

/** Terminal statuses where the order lifecycle has ended */
export const TERMINAL_STATUSES: ReadonlySet<OrderStatus> = new Set<OrderStatus>([
  'delivered_to_customer',
  'cancelled_by_customer',
  'cancelled_by_seller',
  'cancelled_by_tailor',
  'cancelled_by_admin',
  'cancelled_post_dispute',
]);

/** Returns true if a status is a cancellation */
export function isCancelledStatus(status: OrderStatus): boolean {
  return (
    status === 'cancelled_by_customer' ||
    status === 'cancelled_by_seller' ||
    status === 'cancelled_by_tailor' ||
    status === 'cancelled_by_admin' ||
    status === 'cancelled_post_dispute'
  );
}

// Status → design-system token keys (resolved via colors[key] at render time)
export const STATUS_COLOR_TOKENS: Record<
  OrderStatus,
  { bg: string; text: string }
> = {
  placed: { bg: 'warningSubtle', text: 'warning' },
  accepted_by_seller: { bg: 'infoSubtle', text: 'info' },
  ready_to_dispatch_to_tailor: { bg: 'infoSubtle', text: 'info' },
  dispatching_to_tailor: { bg: 'accentSubtle', text: 'accent' },
  delivered_to_tailor: { bg: 'accentSubtle', text: 'accent' },
  tailor_working: { bg: 'accentSubtle', text: 'accent' },
  ready_for_customer_delivery: { bg: 'accentSubtle', text: 'accent' },
  dispatching_to_customer: { bg: 'accentSubtle', text: 'accent' },
  delivered_to_customer: { bg: 'successSubtle', text: 'success' },
  finding_replacement_tailor: { bg: 'warningSubtle', text: 'warning' },
  disputed: { bg: 'errorSubtle', text: 'error' },
  cancelled_by_customer: { bg: 'errorSubtle', text: 'error' },
  cancelled_by_seller: { bg: 'errorSubtle', text: 'error' },
  cancelled_by_tailor: { bg: 'errorSubtle', text: 'error' },
  cancelled_by_admin: { bg: 'errorSubtle', text: 'error' },
  cancelled_post_dispute: { bg: 'errorSubtle', text: 'error' },
};

// ─── Dashboard Home ───────────────────────────────────────────────────────────

export interface DashboardStats {
  totalOrders: number;
  activeOrders: number;
  loyaltyPoints: number;
  referralCount: number;
}

export interface ActiveOrder {
  _id: string;
  orderNumber: string;
  productTitle: string;
  productImage: string | null;
  status: OrderStatus;
  statusHistory: OrderStep[];
  estimatedDelivery: string | null;
  totalAmount: number;
}

export interface DashboardUser {
  name: string;
  phone: string;
  avatarUrl: string | null;
}

export interface CustomerDashboard {
  stats: DashboardStats;
  activeOrders: ActiveOrder[];
  user: DashboardUser;
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export interface OrderProduct {
  _id: string;
  title: string;
  imageUrl: string | null;
  category: string;
}

export interface OrderTailor {
  _id: string;
  name: string;
  avatarUrl: string | null;
  rating: number;
}

export interface Address {
  _id: string;
  label: string;
  line1: string;
  city: string;
  area?: string;
  phone?: string;
  isDefault: boolean;
}

export interface Order {
  _id: string;
  orderNumber: string;
  product: OrderProduct;
  tailor: OrderTailor | null;
  status: OrderStatus;
  statusHistory: OrderStep[];
  totalAmount: number;
  currency: 'PKR';
  placedAt: string;
  estimatedDelivery: string | null;
  deliveryAddress: Omit<Address, '_id' | 'isDefault'>;
  measurements: Record<string, number> | null;
  notes: string | null;
}

export interface PaginatedOrders {
  orders: Order[];
  total: number;
  page: number;
  pages: number;
}

export interface OrderQuery {
  page?: number;
  limit?: number;
  status?: OrderStatus | 'all';
}

// ─── Loyalty ──────────────────────────────────────────────────────────────────

export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface LoyaltyBalance {
  points: number;
  tier: LoyaltyTier;
  nextTierPoints: number;
  nextTier: string;
  progressPercent: number; // 0–100
}

export interface EarnRule {
  action: string;
  points: number;
  description: string;
}

export type TransactionType = 'earn' | 'redeem' | 'expire' | 'reversed';

export interface LoyaltyTransaction {
  _id: string;
  type: TransactionType;
  points: number;
  description: string;
  createdAt: string;
}

export interface LoyaltyData {
  balance: LoyaltyBalance;
  transactions: LoyaltyTransaction[];
  earnRules: EarnRule[];
}

export interface ReferralData {
  code: string;
  link: string;
  totalReferrals: number;
  pendingReferrals: number;
  earnedPoints: number;
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────

export interface WishlistProduct {
  _id: string;
  slug: string;
  title: string;
  category: string;
  pricePerSuit?: number;
  pricePerMetre?: number;
  imageUrl: string | null;
  status: 'active' | 'out_of_stock';
  priceAlertEnabled: boolean;
}

export interface WishlistDesign {
  _id: string;
  slug: string;
  title: string;
  imageUrl: string | null;
  occasion: string[];
  gender: string;
}

export interface WishlistData {
  products: WishlistProduct[];
  designs: WishlistDesign[];
}

// ─── User / Settings ─────────────────────────────────────────────────────────

export interface NotificationPrefs {
  whatsapp: boolean;
  email: boolean;
  push: boolean;
}

export interface UserProfile {
  _id: string;
  name: string;
  phone: string;
  email: string | null;
  avatarUrl: string | null;
  notifications: NotificationPrefs;
  addresses: Address[];
}

export interface UpdateProfileInput {
  name?: string;
  email?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export type AddressInput = Omit<Address, '_id' | 'isDefault'>;
