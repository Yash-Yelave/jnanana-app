import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.VERCEL ? {} : { output: "standalone" }),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;
