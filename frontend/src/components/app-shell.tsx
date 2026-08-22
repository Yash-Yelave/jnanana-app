"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import {
  LayoutDashboard,
  GraduationCap,
  Settings,
  HeartHandshake,
  Search,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Brand } from "@/components/brand";
import type { Profile } from "@/lib/types";
import { useApi } from "@/lib/use-api";
import { publicAsset } from "@/lib/supabase/client";
import { NotificationBell } from "@/components/notification-bell";
import styles from "./app-shell.module.css";

/* `short` is what the mobile bottom bar shows. Five labels have to share a
   320px row, so anything longer than one word wraps to two lines and leaves
   that one item taller than its neighbours. */
const studentNav = [
  { label: "Dashboard", short: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Wallet", short: "Wallet", href: "/jools/transactions", icon: Sparkles },
  { label: "My Requests", short: "Requests", href: "/requests", icon: HeartHandshake },
  { label: "Events", short: "Events", href: "/events", icon: Calendar },
  { label: "Settings", short: "Settings", href: "/settings", icon: Settings },
] as const;

const mentorNav = [
  { label: "Dashboard", short: "Home", href: "/mentor/dashboard", icon: LayoutDashboard },
  { label: "Wallet", short: "Wallet", href: "/jools/transactions", icon: Sparkles },
  { label: "Requests", short: "Requests", href: "/mentor/requests", icon: HeartHandshake },
  { label: "Events", short: "Events", href: "/events", icon: Calendar },
  { label: "Settings", short: "Settings", href: "/settings", icon: Settings },
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
      {links.map(({ label, short, href, icon: Icon }) => {
        const isActive = active === href;
        return (
          <Link
            key={href}
            href={href}
            className={`${styles.mobileNavItem} ${isActive ? styles.mobileActiveItem : ""}`}
            aria-label={label}
          >
            <Icon size={22} className={styles.mobileNavIcon} />
            <span className={styles.mobileNavLabel}>{short}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({
  active,
  rightRail,
  mentor,
  domain,
  onDomainChange,
  children,
}: {
  active?: string;
  rightRail?: ReactNode;
  mentor?: boolean;
  domain?: string;
  onDomainChange?: (val: string) => void;
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
  const joolsBalance = wallet?.balance ?? 0;

  const handleJoolsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/jools/transactions");
  };

  return (
    <div className={`${styles.shell} ${rightRail ? "" : styles.withoutRail}`}>
      {/* Sidebar for Desktop */}
      <aside className={styles.sidebar}>
        <Brand inverse href={brandHref} />
        <Navigation active={active ?? ""} mentor={!!isMentor} />
      </aside>

      {/* Top Header for Mobile */}
      <header className={styles.mobileHeader}>
        <Brand inverse href={brandHref} />
        <button type="button" onClick={handleJoolsClick} className={styles.joolsChip}>
          ⚡ {joolsBalance} Jools
        </button>
        <NotificationBell />
        <Link href={profileTarget} aria-label="Open profile">
          <Image src={avatar} alt={name} width={40} height={40} style={{ borderRadius: "50%", border: "1.5px solid #141210", objectFit: "cover", aspectRatio: "1 / 1", flexShrink: 0 }} />
        </Link>
      </header>

      {/* Topbar Header for Desktop */}
      <header className={styles.topbarHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <label className={styles.searchBox}>
            <Search size={18} />
            <input type="search" placeholder="Search mentors, events..." aria-label="Search mentors, events" />
          </label>

          {active === "/dashboard" && !isMentor && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#141210" }}>Domain:</span>
              <select
                value={domain ?? "All"}
                onChange={(e) => onDomainChange?.(e.target.value)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "0",
                  border: "1.5px solid #141210",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  background: "#F6EBDB",
                  color: "#141210",
                  cursor: "pointer",
                  outline: "none",
                  boxShadow: "2px 2px 0 #141210",
                }}
              >
                <option value="All">All Domains</option>
                <option value="Design">Design &amp; UI/UX</option>
                <option value="Engineering">Engineering &amp; Tech</option>
                <option value="Marketing">Marketing &amp; Growth</option>
                <option value="Product">Product Strategy</option>
              </select>
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button type="button" onClick={handleJoolsClick} className={styles.joolsChip}>
            ⚡ {joolsBalance} Jools
          </button>
          <NotificationBell />
          <Link className={styles.profileBtn} href={profileTarget} aria-label="Open profile">
            <Image src={avatar} alt={name} width={46} height={46} priority style={{ borderRadius: "50%", objectFit: "cover", aspectRatio: "1 / 1", flexShrink: 0 }} />
          </Link>
        </div>
      </header>

      <section className={styles.content}>{children}</section>
      {rightRail && <aside className={styles.rightRail}>{rightRail}</aside>}

      {/* Bottom Bar for Mobile */}
      <MobileBottomNav active={active ?? ""} mentor={!!isMentor} />
    </div>
  );
}
