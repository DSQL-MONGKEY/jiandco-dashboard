export type {
  Category,
  Color,
  Product,
  ProductImage,
  ProductVariant,
  Size,
  StockMovement
} from '@/types/api';

export type ProductFilters = {
  page?: number;
  per_page?: number;
  search?: string;
  category_id?: string;
  status?: string;
};

export type VariantPayload = {
  size_id: string;
  color_id: string;
  sku: string;
  price: number;
  stock: number;
  is_active?: boolean;
};

export type VariantUpdatePayload = Omit<VariantPayload, 'stock'>;

export type ProductPayload = {
  category_id?: string | null;
  name: string;
  slug?: string;
  description?: string;
  status: 'draft' | 'active' | 'archived';
  shopee_url?: string;
  shopee_price?: number;
  details?: string[];
  badge?: string;
  badge_tone?: 'light' | 'accent';
  sort_order?: number;
  variants?: VariantPayload[];
};

export type CategoryPayload = {
  name: string;
  slug?: string;
  description?: string;
};

export type SizePayload = {
  name: string;
  sort_order?: number;
};

export type ColorPayload = {
  name: string;
  hex_code?: string;
};

export type StockUpdatePayload = {
  stock: number;
  note?: string;
};
