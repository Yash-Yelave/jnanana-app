"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { nav } from "@/content/landing";
import { apiFetch } from "@/lib/api";
import { createClient, publicAsset } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import { Button, Wordmark } from "./ui";

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.access_token) {
        setIsLoggedIn(true);
        apiFetch<Profile>("/me")
          .then(setProfile)
          .catch(() => null);
      }
    });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = useCallback(() => setOpen(false), []);

  // Stop the page behind the drawer from scrolling. Plain `overflow: hidden` —
  // pinning the body with `position: fixed` also works and covers iOS Safari,
  // but it reflows the whole document the instant the menu opens, which is a lot
  // of side effect for a nav toggle. The drawer is opaque and full-screen, so
  // any scroll that does leak through is invisible anyway.
  useEffect(() => {
    if (!open) return;

    const { body } = document;
    const previous = body.style.overflow;
    body.style.overflow = "hidden";

    return () => {
      body.style.overflow = previous;
    };
  }, [open]);

  // Escape closes, and focus moves into the drawer. Focus only returns to the
  // trigger when the menu was actually open — sending focus there on first mount
  // put a focus ring on the button before anyone had touched it.
  useEffect(() => {
    if (!open) {
      if (wasOpenRef.current) triggerRef.current?.focus({ preventScroll: true });
      wasOpenRef.current = false;
      return;
    }

    wasOpenRef.current = true;
    closeRef.current?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, closeMenu]);

  // A resize past the lg breakpoint reveals the desktop nav; a drawer left open
  // would otherwise cover the page with no visible way out.
  useEffect(() => {
    if (!open) return;
    const query = window.matchMedia("(min-width: 1024px)");
    const onChange = () => query.matches && setOpen(false);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [open]);

  const target = profile?.role === "mentor" ? "/mentor/home" : "/dashboard";
  const avatar = publicAsset("avatars", profile?.avatar_path) ?? "/assets/app/mentor-1.png";

  return (
    <>
      <nav
        className={`sticky top-0 z-50 border-b-[1.5px] border-edge bg-[#FBF3E7]/95 backdrop-blur-[12px] transition-all duration-300 ${
          scrolled ? "shadow-soft" : ""
        }`}
      >
        <div
          className={`wrap flex items-center justify-between gap-4 transition-all duration-300 ${
            scrolled ? "py-2.5" : "py-4"
          }`}
        >
          <Link
            href="#top"
            aria-label="Jṉanana — back to top"
            className="group inline-block shrink-0 transition-transform duration-200 hover:scale-105"
          >
            <Wordmark />
          </Link>

          {/* Desktop navigation */}
          <div className="hidden items-center gap-6 lg:flex xl:gap-7">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="mono relative border-b border-transparent pb-0.5 text-ink transition-all duration-200 hover:-translate-y-0.5 hover:border-magenta hover:text-magenta"
              >
                {item.label}
              </Link>
            ))}

            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <Button href={target} variant="magenta" size="sm" className="transition-transform duration-200 hover:scale-105">
                  Dashboard
                </Button>
                <Link href={target} aria-label="Go to profile">
                  <Image
                    src={avatar}
                    alt="Profile"
                    width={38}
                    height={38}
                    className="rounded-full border-2 border-magenta object-cover"
                  />
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Button href="/login" variant="ghost" size="sm" className="transition-transform duration-200 hover:scale-105">
                  Sign In
                </Button>
                <Button href="/onboarding/student" variant="magenta" size="sm" className="transition-transform duration-200 hover:scale-105">
                  Join as Mentee
                </Button>
              </div>
            )}
          </div>

          {/* Mobile / tablet trigger — 44px square, the minimum comfortable tap target */}
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex h-11 w-11 shrink-0 cursor-pointer flex-col items-center justify-center gap-[5px] border-[1.5px] border-edge bg-white shadow-hard-sm transition-transform active:translate-y-[2px] active:shadow-none lg:hidden"
          >
            <span
              className={`h-[2.5px] w-5 bg-ink transition-all duration-200 ${
                open ? "translate-y-[7.5px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-[2.5px] w-5 bg-ink transition-all duration-200 ${
                open ? "scale-50 opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`h-[2.5px] w-5 bg-ink transition-all duration-200 ${
                open ? "-translate-y-[7.5px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </nav>

      {/* Full-screen drawer. `inset-0` sizes it — an explicit 100vw would overflow
          horizontally wherever a classic scrollbar takes width. */}
      {open && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-0 z-[100] flex h-[100dvh] flex-col overscroll-contain bg-[#FBF3E7] lg:hidden"
        >
          <div
            className="flex items-center justify-between gap-4 border-b-[1.5px] border-edge bg-[#FBF3E7] px-5 py-4"
            style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
          >
            <Link href="#top" onClick={() => closeMenu()} aria-label="Jṉanana — back to top">
              <Wordmark />
            </Link>

            <button
              ref={closeRef}
              type="button"
              onClick={() => closeMenu()}
              aria-label="Close menu"
              className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center border-[1.5px] border-edge bg-white text-xl font-bold text-ink shadow-hard-sm active:translate-y-[2px] active:shadow-none"
            >
              ✕
            </button>
          </div>

          <div
            className="flex flex-1 flex-col justify-between overflow-y-auto overscroll-contain px-6 py-6"
            style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
          >
            <div className="flex flex-col gap-1">
              <span className="mono mb-2 text-xs font-bold tracking-widest text-magenta uppercase">
                Navigation
              </span>
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => closeMenu()}
                  className="mono border-b border-[#141210]/15 py-4 text-lg font-extrabold text-ink transition-colors hover:text-magenta"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3.5 pb-2">
              {isLoggedIn ? (
                <Button
                  href={target}
                  variant="magenta"
                  className="w-full justify-center py-4 text-base"
                  onClick={() => closeMenu()}
                >
                  Go to Dashboard →
                </Button>
              ) : (
                <>
                  <Button
                    href="/login"
                    variant="ghost"
                    className="w-full justify-center border-[1.5px] border-edge bg-white py-3.5 text-base"
                    onClick={() => closeMenu()}
                  >
                    Sign In
                  </Button>
                  <Button
                    href="/onboarding/student"
                    variant="magenta"
                    className="w-full justify-center py-4 text-base"
                    onClick={() => closeMenu()}
                  >
                    Join as Mentee
                  </Button>
                  <Button
                    href="/onboarding/mentor"
                    variant="amber"
                    className="w-full justify-center py-3.5 text-base"
                    onClick={() => closeMenu()}
                  >
                    Join as Mentor
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
