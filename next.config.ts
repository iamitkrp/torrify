import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Updated for Next.js 15
  serverExternalPackages: ['playwright', 'cheerio'],
  
  // Headers for better scraping compatibility
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type',
          },
        ],
      },
    ];
  },
  // Optimize for production
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
