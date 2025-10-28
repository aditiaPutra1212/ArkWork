// frontend/next.config.mjs
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const apiBase = (process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000').replace(/\/+$/, '');

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    console.log(`[Next.js Proxy] Rewriting API calls to: ${apiBase}`);
    return [
      // --- Specific rule for signin FIRST ---
      {
        source: '/api/auth/signin', // Path frontend calls
        destination: `${apiBase}/auth/signin` // Path target on backend
      },
      // --- General /api rule AFTER the specific one ---
      {
        source: '/api/:path*', // Catches other /api calls
        destination: `${apiBase}/api/:path*`
      },
      // --- Auth rules (non-conflicting with pages) ---
      {
        source: '/auth/me',
        destination: `${apiBase}/auth/me`
      },
      {
        source: '/auth/signup',
        destination: `${apiBase}/auth/signup`
      },
      {
        source: '/auth/signout',
        destination: `${apiBase}/auth/signout`
      },
      {
        source: '/auth/google/:path*', // For /auth/google and /auth/google/callback
        destination: `${apiBase}/auth/google/:path*`
      },
      // Add other /auth/* rules here if needed, ensure they don't conflict with frontend pages
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
};

export default withNextIntl(nextConfig);