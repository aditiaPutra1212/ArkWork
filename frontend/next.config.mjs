// frontend/next.config.mjs
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
// Pastikan tidak ada slash di akhir URL
const apiBase = (process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000').replace(/\/+$/, '');

const nextConfig = {
  reactStrictMode: true,

  // 1. Konfigurasi Image agar Next.js boleh memuat gambar dari Backend
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/uploads/**',
      },
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },

  // 2. Konfigurasi Rewrite (Jembatan Frontend -> Backend)
  async rewrites() {
    console.log(`[Next.js Proxy] Rewriting API calls to: ${apiBase}`);
    return [
      // --- [PENTING] JEMBATAN FILE UPLOADS/GAMBAR ---
      // Ini yang memperbaiki gambar pecah (404)
      {
        source: '/uploads/:path*', 
        destination: `${apiBase}/uploads/:path*` 
      },

      // --- Aturan Auth Spesifik ---
      {
        source: '/api/auth/signin',
        destination: `${apiBase}/auth/signin`
      },
      {
        source: '/api/auth/verify',
        destination: `${apiBase}/auth/verify`
      },
      {
        source: '/api/auth/forgot',
        destination: `${apiBase}/auth/forgot`
      },
      {
        source: '/api/auth/reset-password',
        destination: `${apiBase}/auth/reset-password`
      },
      {
        source: '/api/auth/verify-token/:token',
        destination: `${apiBase}/auth/verify-token/:token` 
      },
      
      // --- Aturan Umum API ---
      // Menangkap semua request /api/... dan melempar ke backend
      {
        source: '/api/:path*',
        destination: `${apiBase}/api/:path*`
      },

      // --- Aturan Auth Lainnya ---
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
        source: '/auth/google/:path*',
        destination: `${apiBase}/auth/google/:path*`
      },
    ];
  },
};

export default withNextIntl(nextConfig);