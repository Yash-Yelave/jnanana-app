import { networkInterfaces } from "node:os";
import type { NextConfig } from "next";

/**
 * Every non-internal IPv4 address this machine has.
 *
 * Opening the dev server on its LAN address — to test on a phone, or just
 * because that is the URL in the address bar — is a different origin to Next,
 * which answers every `/_next/static/chunks/*` request with a 403. The HTML
 * still renders, so the page looks perfect and nothing is clickable: React
 * never hydrates. Detecting the address beats remembering to set an env var.
 */
function lanAddresses(): string[] {
  const found: string[] = [];
  for (const addresses of Object.values(networkInterfaces())) {
    for (const address of addresses ?? []) {
      if (address.family === "IPv4" && !address.internal) found.push(address.address);
    }
  }
  return found;
}

const nextConfig: NextConfig = {
  ...(process.env.VERCEL ? {} : { output: "standalone" }),
  // Entries are matched literally: a `*` only stands in for a subdomain label,
  // so numeric wildcards like `192.168.*.*` and CIDR ranges never match an IP.
  // This machine's own LAN addresses are detected at startup so the dev server
  // works over the network without any setup; DEV_LAN_HOST is still there for
  // anything detection cannot see, such as a tunnel or a reverse proxy.
  // Dev-only — `allowedDevOrigins` has no effect on a production build.
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    ...lanAddresses(),
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
