"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

/** How long each script holds. Long enough to actually read a word in a
    script you may not know — at half this it registered as a flicker. */
const STEP = 850;

/** The resting spelling holds longer, so it reads as the canonical form and the
    others as the flourish, rather than all four looking equally provisional. */
const REST_STEP = 2200;

/** Let the line's reveal animation settle before the word starts moving. */
const ENTRY_DELAY = 520;

export type ScriptVariant = {
  /** Stable key, and the BCP-47 tag hint for the script. */
  lang: string;
  node: ReactNode;
  className?: string;
};

/**
 * Cycles a word through the scripts it lives in, continuously.
 *
 * Runs only while on screen: the observer starts it on entry and stops it on
 * exit, so an off-screen band is not driving a timer. It also resets to the
 * resting spelling when it leaves, so the word is never caught mid-cycle in a
 * screenshot or on a fresh scroll back.
 *
 * Every variant occupies the same grid cell (`.jnana` in globals.css), so the
 * element is already as wide as the widest spelling and whatever sits beside it
 * never reflows mid-animation.
 */
export function ScriptCycle({
  variants,
  label,
  className = "",
  stepMs = STEP,
  restMs = REST_STEP,
}: {
  variants: ScriptVariant[];
  /** What assistive tech reads, regardless of where the cycle has got to. */
  label: string;
  className?: string;
  /** Hold per script, if one instance wants a different pace. */
  stepMs?: number;
  /** Hold for the resting spelling at the end of each pass. */
  restMs?: number;
}) {
  const rest = variants.length - 1;
  const [index, setIndex] = useState(rest);
  const hostRef = useRef<HTMLSpanElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stop = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  useEffect(() => stop, [stop]);

  useEffect(() => {
    const el = hostRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Chained timeouts rather than an interval, so the resting spelling can
    // hold longer than the rest of the cycle.
    const advance = (next: number) => {
      setIndex(next);
      timer.current = setTimeout(
        () => advance((next + 1) % variants.length),
        next === rest ? restMs : stepMs,
      );
    };

    const observer = new IntersectionObserver(
      ([observed]) => {
        if (observed.isIntersecting) {
          if (!timer.current) timer.current = setTimeout(() => advance(0), ENTRY_DELAY);
          return;
        }
        stop();
        setIndex(rest);
      },
      { threshold: 0.6 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      stop();
    };
  }, [variants.length, rest, stepMs, restMs, stop]);

  return (
    <span ref={hostRef} className={`jnana ${className}`} aria-label={label}>
      {variants.map((variant, i) => (
        <span key={variant.lang} aria-hidden data-active={i === index} className={variant.className}>
          {variant.node}
        </span>
      ))}
    </span>
  );
}
