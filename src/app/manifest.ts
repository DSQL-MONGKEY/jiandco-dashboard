import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Ji&Co Dashboard',
    short_name: 'Ji&Co',
    description: 'Internal operations dashboard for Ji&Co.',
    start_url: '/dashboard/overview',
    scope: '/',
    display: 'standalone',
    background_color: '#EEE4DA',
    theme_color: '#4D0E13',
    lang: 'id',
    icons: [
      {
        src: '/brand/jiandco-mark-192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/brand/jiandco-mark-512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  };
}
