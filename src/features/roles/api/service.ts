import { apiClient } from '@/lib/api-client';
import type { Permission, Role } from '@/types/api';
import type { RolePermissionData } from './types';

export function getRoles() {
  return apiClient<Role[]>('/roles');
}

export function getPermissions() {
  return apiClient<Permission[]>('/permissions');
}

export function getRolePermissions(roleId: string) {
  return apiClient<RolePermissionData>(`/roles/${roleId}/permissions`);
}

export function updateRolePermissions(roleId: string, permissionIds: string[]) {
  return apiClient<RolePermissionData>(`/roles/${roleId}/permissions`, {
    method: 'PUT',
    body: JSON.stringify({ permission_ids: permissionIds })
  });
}
