import { NextResponse, type NextRequest } from 'next/server';
import { BACKEND_URL, backendFetch, readJsonBody } from '@/lib/backend';
import { setAuthCookies, type AuthTokens } from '@/lib/auth-cookies';
import type { AuthUser, MeData } from '@/types/api';

type LoginData = {
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
  const body = await request.json().catch(() => null);
  if (!body?.username || !body?.password) {
    return NextResponse.json(
      { success: false, code: 400, message: 'username and password are required' },
      { status: 400 }
    );
  }

  const response = await fetch(`${BACKEND_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: body.username, password: body.password }),
    cache: 'no-store'
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    return NextResponse.json(
      payload ?? { success: false, code: response.status, message: 'login failed' },
      { status: response.status }
    );
  }

  const loginData = payload.data as LoginData;
  const tokens: AuthTokens = {
    accessToken: loginData.token,
    refreshToken: loginData.refreshToken,
    expiresIn: loginData.expiresIn
  };

  const me = await fetchMe(tokens.accessToken);
  const result: MeData = me ?? { user: loginData.user, permissions: [] };
  const nextResponse = NextResponse.json({ success: true, data: result });
  setAuthCookies(nextResponse, tokens);
  return nextResponse;
}
