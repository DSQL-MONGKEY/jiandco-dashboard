'use client';

import { useAuth } from '../context/auth-provider';
import { AccessDenied } from './access-denied';

export function RequirePermission({
  page,
  action,
  children,
  fallback
}: {
  page: string;
  action: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { can, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className='flex flex-1 items-center justify-center p-6'>
        <div className='bg-muted h-32 w-full max-w-md animate-pulse rounded-lg' />
      </div>
    );
  }

  if (!can(page, action)) {
    return fallback ?? <AccessDenied />;
  }

  return children;
}
