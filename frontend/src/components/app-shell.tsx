"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import {
  LayoutDashboard,
  GraduationCap,
  Settings,
  BookOpen,
  Search,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Brand } from "@/components/brand";
import type { Profile } from "@/lib/types";
import { useApi } from "@/lib/use-api";
import { publicAsset } from "@/lib/supabase/client";
import styles from "./app-shell.module.css";

const studentNav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Wallet", href: "/jule/transactions", icon: Sparkles },
  { label: "Events", href: "/events", icon: Calendar },
  { label: "Settings", href: "/settings", icon: Settings },
] as const;

const mentorNav = [
  { label: "Dashboard", href: "/mentor/dashboard", icon: LayoutDashboard },
  { label: "Wallet", href: "/jule/transactions", icon: Sparkles },
  { label: "Bookings", href: "/mentor/bookings", icon: GraduationCap },
  { label: "Lessons", href: "/mentor/lessons", icon: BookOpen },
  { label: "Events", href: "/events", icon: Calendar },
  { label: "Settings", href: "/settings", icon: Settings },
] as const;

function Navigation({ active, mentor = false }: { active: string; mentor?: boolean }) {
  const links = mentor ? mentorNav : studentNav;
  const mainLinks = links.filter((item) => item.href !== "/settings");
  const settingsItem = links.find((item) => item.href === "/settings");

  return (
    <nav className={styles.nav} aria-label={`${mentor ? "Mentor" : "Student"} navigation`}>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {mainLinks.map(({ label, href, icon: Icon }) => (
          <Link className={active === href ? styles.active : ""} href={href} key={href}>
            <Icon className={styles.navIcon} size={22} />
            <span>{label}</span>
          </Link>
        ))}
      </div>

      {settingsItem && (
        <div style={{ marginTop: "auto", paddingTop: "24px" }}>
          <Link className={active === settingsItem.href ? styles.active : ""} href={settingsItem.href}>
            <settingsItem.icon className={styles.navIcon} size={22} />
            <span>{settingsItem.label}</span>
          </Link>
        </div>
      )}
    </nav>
  );
}

function MobileBottomNav({ active, mentor = false }: { active: string; mentor?: boolean }) {
  const links = mentor ? mentorNav : studentNav;

  return (
    <nav className={styles.mobileBottomNav} aria-label="Mobile bottom navigation">
      {links.map(({ label, href, icon: Icon }) => {
        const isActive = active === href;
        return (
          <Link
            key={href}
            href={href}
            className={`${styles.mobileNavItem} ${isActive ? styles.mobileActiveItem : ""}`}
            aria-label={label}
          >
            <Icon size={22} className={styles.mobileNavIcon} />
            <span className={styles.mobileNavLabel}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({
  active,
  rightRail,
  mentor = false,
  children,
}: {
  active: string;
  rightRail?: ReactNode;
  mentor?: boolean;
  children: ReactNode;
}) {
  const router = useRouter();
  const { data: profile } = useApi<Profile>("/me");
  const { data: wallet } = useApi<{ balance: number }>("/jule/wallet");

  const isMentor = profile?.role === "mentor" || mentor;
  const avatar = publicAsset("avatars", profile?.avatar_path) ?? "/assets/app/mentor-1.png";
  const name = profile ? `${profile.first_name} ${profile.last_name}` : "Profile";
  const profileTarget = isMentor ? "/mentor/profile" : "/profile";
  const brandHref = isMentor ? "/mentor/dashboard" : "/dashboard";
  const juleBalance = wallet?.balance ?? 0;

  const handleJuleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/jule/transactions");
  };

  return (
    <div className={`${styles.shell} ${rightRail ? "" : styles.withoutRail}`}>
      {/* Sidebar for Desktop */}
      <aside className={styles.sidebar}>
        <Brand inverse href={brandHref} />
        <Navigation active={active} mentor={isMentor} />
      </aside>

      {/* Top Header for Mobile */}
      <header className={styles.mobileHeader}>
        <Brand inverse href={brandHref} />
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
            cursor: "pointer",
          }}
        >
          ⚡ {juleBalance} Jools
        </button>
        <Link href={profileTarget} aria-label="Open profile">
          <Image src={avatar} alt={name} width={40} height={40} style={{ borderRadius: "50%", border: "1.5px solid #FFB800" }} />
        </Link>
      </header>

      {/* Bottom Bar for Mobile */}
      <MobileBottomNav active={active} mentor={isMentor} />

      {/* Topbar Header for Desktop */}
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
              cursor: "pointer",
            }}
          >
            ⚡ {juleBalance} Jools
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
