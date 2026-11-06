import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { getPermissions, getRolePermissions, getRoles, updateRolePermissions } from './service';

export const roleQueries = {
  all: () => ['roles'] as const,
  list: () =>
    queryOptions({
      queryKey: [...roleQueries.all(), 'list'] as const,
      queryFn: getRoles
    }),
  permissions: (roleId: string) =>
    queryOptions({
      queryKey: [...roleQueries.all(), 'permissions', roleId] as const,
      queryFn: () => getRolePermissions(roleId)
    }),
  catalog: () =>
    queryOptions({
      queryKey: [...roleQueries.all(), 'catalog'] as const,
      queryFn: getPermissions
    })
};

export const roleMutations = {
  updatePermissions: () =>
    mutationOptions({
      mutationFn: ({ roleId, permissionIds }: { roleId: string; permissionIds: string[] }) =>
        updateRolePermissions(roleId, permissionIds)
    })
};
