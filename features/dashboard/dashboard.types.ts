// ─── Order Status Pipeline ────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'fabric_sourced'
  | 'in_production'
  | 'quality_check'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface OrderStep {
  key: OrderStatus;
  label: string;
  completedAt: string | null;
}

export const ORDER_STEPS: OrderStatus[] = [
  'pending',
  'confirmed',
  'fabric_sourced',
  'in_production',
  'quality_check',
  'out_for_delivery',
  'delivered',
];

export const ORDER_STEP_LABELS: Record<OrderStatus, string> = {
  pending: 'Placed',
  confirmed: 'Confirmed',
  fabric_sourced: 'Fabric Ready',
  in_production: 'Tailoring',
  quality_check: 'QC',
  out_for_delivery: 'On the Way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

// Status → design-system token keys (resolved via colors[key] at render time)
export const STATUS_COLOR_TOKENS: Record<
  OrderStatus,
  { bg: string; text: string }
> = {
  pending: { bg: 'warningSubtle', text: 'warning' },
  confirmed: { bg: 'infoSubtle', text: 'info' },
  fabric_sourced: { bg: 'infoSubtle', text: 'info' },
  in_production: { bg: 'accentSubtle', text: 'accent' },
  quality_check: { bg: 'accentSubtle', text: 'accent' },
  out_for_delivery: { bg: 'accentSubtle', text: 'accent' },
  delivered: { bg: 'successSubtle', text: 'success' },
  cancelled: { bg: 'errorSubtle', text: 'error' },
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
  currentStep: number; // 0–6
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
  currentStep: number;
  steps: OrderStep[];
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
  orderUpdates: boolean;
  promotions: boolean;
  wishlistAlerts: boolean;
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
