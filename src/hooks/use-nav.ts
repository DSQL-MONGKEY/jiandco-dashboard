'use client';

import { useMemo } from 'react';
import { useAuth } from '@/features/auth/context/auth-provider';
import type { NavGroup, NavItem } from '@/types';

function permissionAllowed(
  permission: string | undefined,
  can: (page: string, action: string) => boolean
) {
  if (!permission) return true;
  const separator = permission.lastIndexOf('.');
  if (separator === -1) return true;
  return can(permission.slice(0, separator), permission.slice(separator + 1));
}

function filterItems(items: NavItem[], can: (page: string, action: string) => boolean): NavItem[] {
  return items
    .map((item) => {
      const children = item.items ? filterItems(item.items, can) : undefined;
      const allowed = permissionAllowed(item.access?.permission, can);

      if (item.items?.length && (!allowed || (children?.length ?? 0) === 0)) {
        return null;
      }
      if (!allowed) {
        return null;
      }

      return {
        ...item,
        ...(children ? { items: children } : {})
      };
    })
    .filter((item): item is NavItem => item !== null);
}

export function useFilteredNavItems(items: NavItem[]) {
  const { can, isLoading } = useAuth();
  return useMemo(() => {
    if (isLoading) return [];
    return filterItems(items, can);
  }, [items, can, isLoading]);
}

export function useFilteredNavGroups(groups: NavGroup[]) {
  const { can, isLoading } = useAuth();

  return useMemo(() => {
    if (isLoading) return [];
    return groups
      .map((group) => ({
        ...group,
        items: filterItems(group.items, can)
      }))
      .filter((group) => group.items.length > 0);
  }, [groups, can, isLoading]);
}
