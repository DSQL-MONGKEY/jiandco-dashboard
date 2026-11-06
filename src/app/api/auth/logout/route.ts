import { NextResponse, type NextRequest } from 'next/server';
import { backendFetch } from '@/lib/backend';
import { ACCESS_COOKIE, clearAuthCookies } from '@/lib/auth-cookies';

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  if (accessToken) {
    await backendFetch('/auth/logout', { method: 'POST' }, accessToken).catch(() => null);
  }

  const response = NextResponse.json({
    success: true,
    data: { message: 'logged out' }
  });
  clearAuthCookies(response);
  return response;
}
