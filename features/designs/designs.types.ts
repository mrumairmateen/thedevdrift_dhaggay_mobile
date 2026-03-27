export interface Design {
  _id: string;
  slug: string;
  title: string;
  garmentCategoryId: string;
  garmentCategorySlug: string;
  occasion: string[];
  gender: string;
  images: { url: string; publicId: string }[];
  isTrending: boolean;
  tags?: string[];
  requiredMeasurements?: string[];
  measurementGuide?: string;
}

export type DesignSort = 'trending' | 'newest' | 'most_used';

export interface DesignQuery {
  search?: string;
  occasion?: string;
  gender?: string;
  sort?: DesignSort;
  page?: number;
  limit?: number;
}

export interface PaginatedDesigns {
  designs: Design[];
  total: number;
  page: number;
  pages: number;
}
