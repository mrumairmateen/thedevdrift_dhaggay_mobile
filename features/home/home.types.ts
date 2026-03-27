export interface DesignItem {
  _id: string;
  title: string;
  occasion: string;
  imageColor: string;
  isTrending: boolean;
}

export interface TailorCardData {
  _id: string;
  name: string;
  city: string;
  tier: 'Master' | 'Premium' | 'Standard';
  rating: number;
  reviewCount: number;
  completedOrders: number;
  startingPrice: number;
  isAvailable: boolean;
  initials: string;
  avatarColor: string;
}

export interface HomeCategoryItem {
  slug: string;
  label: string;
  color: string;
  bgColor: string;
  iconName: string;
}
