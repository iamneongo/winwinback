import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server runtime (not static export) — required for the database-backed
  // dashboard, auth, affiliate redirects and webhooks.
  output: "standalone",
  async headers() {
    return [{ source: "/sw.js", headers: [
      { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
      { key: "Content-Type", value: "application/javascript; charset=utf-8" },
      { key: "X-Content-Type-Options", value: "nosniff" },
    ] }];
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
