"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/**
 * Fade-up on scroll.
 *
 * Content is VISIBLE by default and is only hidden once JS has confirmed the
 * element is still below the fold. That ordering matters: if the bundle is slow,
 * blocked, or hydration fails, the page still shows all of its content instead
 * of rendering blank. Hiding happens off-screen, so there is no flash.
 */
export function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  variant = "fade-up",
  className = "",
}: {
  children: ReactNode;
  as?: ElementType;
  delay?: number;
  variant?: "fade-up" | "fade-down" | "fade-left" | "fade-right" | "scale-up";
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Anything already on screen, or that the user opted out of animating,
    // simply stays as it rendered.
    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      el.getBoundingClientRect().top < window.innerHeight
    ) {
      return;
    }

    el.style.transitionDelay = `${delay}ms`;
    el.classList.add("will-reveal", `reveal-${variant}`);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.classList.add("is-in");
        observer.disconnect();
      },
      { threshold: 0.08, rootMargin: "0px 0px -5% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, variant]);

  return (
    <Tag ref={ref} className={`reveal ${className}`}>
      {children}
    </Tag>
  );
}

