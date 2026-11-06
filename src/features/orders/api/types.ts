export type { Customer, Order, OrderItem } from '@/types/api';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'completed'
  | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';
export type ShippingStatus = 'pending' | 'picked_up' | 'in_transit' | 'delivered' | 'returned';

export type OrderFilters = {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  payment_status?: string;
  shipping_status?: string;
  customer_id?: string;
  from?: string;
  to?: string;
};

export type OrderItemInput = {
  variant_id: string;
  quantity: number;
};

export type CreateOrderPayload = {
  customer_id: string;
  items: OrderItemInput[];
  recipient_name?: string;
  recipient_phone?: string;
  shipping_address?: string;
  shipping_city?: string;
  shipping_province?: string;
  shipping_postal_code?: string;
  payment_method?: string;
  courier?: string;
  discount_amount?: number;
  shipping_cost?: number;
  notes?: string;
};

export type UpdateOrderPayload = {
  customer_id: string;
  recipient_name: string;
  recipient_phone: string;
  shipping_address: string;
  shipping_city?: string;
  shipping_province?: string;
  shipping_postal_code?: string;
  payment_method?: string;
  courier?: string;
  discount_amount?: number;
  shipping_cost?: number;
  notes?: string;
};

export type UpdateOrderItemsPayload = {
  items: OrderItemInput[];
};
