import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.VERCEL ? {} : { output: "standalone" }),
  // Testing on a real phone means loading the dev server over the LAN, and Next
  // blocks its dev chunks from other origins by default — the page renders but
  // React never hydrates, so nothing interactive works.
  //
  // Entries are matched literally (a `*` only stands in for a subdomain label,
  // so numeric wildcards like `192.168.*.*` never match an IP). List the hosts
  // you actually open the dev server from; add your machine's LAN address here
  // to test on a phone. Dev-only — no effect on a production build.
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    ...(process.env.DEV_LAN_HOST ? [process.env.DEV_LAN_HOST] : []),
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;
