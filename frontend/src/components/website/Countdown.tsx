"use client";

import { useEffect, useState } from "react";

const SECOND = 1_000;

type Parts = { d: string; h: string; m: string; s: string };

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function countdownParts(isoStart: string): Parts | null {
  const remaining = new Date(isoStart).getTime() - Date.now();
  if (!Number.isFinite(remaining) || remaining <= 0) return null;

  const total = Math.floor(remaining / SECOND);
  return {
    d: pad(Math.floor(total / 86_400)),
    h: pad(Math.floor((total % 86_400) / 3_600)),
    m: pad(Math.floor((total % 3_600) / 60)),
    s: pad(total % 60),
  };
}

/**
 * One unit of the clock. Each character gets its own clipped slot, keyed by its
 * value, so React remounts only the digits that actually changed and the drop
 * animation plays on those alone — `19h` ticking to `18h` moves one digit, not
 * the whole group.
 */
function Unit({ value, suffix }: { value: string; suffix: string }) {
  return (
    <span className="inline-flex items-baseline">
      {value.split("").map((digit, index) => (
        <span key={`${index}-${digit}`} className="cd-slot">
          <span className="cd-digit" suppressHydrationWarning>
            {digit}
          </span>
        </span>
      ))}
      <span className="ml-[1px] opacity-60">{suffix}</span>
    </span>
  );
}

/**
 * Live countdown to the edition, for the hero sticker.
 *
 * Rendered on the server as well as the client so the clock is present in the
 * HTML rather than appearing only after hydration. The page is statically
 * prerendered, so the baked value is stale by definition — the effect corrects
 * it on mount, and suppressHydrationWarning on each digit absorbs the
 * difference. Renders nothing once the date has passed, so a finished event
 * never shows a negative clock.
 */
export function Countdown({ isoStart }: { isoStart: string }) {
  const [parts, setParts] = useState(() => countdownParts(isoStart));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setParts(countdownParts(isoStart));

    const id = setInterval(() => setParts(countdownParts(isoStart)), SECOND);
    return () => clearInterval(id);
  }, [isoStart]);

  if (!parts) return null;

  return (
    <span
      aria-label={`${Number(parts.d)} days, ${Number(parts.h)} hours, ${Number(parts.m)} minutes until the event`}
      className="mt-2 flex items-baseline justify-center gap-[5px] border-t border-white/25 pt-1.5 text-[10px] tracking-[0.08em] text-white/80 tabular-nums"
    >
      <Unit value={parts.d} suffix="d" />
      <Unit value={parts.h} suffix="h" />
      <Unit value={parts.m} suffix="m" />
      <Unit value={parts.s} suffix="s" />
    </span>
  );
}
