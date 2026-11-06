import type { NextRequest } from 'next/server';
import { backendProxy } from '@/lib/backend';

export async function PUT(request: NextRequest) {
  const body = await request.text();
  return backendProxy(request, '/auth/password', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body
  });
}
