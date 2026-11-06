import type { NextRequest } from 'next/server';
import { backendProxy } from '@/lib/backend';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  return backendProxy(request, '/auth/avatar', {
    method: 'POST',
    body: formData
  });
}
