export type ID = string;

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiFailure = {
  success: false;
  code: number;
  message: string;
};

export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

export type Pagination = {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
};

export type Paginated<T> = {
  items: T[];
  pagination: Pagination;
};

export type Role = {
  id: ID;
  name: string;
  level: number;
  description?: string;
  is_system?: boolean;
};

export type Permission = {
  id: ID;
  key: string;
  page: string;
  action: string;
  label: string;
};

export type AuthUser = {
  id: ID;
  role_id: ID;
  role: Role;
  name: string;
  username: string;
  email: string;
  phone: string;
  avatar_key: string;
  avatar_url: string;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
};

export type MeData = {
  user: AuthUser;
  permissions: string[];
};

export type Category = {
  id: ID;
  name: string;
  slug: string;
  description: string;
  created_at: string;
  updated_at: string;
};

export type Size = {
  id: ID;
  name: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Color = {
  id: ID;
  name: string;
  hex_code: string;
  created_at: string;
  updated_at: string;
};

export type ProductColor = {
  id: ID;
  product_id: ID;
  name: string;
  hex_code: string;
  image_key: string;
  image_url: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ProductImage = {
  id: ID;
  object_key: string;
  url: string;
  alt_text: string;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
};

export type ProductVariant = {
  id: ID;
  product_id: ID;
  size: Size;
  color: ProductColor;
  sku: string;
  price: number;
  stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: ID;
  category_id: ID | null;
  category: Category | null;
  name: string;
  slug: string;
  description: string;
  status: 'draft' | 'active' | 'archived';
  shopee_url: string;
  shopee_price: number;
  details: string[];
  badge: string;
  badge_tone: 'light' | 'accent';
  sort_order: number;
  created_by_id: ID | null;
  images: ProductImage[];
  colors: ProductColor[];
  variants: ProductVariant[];
  created_at: string;
  updated_at: string;
};

export type StockMovement = {
  id: ID;
  variant_id: ID | null;
  product_id: ID | null;
  sku: string;
  variant_label: string;
  type: 'initial' | 'adjustment' | 'order' | 'cancel' | 'return';
  quantity: number;
  stock_before: number;
  stock_after: number;
  reference_type: string;
  reference_id: ID | null;
  note: string;
  created_by_id: ID | null;
  created_by_name: string;
  created_at: string;
};

export type Customer = {
  id: ID;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: ID;
  product_id: ID | null;
  variant_id: ID | null;
  product_name: string;
  variant_label: string;
  sku: string;
  price: number;
  quantity: number;
  subtotal: number;
};

export type Order = {
  id: ID;
  order_number: string;
  customer_id: ID;
  customer: Customer | null;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  payment_status: 'unpaid' | 'paid' | 'refunded';
  payment_method: string;
  paid_at: string | null;
  shipping_status: 'pending' | 'picked_up' | 'in_transit' | 'delivered' | 'returned';
  courier: string;
  tracking_number: string;
  shipped_at: string | null;
  delivered_at: string | null;
  recipient_name: string;
  recipient_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_province: string;
  shipping_postal_code: string;
  subtotal: number;
  discount_amount: number;
  shipping_cost: number;
  total_amount: number;
  notes: string;
  stock_deducted: boolean;
  created_by_id: ID | null;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
};

export type ExpenseItem = {
  id: ID;
  name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  subtotal: number;
};

export type Expense = {
  id: ID;
  title: string;
  category: 'operational' | 'production' | 'marketing' | 'restock' | 'other';
  vendor: string;
  expense_date: string;
  payment_method: string;
  total_amount: number;
  receipt_key: string;
  receipt_url: string;
  notes: string;
  created_by_id: ID | null;
  items: ExpenseItem[];
  created_at: string;
  updated_at: string;
};

export type CatalogSettings = {
  promo_badge: string;
  promo_title: string;
  promo_description: string;
  promo_note: string;
  promo_cta_label: string;
  page_eyebrow: string;
  page_title: string;
  page_title_accent: string;
  page_description: string;
  page_footnote: string;
  cta_eyebrow: string;
  cta_title: string;
  cta_title_accent: string;
  cta_description: string;
  cta_label: string;
  cta_image_url: string;
  cta_secondary_image_url: string;
  shopee_store_url: string;
};

export type AccountingOverview = {
  month: string;
  total_expenses: number;
  by_category: { category: string; total: number }[];
  recent_expenses: Expense[];
};

export type RevenueOverview = {
  month: string;
  revenue: number;
  expenses: number;
  net_profit: number;
  total_orders: number;
  paid_orders: number;
  average_order_value: number;
  order_status_breakdown: { status: string; count: number }[];
  daily: { date: string; revenue: number; orders: number }[];
};
