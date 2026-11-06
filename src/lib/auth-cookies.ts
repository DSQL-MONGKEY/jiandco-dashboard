import type { NextResponse } from 'next/server';

export const ACCESS_COOKIE = 'jiandco_access';
export const REFRESH_COOKIE = 'jiandco_refresh';
export const REFRESH_MAX_AGE = 60 * 60 * 24 * 7;

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

const isProduction = process.env.NODE_ENV === 'production';

export function setAuthCookies(response: NextResponse, tokens: AuthTokens) {
  response.cookies.set({
    name: ACCESS_COOKIE,
    value: tokens.accessToken,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: tokens.expiresIn
  });
  response.cookies.set({
    name: REFRESH_COOKIE,
    value: tokens.refreshToken,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: REFRESH_MAX_AGE
  });
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set({
    name: ACCESS_COOKIE,
    value: '',
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  });
  response.cookies.set({
    name: REFRESH_COOKIE,
    value: '',
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  });
}
