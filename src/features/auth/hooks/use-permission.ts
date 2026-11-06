'use client';

import { useAuth } from '../context/auth-provider';

export function usePermission(page: string, action: string) {
  const { can } = useAuth();
  return can(page, action);
}
