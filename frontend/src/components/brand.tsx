import Link from "next/link";
import { Wordmark } from "@/components/website/ui";

/**
 * The mark in the authenticated shell.
 *
 * Uses the same Wordmark as the website, so the brand reads identically on both
 * sides of the login. It previously carried a gold gradient lockup — the
 * "heritage club" theme §0.4 retires by name — set in a system sans rather than
 * the display face.
 */
export function Brand({ inverse = false, href = "/dashboard" }: { inverse?: boolean; href?: string }) {
  return (
    <Link
      className="inline-flex shrink-0 items-center py-1 transition-transform duration-200 hover:scale-105"
      href={href}
      aria-label="Jṉanana Foundation home"
    >
      <Wordmark onDark={inverse} />
    </Link>
  );
}
