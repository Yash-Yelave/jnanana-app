"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  Home,
  LayoutDashboard,
  GraduationCap,
  MessageSquare,
  Mic,
  Settings,
  BookOpen,
  ArrowUpRight,
  Search,
  Menu,
  Calendar,
} from "lucide-react";
import { Brand } from "@/components/brand";
import type { Profile } from "@/lib/types";
import { useApi } from "@/lib/use-api";
import { publicAsset } from "@/lib/supabase/client";
import styles from "./app-shell.module.css";

const studentNav = [
  { label: "Home", href: "/dashboard/home", icon: Home },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Mentorship", href: "/mentors", icon: GraduationCap },
  { label: "Chat Room", href: "/chat", icon: MessageSquare },
  { label: "Open Mic", href: "/community", icon: Mic },
  { label: "Settings", href: "/settings", icon: Settings },
] as const;

const mentorNav = [
  { label: "Home", href: "/mentor/home", icon: Home },
  { label: "Dashboard", href: "/mentor/dashboard", icon: LayoutDashboard },
  { label: "Bookings", href: "/mentor/bookings", icon: GraduationCap },
  { label: "Lessons", href: "/mentor/lessons", icon: BookOpen },
  { label: "Community", href: "/community", icon: Mic },
  { label: "Settings", href: "/settings", icon: Settings },
] as const;

function Navigation({ active, mentor = false }: { active: string; mentor?: boolean }) {
  const links = mentor ? mentorNav : studentNav;
  return (
    <nav className={styles.nav} aria-label={`${mentor ? "Mentor" : "Student"} navigation`}>
      {links.map(({ label, href, icon: Icon }) => (
        <Link className={active === href ? styles.active : ""} href={href} key={href}>
          <Icon className={styles.navIcon} size={22} />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}

export function AppShell({
  children,
  active,
  rightRail,
  mentor = false,
}: {
  children: ReactNode;
  active: string;
  rightRail?: ReactNode;
  mentor?: boolean;
}) {
  const { data: profile } = useApi<Profile>("/me");
  const avatar = publicAsset("avatars", profile?.avatar_path) ?? "/assets/app/avatar.png";
  const name = profile ? `${profile.first_name} ${profile.last_name}` : "Profile";
  return (
    <div className={`${styles.shell} ${rightRail ? "" : styles.withoutRail}`}>
      <aside className={styles.sidebar}>
        <Brand inverse />
        <Navigation active={active} mentor={mentor} />
        <Link className={styles.subscription} href="/subscription">
          <span className={styles.arrowBox}>
            <ArrowUpRight size={18} />
          </span>
          <strong>
            Get the
            <br />
            Subscription
          </strong>
          <Menu className={styles.subIcon} size={20} aria-hidden="true" />
        </Link>
      </aside>

      <header className={styles.mobileHeader}>
        <Brand inverse />
        <Link href="/schedule" aria-label="Open schedule">
          <Calendar size={22} />
        </Link>
        <details>
          <summary aria-label="Open menu">
            <Menu size={24} />
          </summary>
          <Navigation active={active} mentor={mentor} />
        </details>
        <Link href={mentor ? "/mentor/profile" : "/profile"} aria-label="Open profile">
          <Image src={avatar} alt={name} width={44} height={44} />
        </Link>
      </header>

      <header className={styles.topbarHeader}>
        <label className={styles.searchBox}>
          <Search size={18} />
          <input type="search" placeholder="Search courses" aria-label="Search courses" />
        </label>
        <Link className={styles.profileBtn} href={mentor ? "/mentor/profile" : "/profile"} aria-label="Open profile">
          <Image src={avatar} alt={name} width={46} height={46} priority />
        </Link>
      </header>

      <section className={styles.content}>{children}</section>
      {rightRail && <aside className={styles.rightRail}>{rightRail}</aside>}
    </div>
  );
}
