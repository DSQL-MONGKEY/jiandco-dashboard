import { NextResponse, type NextRequest } from 'next/server';
import { BACKEND_URL, backendFetch, readJsonBody } from '@/lib/backend';
import {
  REFRESH_COOKIE,
  clearAuthCookies,
  setAuthCookies,
  type AuthTokens
} from '@/lib/auth-cookies';
import type { AuthUser, MeData } from '@/types/api';

type RefreshData = {
  token: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
};

async function fetchMe(accessToken: string): Promise<MeData | null> {
  const response = await backendFetch('/auth/me', {}, accessToken);
  const payload = await response.json().catch(() => null);
  const data = readJsonBody<MeData>(payload);
  if (data && data.user && Array.isArray(data.permissions)) {
    return data;
  }
  return null;
}

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) {
    return NextResponse.json(
      { success: false, code: 401, message: 'refresh token is missing' },
      { status: 401 }
    );
  }

  const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
    cache: 'no-store'
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    const nextResponse = NextResponse.json(
      payload ?? { success: false, code: 401, message: 'refresh failed' },
      { status: response.status }
    );
    clearAuthCookies(nextResponse);
    return nextResponse;
  }

  const refreshData = payload.data as RefreshData;
  const tokens: AuthTokens = {
    accessToken: refreshData.token,
    refreshToken: refreshData.refreshToken,
    expiresIn: refreshData.expiresIn
  };

  const me = await fetchMe(tokens.accessToken);
  const result: MeData = me ?? { user: refreshData.user, permissions: [] };
  const nextResponse = NextResponse.json({ success: true, data: result });
  setAuthCookies(nextResponse, tokens);
  return nextResponse;
}
