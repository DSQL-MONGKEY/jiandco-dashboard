import type { NextRequest } from 'next/server';
import { backendProxy } from '@/lib/backend';

export async function GET(request: NextRequest) {
  return backendProxy(request, '/auth/me');
}
