import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  serverExternalPackages: ['lightningcss', 'lightningcss-linux-arm64-gnu', '@tailwindcss/node', '@tailwindcss/postcss'],
  turbopack: {
    resolveAlias: {
      'lightningcss-linux-arm64-gnu': path.resolve('./node_modules/lightningcss-linux-arm64-gnu'),
    },
  },
};

export default nextConfig;
