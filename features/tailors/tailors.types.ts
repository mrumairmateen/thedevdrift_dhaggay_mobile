export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface TailorPortfolioItem {
  imageUrl: string;
  caption?: string;
}

export interface Tailor {
  _id: string;
  slug?: string;
  userId: { _id: string; name: string } | string | null;
  tier: 'standard' | 'premium' | 'master';
  serviceAreas: Array<{ city: string; area?: string }>;
  categoryPricing?: Array<{
    garmentCategoryId: string;
    garmentCategorySlug: string;
    price: number;
  }>;
  specialisations: string[];
  rating: number;
  reviewCount: number;
  completedOrders: number;
  isAvailable: boolean;
  portfolio?: TailorPortfolioItem[];
}

export type TailorSort = 'rating' | 'orders' | 'price_asc';

export interface TailorQuery {
  search?: string;
  city?: string;
  tier?: 'standard' | 'premium' | 'master';
  specialisation?: string;
  available?: boolean;
  sort?: TailorSort;
  page?: number;
  limit?: number;
}

export interface PaginatedTailors {
  tailors: Tailor[];
  total: number;
  page: number;
  pages: number;
}
