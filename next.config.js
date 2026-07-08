const isDev = process.env.NODE_ENV === 'development';
// In development, PWA (and thus the service worker) is disabled unless ENABLE_PWA_DEV=true
// Use: ENABLE_PWA_DEV=true npm run dev when testing notifications or install prompt
const pwaDisabled = isDev && process.env.ENABLE_PWA_DEV !== 'true';

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: pwaDisabled,
  // app-build-manifest.json is emitted by the App Router build but returns 404
  // on Vercel; if workbox tries to precache it the service worker install
  // fails and push notifications break ("no active Service Worker").
  buildExcludes: [/middleware-manifest\.json$/, /app-build-manifest\.json$/],
  customWorkerDir: 'worker', // Extend auto-generated SW with custom notification handling
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self'",
          },
        ],
      },
    ];
  },
  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

module.exports = withPWA(nextConfig);
