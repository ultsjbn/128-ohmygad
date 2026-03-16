import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mctvkyblusfuxdjzhvzc.supabase.co",
      },
    ],
  },
};

export default nextConfig;
