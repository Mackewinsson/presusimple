/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove output: 'export' as we want server-side rendering for Vercel
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  webpack: (config, { isServer }) => {
    // Disable cache for both client and server builds
    config.cache = false;
    return config;
  },
};

module.exports = nextConfig;