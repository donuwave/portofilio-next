import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A self-contained server in .next/standalone, for a small Docker image.
  output: "standalone",
  experimental: {
    // proxy.ts runs on /api (auth), and Next buffers every request body that passes through it,
    // by default only up to 10 MB: anything larger would be cut off, which would corrupt video
    // uploads. Keep in sync with MAX_UPLOAD_BYTES in src/lib/media-storage.ts.
    proxyClientMaxBodySize: "160mb",
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
