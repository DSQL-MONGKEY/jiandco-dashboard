import { NextResponse, type NextRequest } from 'next/server';
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  clearAuthCookies,
  setAuthCookies,
  type AuthTokens
} from './auth-cookies';

export const BACKEND_URL = (process.env.BACKEND_URL ?? 'http://localhost:2900/api/v1').replace(
  /\/+$/,
  ''
);

type BackendRefreshData = {
  token: string;
  refreshToken: string;
  expiresIn: number;
};

const refreshRequests = new Map<string, Promise<AuthTokens | null>>();

function parseTokens(data: BackendRefreshData): AuthTokens {
  return {
    accessToken: data.token,
    refreshToken: data.refreshToken,
    expiresIn: data.expiresIn
  };
}

export function refreshAuthTokens(refreshToken: string): Promise<AuthTokens | null> {
  const existing = refreshRequests.get(refreshToken);
  if (existing) return existing;

  const request = (async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
        cache: 'no-store',
        signal: AbortSignal.timeout(120_000)
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.success) return null;
      return parseTokens(payload.data as BackendRefreshData);
    } catch (error) {
      console.error('[backend] refresh failed', error);
      return null;
    }
  })().finally(() => {
    refreshRequests.delete(refreshToken);
  });

  refreshRequests.set(refreshToken, request);
  return request;
}

export async function backendFetch(
  path: string,
  init: RequestInit = {},
  accessToken?: string
): Promise<Response> {
  const headers = new Headers(init.headers);
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  return fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers,
    cache: 'no-store',
    signal: init.signal ?? AbortSignal.timeout(120_000)
  });
}

export async function backendProxy(
  request: NextRequest,
  path: string,
  init: RequestInit = {}
): Promise<NextResponse> {
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  if (!accessToken && !refreshToken) {
    return NextResponse.json(
      { success: false, code: 401, message: 'authentication is required' },
      { status: 401 }
    );
  }

  let response: Response;
  let tokens: AuthTokens | null = null;

  try {
    response = await backendFetch(path, init, accessToken);

    if (response.status === 401 && refreshToken) {
      tokens = await refreshAuthTokens(refreshToken);
      if (tokens) {
        response = await backendFetch(path, init, tokens.accessToken);
      }
    }
  } catch (error) {
    console.error(`[backend] proxy request failed: ${path}`, error);
    return NextResponse.json(
      { success: false, code: 502, message: 'backend API is unreachable' },
      { status: 502 }
    );
  }

  const body = await response.arrayBuffer();
  const nextResponse = new NextResponse(body, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('content-type') ?? 'application/json'
    }
  });

  if (tokens) {
    setAuthCookies(nextResponse, tokens);
  } else if (response.status === 401) {
    clearAuthCookies(nextResponse);
  }

  return nextResponse;
}

export function readJsonBody<T>(payload: unknown): T | null {
  if (!payload || typeof payload !== 'object') return null;
  const value = payload as { success?: boolean; data?: T };
  return value.success && value.data ? value.data : null;
}
