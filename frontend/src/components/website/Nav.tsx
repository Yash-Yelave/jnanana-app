"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
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

  const target = profile?.role === "mentor" ? "/mentor/home" : "/dashboard";
  const avatar = publicAsset("avatars", profile?.avatar_path) ?? "/assets/app/mentor-1.png";

  // Lock scroll when mobile menu is open, handle Escape key
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <nav
      className={`sticky top-0 z-50 border-b-[1.5px] border-edge bg-paper/95 backdrop-blur-[12px] transition-all duration-300 ${
        scrolled ? "shadow-soft" : ""
      }`}
    >
      <div
        className={`wrap flex items-center justify-between transition-all duration-300 ${
          scrolled ? "py-2.5" : "py-4"
        }`}
      >
        <Link href="#top" aria-label="Jṉanana — back to top" className="group inline-block transition-transform duration-200 hover:scale-105">
          <Wordmark />
        </Link>

        {/* Desktop Navigation Links & Auth Buttons */}
        <div className="hidden items-center gap-7 lg:flex">
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
                  className="rounded-full object-cover border-2 border-magenta"
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

        {/* Mobile Hamburger Toggle Button */}
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-controls="mobile-nav-panel"
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex h-11 w-11 shrink-0 flex-col items-center justify-center gap-[5px] border-[1.5px] border-edge bg-white shadow-hard-sm transition-transform active:translate-[2px] active:shadow-none lg:hidden cursor-pointer"
        >
          <span
            className={`h-[2.5px] w-5 bg-ink transition-all duration-200 ${
              open ? "translate-y-[7.5px] rotate-45" : ""
            }`}
          />
          <span
            className={`h-[2.5px] w-5 bg-ink transition-all duration-200 ${
              open ? "opacity-0 scale-50" : "opacity-100"
            }`}
          />
          <span
            className={`h-[2.5px] w-5 bg-ink transition-all duration-200 ${
              open ? "-translate-y-[7.5px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile Navigation Panel Overlay */}
      {open && (
        <div
          id="mobile-nav-panel"
          className="absolute left-0 right-0 top-full z-50 max-h-[calc(100vh-70px)] overflow-y-auto border-b-[1.5px] border-edge bg-[#FBF3E7] p-5 shadow-2xl lg:hidden"
        >
          <div className="flex flex-col gap-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="mono border-b border-[#141210]/15 py-3.5 text-base font-bold text-ink transition-colors hover:text-magenta"
              >
                {item.label}
              </Link>
            ))}

            <div className="mt-4 flex flex-col gap-3 pt-2">
              {isLoggedIn ? (
                <Button
                  href={target}
                  variant="magenta"
                  className="w-full justify-center"
                  onClick={() => setOpen(false)}
                >
                  Go to Dashboard →
                </Button>
              ) : (
                <>
                  <Button
                    href="/login"
                    variant="ghost"
                    className="w-full justify-center border-[1.5px] border-edge bg-white"
                    onClick={() => setOpen(false)}
                  >
                    Sign In
                  </Button>
                  <Button
                    href="/onboarding/student"
                    variant="magenta"
                    className="w-full justify-center"
                    onClick={() => setOpen(false)}
                  >
                    Join as Mentee
                  </Button>
                  <Button
                    href="/onboarding/mentor"
                    variant="amber"
                    className="w-full justify-center"
                    onClick={() => setOpen(false)}
                  >
                    Join as Mentor
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
