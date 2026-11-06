import { apiClient } from '@/lib/api-client';
import { toQueryString } from '@/lib/query-string';
import type { Customer, Paginated } from '@/types/api';
import type { CustomerFilters, CustomerPayload } from './types';

export function getCustomers(filters: CustomerFilters) {
  return apiClient<Paginated<Customer>>(`/customers${toQueryString(filters)}`);
}

export function getCustomer(id: string) {
  return apiClient<Customer>(`/customers/${id}`);
}

export function createCustomer(payload: CustomerPayload) {
  return apiClient<Customer>('/customers', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function updateCustomer(id: string, payload: CustomerPayload) {
  return apiClient<Customer>(`/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export function deleteCustomer(id: string) {
  return apiClient<{ message: string }>(`/customers/${id}`, { method: 'DELETE' });
}
