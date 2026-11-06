import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ACCESS_COOKIE, REFRESH_COOKIE } from '@/lib/auth-cookies';

export default async function Page() {
  const cookieStore = await cookies();
  const hasSession = cookieStore.has(ACCESS_COOKIE) || cookieStore.has(REFRESH_COOKIE);

  redirect(hasSession ? '/dashboard/overview' : '/auth/sign-in');
}
