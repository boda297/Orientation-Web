import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
