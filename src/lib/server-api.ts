import { cookies } from 'next/headers';
import { BACKEND_URL } from './backend';
import { ACCESS_COOKIE } from './auth-cookies';

export async function tryServerApi<T>(path: string): Promise<T | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  if (!accessToken) return null;

  try {
    const response = await fetch(`${BACKEND_URL}${path}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store'
    });
    if (!response.ok) return null;

    const payload = await response.json();
    return payload?.success ? (payload.data as T) : null;
  } catch {
    return null;
  }
}
