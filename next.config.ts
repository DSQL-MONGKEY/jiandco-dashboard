import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,
  experimental: {
    cpus: 1,
    proxyClientMaxBodySize: '64mb'
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }]
      }
    ];
  }
};

export default nextConfig;
