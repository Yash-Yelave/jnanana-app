import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.VERCEL ? {} : { output: "standalone" }),
  // Testing on a real phone means loading the dev server over the LAN, and Next
  // blocks its dev chunks from other origins by default — the page renders but
  // React never hydrates, so nothing interactive works.
  //
  // These are hostname patterns, not CIDR ranges: only `*` wildcards match.
  // Private LAN addresses only, and dev-only — no effect on a production build.
  allowedDevOrigins: [
    "192.168.*.*",
    "10.*.*.*",
    "172.16.*.*",
    "172.17.*.*",
    "172.18.*.*",
    "172.19.*.*",
    "172.20.*.*",
    "*.local",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;
