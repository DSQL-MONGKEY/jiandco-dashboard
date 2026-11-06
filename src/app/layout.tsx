import Providers from '@/components/layout/providers';
import { Toaster } from '@/components/ui/sonner';
import { fontVariables } from '@/components/themes/font.config';
import { DEFAULT_THEME, THEMES } from '@/components/themes/theme.config';
import { brand } from '@/config/brand';
import ThemeProvider from '@/components/themes/theme-provider';
import { cn } from '@/lib/utils';
import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import NextTopLoader from 'nextjs-toploader';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import '../styles/globals.css';

const META_THEME_COLORS = {
  light: '#EEE4DA',
  dark: '#1A1110'
};

export const metadata: Metadata = {
  ...(process.env.NEXT_PUBLIC_APP_URL
    ? { metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL) }
    : {}),
  title: {
    default: 'Ji&Co Dashboard',
    template: '%s | Ji&Co Dashboard'
  },
  description: `Internal operations dashboard for ${brand.name}, operated by ${brand.companyName}.`,
  applicationName: 'Ji&Co Dashboard',
  authors: [{ name: brand.companyName }],
  creator: brand.companyName,
  publisher: brand.companyName,
  category: 'business',
  manifest: '/manifest.webmanifest',
  formatDetection: {
    telephone: false,
    email: false,
    address: false
  },
  appleWebApp: {
    capable: true,
    title: 'Ji&Co Dashboard',
    statusBarStyle: 'default'
  },
  icons: {
    icon: [
      { url: '/brand/jiandco-mark.png', sizes: '568x568', type: 'image/png' },
      { url: '/brand/jiandco-mark-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/brand/jiandco-mark-512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }]
  },
  openGraph: {
    title: 'Jiandco Dashboard',
    description: `Internal operations dashboard for ${brand.name}, operated by ${brand.companyName}.`,
    siteName: 'Jiandco Dashboard',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jiandco Dashboard',
    description: `Internal operations dashboard for ${brand.name}, operated by ${brand.companyName}.`
  }
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: META_THEME_COLORS.light },
    { media: '(prefers-color-scheme: dark)', color: META_THEME_COLORS.dark }
  ],
  colorScheme: 'light dark'
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const activeThemeValue = cookieStore.get('active_theme')?.value;
  const isValidTheme = THEMES.some((t) => t.value === activeThemeValue);
  const themeToApply = isValidTheme ? activeThemeValue! : DEFAULT_THEME;

  return (
    <html lang='id' suppressHydrationWarning data-theme={themeToApply}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                // Set meta theme color
                if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '${META_THEME_COLORS.dark}')
                }
              } catch (_) {}
            `
          }}
        />
      </head>
      <body
        className={cn(
          'bg-background overflow-x-hidden overscroll-none font-sans antialiased',
          fontVariables
        )}
      >
        <NextTopLoader color='var(--primary)' showSpinner={false} />
        <NuqsAdapter>
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange
            enableColorScheme
          >
            <Providers activeThemeValue={themeToApply}>
              <Toaster />
              {children}
            </Providers>
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
