import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Brand } from "@/components/brand";
import styles from "./app-shell.module.css";

const studentNav = [
  ["Home", "/dashboard/home", "home.png"],
  ["Dashboard", "/dashboard", "dashboard.png"],
  ["Mentorship", "/mentors", "mentorship.png"],
  ["Chat Room", "/chat", "chat.png"],
  ["Open Mic", "/community", "microphone.png"],
  ["Settings", "/settings", "settings.png"],
] as const;

const mentorNav = [
  ["Home", "/mentor/home", "home.png"],
  ["Dashboard", "/mentor/dashboard", "dashboard.png"],
  ["Bookings", "/mentor/bookings", "mentorship.png"],
  ["Lessons", "/mentor/lessons", "chat.png"],
  ["Community", "/community", "microphone.png"],
  ["Settings", "/settings", "settings.png"],
] as const;

function Navigation({ active, mentor = false }: { active: string; mentor?: boolean }) {
  const links = mentor ? mentorNav : studentNav;
  return <nav className={styles.nav} aria-label={`${mentor ? "Mentor" : "Student"} navigation`}>
    {links.map(([label, href, icon]) => <Link className={active === href ? styles.active : ""} href={href} key={href}>
      <Image src={`/assets/app/icons/${icon}`} alt="" width={40} height={40} /><span>{label}</span>
    </Link>)}
  </nav>;
}

export function AppShell({ children, active, rightRail, mentor = false }: { children: ReactNode; active: string; rightRail?: ReactNode; mentor?: boolean }) {
  return <div className={`${styles.shell} ${rightRail ? "" : styles.withoutRail}`}>
    <aside className={styles.sidebar}>
      <Brand inverse />
      <Navigation active={active} mentor={mentor} />
      <Link className={styles.subscription} href="/subscription"><span>↗</span><strong>Get the<br />Subscription</strong><i aria-hidden="true">≡</i></Link>
    </aside>
    <header className={styles.mobileHeader}>
      <Brand inverse />
      <Link href="/schedule" aria-label="Open schedule">▣</Link>
      <details><summary aria-label="Open menu">☰</summary><Navigation active={active} mentor={mentor} /></details>
      <Link href={mentor ? "/mentor/profile" : "/profile"} aria-label="Open profile"><Image src="/assets/app/avatar.png" alt="" width={44} height={44} /></Link>
    </header>
    <section className={styles.content}>
      <header className={styles.topbar}><label><span>⌕</span><input type="search" placeholder="Search courses" aria-label="Search courses" /></label><Link href={mentor ? "/mentor/profile" : "/profile"} aria-label="Open profile"><Image src="/assets/app/avatar.png" alt="" width={58} height={58} /></Link></header>
      {children}
    </section>
    {rightRail && <aside className={styles.rightRail}>{rightRail}</aside>}
  </div>;
}
