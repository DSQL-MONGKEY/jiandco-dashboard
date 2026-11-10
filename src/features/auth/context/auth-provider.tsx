'use client';

import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import type { AuthUser, MeData } from '@/types/api';
import { ApiError } from '@/lib/api-client';
import { authQueries } from '../api/queries';
import { logout as logoutRequest } from '../api/service';

type AuthContextValue = {
  user: AuthUser | null;
  permissions: string[];
  isLoading: boolean;
  isSuperAdmin: boolean;
  can: (page: string, action: string) => boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  initialData,
  children
}: {
  initialData?: MeData;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const query = useQuery({
    ...authQueries.me(),
    initialData
  });

  const user = query.data?.user ?? null;
  const permissions = useMemo(() => query.data?.permissions ?? [], [query.data?.permissions]);
  const isSuperAdmin = (user?.role.level ?? 99) <= 1;

  useEffect(() => {
    if (query.error instanceof ApiError && query.error.status === 401) {
      router.replace('/auth/sign-in');
    }
  }, [query.error, router]);

  const can = useCallback(
    (page: string, action: string) => {
      if (isSuperAdmin) return true;
      return permissions.includes(`${page}.${action}`);
    },
    [isSuperAdmin, permissions]
  );

  const refreshUser = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: authQueries.me().queryKey });
  }, [queryClient]);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      queryClient.clear();
      router.replace('/auth/sign-in');
      router.refresh();
    }
    // oxlint-disable-next-line react/memo-dependencies -- both values are used in the callback
  }, [queryClient, router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      permissions,
      isLoading: query.isLoading,
      isSuperAdmin,
      can,
      refreshUser,
      logout
    }),
    [user, permissions, query.isLoading, isSuperAdmin, can, refreshUser, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
