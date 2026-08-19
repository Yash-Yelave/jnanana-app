import type { ReactNode } from "react";

/**
 * Continuous horizontal scroller.
 *
 * The children are rendered twice and the track travels exactly -50%, so the
 * loop is seamless. Pauses on hover; frozen under prefers-reduced-motion.
 */
export function Marquee({
  children,
  seconds = 40,
  className = "",
  ariaLabel,
}: {
  children: ReactNode;
  seconds?: number;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <div className={`overflow-hidden ${className}`} role="group" aria-label={ariaLabel}>
      <div
        className="marquee"
        style={{ animation: `marquee ${seconds}s linear infinite` }}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        {/* Second copy exists only to close the loop — hide it from AT. */}
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
