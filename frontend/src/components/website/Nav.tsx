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

  // Lock the page behind the mobile panel, and let Escape close it.
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
    <nav className={`sticky top-0 z-50 border-b-[1.5px] border-edge bg-paper/90 backdrop-blur-[12px] transition-all duration-300 ${
      scrolled ? "shadow-soft" : ""
    }`}>
      <div
        className={`wrap flex items-center justify-between transition-all duration-300 ${
          scrolled ? "py-2.5" : "py-4"
        }`}
      >
        <Link href="#top" aria-label="Jṉanana — back to top" className="group inline-block transition-transform duration-200 hover:scale-105">
          <Wordmark />
        </Link>

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

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex h-11 w-11 shrink-0 flex-col items-center justify-center gap-[5px] border-[1.5px] border-edge bg-white shadow-hard-sm transition-transform active:translate-[3px] active:shadow-none lg:hidden"
        >
          <span
            className={`h-[2px] w-5 bg-ink transition-transform duration-250 ${
              open ? "translate-y-[7px] rotate-45" : ""
            }`}
          />
          <span
            className={`h-[2px] w-5 bg-ink transition-opacity duration-250 ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`h-[2px] w-5 bg-ink transition-transform duration-250 ${
              open ? "-translate-y-[7px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile panel */}
      <div
        id="mobile-nav"
        className={`max-h-[calc(100dvh-72px)] overflow-y-auto border-t-[1.5px] border-edge bg-paper transition-all duration-300 lg:hidden ${
          open ? "block opacity-100 translate-y-0" : "hidden opacity-0 -translate-y-2"
        }`}
      >
        <div className="wrap flex flex-col gap-1 py-5">
          {nav.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              style={{ transitionDelay: `${i * 30}ms` }}
              className="mono border-b border-line py-4 text-ink transition-all duration-200 hover:translate-x-2 hover:text-magenta"
            >
              {item.label}
            </Link>
          ))}
          <Button
            href="#join"
            variant="magenta"
            className="mt-5 w-full"
            onClick={() => setOpen(false)}
          >
            Join Jṉanana
          </Button>
        </div>
      </div>
    </nav>
  );
}

