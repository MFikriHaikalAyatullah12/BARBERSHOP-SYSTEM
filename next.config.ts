import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable source maps in development to prevent warnings
  productionBrowserSourceMaps: false,
  webpack: (config, { dev }) => {
    if (dev) {
      config.devtool = false;
    }
    return config;
  },  // Add empty turbopack config to suppress warning
  turbopack: {}};

export default nextConfig;
