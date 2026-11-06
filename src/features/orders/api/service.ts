import { apiClient } from '@/lib/api-client';
import { toQueryString } from '@/lib/query-string';
import type { Order, Paginated } from '@/types/api';
import type {
  CreateOrderPayload,
  OrderFilters,
  UpdateOrderItemsPayload,
  UpdateOrderPayload
} from './types';

export function getOrders(filters: OrderFilters) {
  return apiClient<Paginated<Order>>(`/orders${toQueryString(filters)}`);
}

export function getOrder(id: string) {
  return apiClient<Order>(`/orders/${id}`);
}

export function createOrder(payload: CreateOrderPayload) {
  return apiClient<Order>('/orders', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function updateOrder(id: string, payload: UpdateOrderPayload) {
  return apiClient<Order>(`/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export function deleteOrder(id: string) {
  return apiClient<{ message: string }>(`/orders/${id}`, { method: 'DELETE' });
}

export function updateOrderItems(id: string, payload: UpdateOrderItemsPayload) {
  return apiClient<Order>(`/orders/${id}/items`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export function updateOrderStatus(id: string, status: string) {
  return apiClient<Order>(`/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
}

export function updateOrderPayment(id: string, paymentStatus: string, paymentMethod?: string) {
  return apiClient<Order>(`/orders/${id}/payment`, {
    method: 'PATCH',
    body: JSON.stringify({
      payment_status: paymentStatus,
      payment_method: paymentMethod
    })
  });
}

export function updateOrderShipping(
  id: string,
  shippingStatus: string,
  courier?: string,
  trackingNumber?: string
) {
  return apiClient<Order>(`/orders/${id}/shipping`, {
    method: 'PATCH',
    body: JSON.stringify({
      shipping_status: shippingStatus,
      courier,
      tracking_number: trackingNumber
    })
  });
}
