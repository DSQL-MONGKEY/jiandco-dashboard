import { apiClient } from '@/lib/api-client';
import { toQueryString } from '@/lib/query-string';
import type { AuthUser, Paginated } from '@/types/api';
import type {
  CreateUserPayload,
  ResetPasswordPayload,
  UpdateUserPayload,
  UserFilters
} from './types';

export function getUsers(filters: UserFilters) {
  return apiClient<Paginated<AuthUser>>(`/users${toQueryString(filters)}`);
}

export function getUser(id: string) {
  return apiClient<AuthUser>(`/users/${id}`);
}

export function createUser(payload: CreateUserPayload) {
  return apiClient<AuthUser>('/users', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function updateUser(id: string, payload: UpdateUserPayload) {
  return apiClient<AuthUser>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export function deleteUser(id: string) {
  return apiClient<{ message: string }>(`/users/${id}`, { method: 'DELETE' });
}

export function resetUserPassword(id: string, payload: ResetPasswordPayload) {
  return apiClient<{ message: string }>(`/users/${id}/password`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}
