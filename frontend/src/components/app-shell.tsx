"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Sparkles,
} from "lucide-react";
import { Brand } from "@/components/brand";
import type { Profile } from "@/lib/types";
import { useApi } from "@/lib/use-api";
import { publicAsset } from "@/lib/supabase/client";
import styles from "./app-shell.module.css";

const studentNav = [
  { label: "Home", href: "/dashboard/home", icon: Home },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Jools Wallet", href: "/jule/transactions", icon: Sparkles },
  { label: "Mentorship", href: "/mentors", icon: GraduationCap },
  { label: "Chat Room", href: "/chat", icon: MessageSquare },
  { label: "Open Mic", href: "/community", icon: Mic },
  { label: "Settings", href: "/settings", icon: Settings },
] as const;

const mentorNav = [
  { label: "Home", href: "/mentor/home", icon: Home },
  { label: "Dashboard", href: "/mentor/dashboard", icon: LayoutDashboard },
  { label: "Jools Wallet", href: "/jule/transactions", icon: Sparkles },
  { label: "Bookings", href: "/mentor/bookings", icon: GraduationCap },
  { label: "Lessons", href: "/mentor/lessons", icon: BookOpen },
  { label: "Chat Room", href: "/chat", icon: MessageSquare },
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
  const router = useRouter();
  const { data: profile } = useApi<Profile>("/me");
  const { data: wallet } = useApi<{ balance: number }>("/jule/wallet");
  const isMentor = mentor || profile?.role === "mentor";
  const avatar = publicAsset("avatars", profile?.avatar_path) ?? "/assets/app/mentor-1.png";
  const name = profile ? `${profile.first_name} ${profile.last_name}` : "Profile";
  const profileTarget = isMentor ? "/mentor/profile" : "/profile";
  const juleBalance = wallet?.balance ?? 50;

  const handleJuleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/jule/transactions");
  };

  return (
    <div className={`${styles.shell} ${rightRail ? "" : styles.withoutRail}`}>
      <aside className={styles.sidebar}>
        <Brand inverse />
        <Navigation active={active} mentor={isMentor} />
      </aside>

      <header className={styles.mobileHeader}>
        <Brand inverse />
        <button
          type="button"
          onClick={handleJuleClick}
          style={{
            padding: "4px 10px",
            borderRadius: "9999px",
            background: "linear-gradient(135deg, #FFB800 0%, #FF8A00 100%)",
            color: "#000",
            fontWeight: "700",
            fontSize: "0.75rem",
            border: "none",
            cursor: "pointer"
          }}
        >
          ⚡ {juleBalance} Jools
        </button>
        <details>
          <summary aria-label="Open menu">
            <Menu size={24} />
          </summary>
          <Navigation active={active} mentor={isMentor} />
        </details>
        <Link href={profileTarget} aria-label="Open profile">
          <Image src={avatar} alt={name} width={44} height={44} />
        </Link>
      </header>

      <header className={styles.topbarHeader}>
        <label className={styles.searchBox}>
          <Search size={18} />
          <input type="search" placeholder="Search mentors, events..." aria-label="Search mentors, events" />
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            type="button"
            onClick={handleJuleClick}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              borderRadius: "9999px",
              background: "linear-gradient(135deg, #FFB800 0%, #FF8A00 100%)",
              color: "#000",
              fontWeight: "700",
              fontSize: "0.875rem",
              border: "none",
              boxShadow: "0 2px 8px rgba(255, 184, 0, 0.3)",
              cursor: "pointer"
            }}
          >
            ⚡ {juleBalance} Jools Tokens
          </button>
          <Link className={styles.profileBtn} href={profileTarget} aria-label="Open profile">
            <Image src={avatar} alt={name} width={46} height={46} priority />
          </Link>
        </div>
      </header>

      <section className={styles.content}>{children}</section>
      {rightRail && <aside className={styles.rightRail}>{rightRail}</aside>}
    </div>
  );
}
