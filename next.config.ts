import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server runtime (not static export) — required for the database-backed
  // dashboard, auth, affiliate redirects and webhooks.
  output: "standalone",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
