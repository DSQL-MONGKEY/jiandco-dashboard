export type { Permission, Role } from '@/types/api';

export type RolePermissionData = {
  role: import('@/types/api').Role;
  permissions: import('@/types/api').Permission[];
};
