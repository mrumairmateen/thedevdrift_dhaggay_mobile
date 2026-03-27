// Mirrors the frontend TailorCard interface exactly.
// initials and avatarColor are mobile-only helpers derived from userId.name / _id.

export interface TailorPortfolioItem {
  imageUrl: string;
  caption?: string;
  imageColor: string;
}

export interface Tailor {
  _id: string;
  slug: string;
  userId: { name: string } | string | null;
  tier: 'standard' | 'premium' | 'master';
  serviceAreas: Array<{ city: string; area?: string }>;
  pricing?: { shalwarKameez?: number; suit?: number; bridal?: number };
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
  // Mobile-only helpers
  initials: string;
  avatarColor: string;
}
