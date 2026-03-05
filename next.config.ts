import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api-proxy/:path*',
        destination: 'http://15.185.100.83:3000/:path*',
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'd3nwctuxlbgmpm.cloudfront.net',
      },
      {
        protocol: 'http',
        hostname: '15.185.100.83',
      }
    ],
  },
};

export default nextConfig;
