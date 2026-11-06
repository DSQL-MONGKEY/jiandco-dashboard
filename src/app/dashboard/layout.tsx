import KBar from '@/components/kbar';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AuthProvider } from '@/features/auth/context/auth-provider';
import { ACCESS_COOKIE, REFRESH_COOKIE } from '@/lib/auth-cookies';
import { tryServerApi } from '@/lib/server-api';
import type { MeData } from '@/types/api';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Jiandco Dashboard',
  description: 'Internal operations dashboard for Ji&Co, operated by PT. Sadhika Cipta Mandiri.',
  robots: {
    index: false,
    follow: false,
    nocache: true
  }
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const hasSession = cookieStore.has(ACCESS_COOKIE) || cookieStore.has(REFRESH_COOKIE);

  if (!hasSession) {
    redirect('/auth/sign-in');
  }

  const me = await tryServerApi<MeData>('/auth/me');
  const initialData = me?.user ? me : undefined;
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';

  return (
    <AuthProvider initialData={initialData}>
      <KBar>
        <SidebarProvider defaultOpen={defaultOpen}>
          <a
            href='#main-content'
            className='bg-background ring-ring sr-only rounded-md px-3 py-2 text-sm font-medium shadow focus:not-sr-only focus:absolute focus:top-2 focus:start-2 focus:z-50 focus:ring-2'
          >
            Skip to content
          </a>
          <AppSidebar />
          <SidebarInset id='main-content' tabIndex={-1} className='scroll-mt-16'>
            <Header />
            {children}
          </SidebarInset>
        </SidebarProvider>
      </KBar>
    </AuthProvider>
  );
}
