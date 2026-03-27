export type FabricCategory =
  | 'lawn' | 'silk' | 'cotton' | 'chiffon' | 'bridal'
  | 'linen' | 'velvet' | 'organza' | 'karandi' | 'khaddar';

export type Occasion = 'casual' | 'formal' | 'bridal' | 'eid' | 'party' | 'office';

export type CareInstruction = 'hand_wash' | 'machine_wash' | 'dry_clean' | 'dry_only';

export type TargetGender = 'male' | 'female' | 'kids' | 'unisex';

export type SortOption = 'rating' | 'price_asc' | 'price_desc' | 'newest';

export type StoreSort = 'rating' | 'popular' | 'newest';

export const FABRIC_CATEGORIES: FabricCategory[] = [
  'lawn', 'silk', 'cotton', 'chiffon', 'bridal',
  'linen', 'velvet', 'organza', 'karandi', 'khaddar',
];

export const OCCASIONS: Occasion[] = [
  'casual', 'formal', 'bridal', 'eid', 'party', 'office',
];

export const CARE_LABELS: Record<CareInstruction, string> = {
  hand_wash: 'Hand wash',
  machine_wash: 'Machine wash',
  dry_clean: 'Dry clean only',
  dry_only: 'Dry only',
};

export const COLOUR_OPTIONS = [
  { label: 'White',  value: 'white',  hex: '#FFFFFF' },
  { label: 'Black',  value: 'black',  hex: '#1A1A1A' },
  { label: 'Red',    value: 'red',    hex: '#DC2626' },
  { label: 'Blue',   value: 'blue',   hex: '#2563EB' },
  { label: 'Green',  value: 'green',  hex: '#16A34A' },
  { label: 'Pink',   value: 'pink',   hex: '#EC4899' },
  { label: 'Yellow', value: 'yellow', hex: '#EAB308' },
  { label: 'Multi',  value: 'multi',  hex: 'multi' },
] as const;

// ─── Product ──────────────────────────────────────────────────────────────────

export interface ProductImage {
  url: string;
  publicId: string;
}

export interface ShopRef {
  _id?: string;
  name: string;
  slug: string;
  logo?: { url: string };
  address?: { city: string };
  rating: number;
  isVerified?: boolean;
}

export interface ShopProduct {
  _id: string;
  slug: string;
  title: string;
  category: FabricCategory;
  pricePerSuit?: number;
  pricePerMetre?: number;
  price?: number;
  images?: ProductImage[];
  imageUrl?: string;
  rating: number;
  reviewCount: number;
  isFeatured?: boolean;
  stock?: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  occasion?: Occasion[];
  targetGender?: TargetGender;
  shopId?: string | ShopRef;
  flashSaleEndsAt?: string;
  flashSalePrice?: number;
  colour?: string;
  fabricWeight?: number;
  careInstructions?: CareInstruction;
  origin?: string;
  composition?: string;
}

// ─── Shop / Store ─────────────────────────────────────────────────────────────

export interface Shop {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  category: string;
  logo?: { url: string; publicId: string };
  banner?: { url: string; publicId: string };
  rating: number;
  reviewCount: number;
  address?: { line1?: string; city?: string; area?: string; fullAddress?: string; phone?: string };
  isVerified: boolean;
  productCount: number;
  totalSales: number;
  policies?: {
    returns?: string;
    noReturnPolicy?: boolean;
    returnWindowDays?: number;
  };
}

// ─── Query params ─────────────────────────────────────────────────────────────

export interface ProductQuery {
  category?: FabricCategory;
  occasion?: Occasion;
  targetGender?: TargetGender;
  colour?: string;
  careInstructions?: CareInstruction;
  price_min?: number;
  price_max?: number;
  search?: string;
  sort?: SortOption;
  page?: number;
  limit?: number;
}

export interface StoreQuery {
  page?: number;
  limit?: number;
  city?: string;
  category?: string;
  sort?: StoreSort;
  search?: string;
}

// ─── API responses ────────────────────────────────────────────────────────────

export interface PaginatedProducts {
  products: ShopProduct[];
  total: number;
  page?: number;
  pages: number;
}

export interface PaginatedShops {
  shops: Shop[];
  total: number;
  pages: number;
  page: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}
