// Mirrors the frontend DesignItem interface exactly.
// imageColor is mobile-only: a color placeholder until real images are served.

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
  imageColor: string;
}
