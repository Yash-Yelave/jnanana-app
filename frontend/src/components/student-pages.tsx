"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star,
  CheckCircle2,
  GraduationCap,
  Crown,
  ArrowLeft,
  ArrowUpRight,
  ChevronRight,
  Clock,
  BookOpen,
  Sun,
  Moon,
  Monitor,
  Banknote,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { apiFetch } from "@/lib/api";
import { createClient, publicAsset } from "@/lib/supabase/client";
import type { Booking, Mentor, MentorProfile, Profile, Review } from "@/lib/types";
import { useApi } from "@/lib/use-api";
import styles from "./student-pages.module.css";

export function StarRating({ rating = 5 }: { rating?: number }) {
  return (
    <span className={styles.starRating} aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={16} className={i < rating ? styles.starFilled : styles.starEmpty} fill={i < rating ? "#ffc107" : "none"} />
      ))}
    </span>
  );
}

export function PageTitle({ children, backHref }: { children: React.ReactNode; backHref?: string }) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
      return;
    }
    if (typeof window !== "undefined" && window.history.length > 1) {
      const currentPath = window.location.pathname;
      router.back();
      setTimeout(() => {
        if (window.location.pathname === currentPath) {
          router.push("/dashboard/home");
        }
      }, 150);
    } else {
      router.push("/dashboard/home");
    }
  };

  return (
    <h1 className={styles.pageTitle}>
      <button
        type="button"
        className={styles.backBtn}
        onClick={handleBack}
        aria-label="Go back to previous page"
      >
        <ArrowLeft size={20} />
      </button>
      {children}
    </h1>
  );
}

export function MentorDirectory() {
  const { data, error, loading } = useApi<{ items: Mentor[] }>("/mentors");
  const mentors = (data?.items ?? []).map((mentor, index) => [
    `${mentor.first_name} ${mentor.last_name}`,
    `mentor-${(index % 4) + 1}.png`,
    mentor.companies.join(" · ") || mentor.headline || "Independent mentor",
    (mentor.hourly_rate_minor / 100).toLocaleString(),
    mentor.id,
  ] as const);
  const filters = (
    <div className={styles.filters}>
      <h2>Category</h2>
      <p>
        <button type="button">Coding</button>
        <button type="button">Marketing</button>
        <button type="button">Music</button>
        <button type="button">Painting</button>
      </p>
      <h2>Sort by</h2>
      <p>
        <button type="button">Relevance</button>
        <button type="button">Price</button>
        <button type="button">Review</button>
      </p>
      <h2>Tutor speaks</h2>
      <p>
        <button type="button">English</button>
        <button type="button">Hindi</button>
        <button type="button">Telugu</button>
      </p>
      <h2>Price</h2>
      <input type="range" aria-label="Maximum price" min="100" max="10000" />
      <h2>Reviews</h2>
      {["1 star & above", "2 star & above", "3 star & above", "4 star & above"].map((x) => (
        <label key={x}>
          <input type="radio" name="review" /> {x}
        </label>
      ))}
    </div>
  );

  return (
    <AppShell active="/mentors" rightRail={filters}>
      <main className={styles.main}>
        <PageTitle>Mentorship</PageTitle>
        <input className={styles.fullSearch} type="search" placeholder="Search mentors or topics" aria-label="Search mentors" />
        <div className={styles.mentorList}>
          {loading && <p className="data-state">Loading mentors…</p>}
          {error && <p className="data-state" role="alert">{error}</p>}
          {!loading && !error && mentors.length === 0 && <p className="data-state">No approved mentors are available yet.</p>}
          {mentors.map(([name, image, companies, price, id]) => (
            <article className={styles.mentorCard} key={id}>
              <div className={styles.mentorBio}>
                <Image src={`/assets/app/${image}`} alt="" width={76} height={76} />
                <div>
                  <h2>
                    {name} <StarRating rating={5} />
                  </h2>
                  <strong className={styles.verifiedTag}>
                    <GraduationCap size={15} /> Professional <CheckCircle2 size={15} /> Verified
                  </strong>
                </div>
              </div>
              <dl>
                <dt>Language:</dt>
                <dd>
                  <i>English</i> <i>Telugu</i>
                </dd>
                <dt>Profession</dt>
                <dd>
                  <i>SDE 3</i> <i>.net Developer</i> <i>Full Stack</i>
                </dd>
                <dt>Experience</dt>
                <dd>
                  <i>{companies}</i>
                </dd>
              </dl>
              <p>I have a Master degree in Art Education. Book a fully prepared lesson from someone with years of practical teaching experience.</p>
              <Link href={`/mentors/${id}`}>
                Show details <ArrowUpRight size={14} />
              </Link>
              <aside>
                <b>Instant lessons</b>
                <b>Mentorship</b>
                <b>Tutorials</b>
                <span>
                  Starting from<strong>₹{price}</strong>per lesson
                </span>
                <Link className={styles.button} href={`/lessons/book?mentor=${id}`}>
                  Book a lesson <ArrowUpRight size={16} />
                </Link>
              </aside>
            </article>
          ))}
        </div>
      </main>
    </AppShell>
  );
}

const tabs = [
  ["About", "/profile"],
  ["Lessons", "/profile/lessons"],
  ["Feedback", "/profile/feedback"],
  ["Schedule", "/schedule"],
  ["Community", "/community"],
] as const;

export function ProfileView({ mode = "about", mentorDetail = false, mentorApp = false, mentorId }: { mode?: "about" | "lessons" | "feedback"; mentorDetail?: boolean; mentorApp?: boolean; mentorId?: string }) {
  const active = mentorDetail ? "/mentors" : mentorApp ? "/mentor/home" : "/dashboard/home";
  const { data, error, loading } = useApi<Profile | Mentor>(mentorDetail && mentorId ? `/mentors/${mentorId}` : "/me");
  const name = data ? `${data.first_name} ${data.last_name}` : "Profile";
  const avatar = publicAsset("avatars", data?.avatar_path) ?? "/assets/app/mentor-1.png";
  const mentor = data && "headline" in data ? data : data?.mentor;
  return (
    <AppShell active={active} mentor={mentorApp}>
      <main className={styles.main}>
        <div className={styles.titleRow}>
          <PageTitle>{mentorDetail ? "Mentorship" : "Profile"}</PageTitle>
          {!mentorDetail && (
            <Link className={styles.primary} href="/profile/edit">
              Edit Profile
            </Link>
          )}
        </div>
        {loading && <p className="data-state">Loading profile…</p>}
        {error && <p className="data-state" role="alert">{error}</p>}
        <section className={styles.profileHero}>
          <Image src="/assets/app/profile-hero.png" alt="Kristin Watson at her desk" fill priority sizes="(max-width: 767px) 100vw, 75vw" />
        </section>
        <section className={styles.profileName}>
          <Image src={avatar} alt={name} width={112} height={112} />
          <div>
            <h2>
              {name} <CheckCircle2 size={20} className={styles.checkIcon} />
            </h2>
            <p>
              <Crown size={16} /> <b>{mentor ? "Verified mentor" : "Learner"}</b> {mentor?.headline}
            </p>
          </div>
          {mentorDetail && <Link className={styles.button} href="/chat">Message</Link>}
        </section>
        <nav className={styles.tabs}>
          {tabs.map(([label, href]) => (
            <Link
              className={mode === label.toLowerCase() ? styles.current : ""}
              href={mentorApp ? "/mentor/lessons" : mentorDetail ? (label === "About" ? "/mentors/kristin-watson" : href) : href}
              key={label}
            >
              {label}
            </Link>
          ))}
        </nav>
        {mode === "about" ? <About profile={data} mentor={mentor} /> : mode === "lessons" ? <Lessons mentorId={mentorId} /> : <Feedback mentorId={mentorId} />}
      </main>
    </AppShell>
  );
}

function About({ profile, mentor }: { profile?: Profile | Mentor; mentor?: MentorProfile | Mentor | null }) {
  return (
    <section className={styles.profileGrid}>
      <article className={styles.whitePanel}>
        <dl className={styles.about}>
          <dt>Location & Local Time</dt>
          <dd>
            <i>{profile && "location" in profile ? profile.location ?? "Not provided" : "Available online"}</i>
          </dd>
          <dt>Experience</dt>
          <dd>Not provided</dd>
          <dt>Skills</dt>
          <dd>
            {(mentor?.professions ?? (profile && "skills" in profile ? profile.skills.map((skill) => skill.name) : [])).map((skill) => <i key={skill}>{skill}</i>)}
          </dd>
          <dt>About</dt>
          <dd>{mentor?.bio ?? (profile && "bio" in profile ? profile.bio : null) ?? "No biography has been added yet."}</dd>
          <dt>Speaks</dt>
          <dd>
            {(mentor?.languages ?? []).map((language) => <i key={language}>{language}</i>)}
          </dd>
          <dt>Educational Institutes</dt>
          <dd>Not provided</dd>
          <dt>My teaching materials</dt>
          <dd>Not provided</dd>
        </dl>
      </article>
      <aside className={styles.whitePanel}>
        <h3>Very reliable</h3>
        <b>Verified platform profile</b>
        <hr />
        <p>
          Completed lectures <strong>—</strong>
        </p>
        <p>
          Tutoring Since <strong>Not available</strong>
        </p>
        <p>
          On Upskillink since <strong>Not available</strong>
        </p>
      </aside>
    </section>
  );
}

function Lessons({ mentorId }: { mentorId?: string }) {
  const { data, error, loading, reload } = useApi<{ items: Booking[] }>("/bookings");
  const bookings = (data?.items ?? []).filter((booking) => !mentorId || booking.mentor_id === mentorId);
  async function review(booking: Booking) {
    const rating = Number(window.prompt("Rating from 1 to 5"));
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return;
    const comment = window.prompt("Feedback (optional)");
    try {
      await apiFetch(`/bookings/${booking.id}/reviews`, { method: "POST", body: JSON.stringify({ rating, comment }) });
      await reload();
    } catch (reason) {
      window.alert(reason instanceof Error ? reason.message : "Unable to save review");
    }
  }
  return (
    <section className={styles.profileGrid}>
      <article className={styles.whitePanel}>
        {loading && <p className="data-state">Loading lessons…</p>}
        {error && <p className="data-state" role="alert">{error}</p>}
        {!loading && !error && bookings.length === 0 && <p className="data-state">No lessons yet.</p>}
        {bookings.map((booking) => <div className={styles.review} key={booking.id}><Clock size={20} /><p><b>Mentoring session</b><br />{new Date(booking.starts_at).toLocaleString()} · {booking.status.replaceAll("_", " ")}</p>{booking.status === "completed" && !mentorId && <button type="button" onClick={() => void review(booking)}>Leave review</button>}</div>)}
      </article>
      <aside className={styles.whitePanel}>
        <h2>Start learning now</h2>
        <p>Choose an approved mentor and request a time that works for you.</p>
        <Link className={styles.primary} href="/lessons/book">
          Book a lesson <ArrowUpRight size={16} />
        </Link>
      </aside>
    </section>
  );
}

function Feedback({ mentorId }: { mentorId?: string }) {
  const { data, error, loading } = useApi<{ items: Review[] }>(mentorId ? `/mentors/${mentorId}/reviews` : "/reviews");
  const reviews = data?.items ?? [];
  const average = reviews.length ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length : 0;
  return (
    <section className={styles.profileGrid}>
      <article className={styles.whitePanel}>
        {loading && <p className="data-state">Loading reviews…</p>}
        {error && <p className="data-state" role="alert">{error}</p>}
        {!loading && !error && reviews.length === 0 && <p className="data-state">No reviews yet.</p>}
        {reviews.map((review, i) => (
          <div className={styles.review} key={review.id}>
            <Image src={`/assets/app/mentor-${(i % 4) + 1}.png`} alt="" width={52} height={52} />
            <p>
              <b>Learner review</b>
              <StarRating rating={review.rating} />
              <br />
              {review.comment ?? "No written feedback."}
            </p>
          </div>
        ))}
      </article>
      <aside className={styles.whitePanel}>
        <h2>
          {reviews.length} Reviews <b>{average.toFixed(1)}</b>
        </h2>
        <p className={styles.stars}><StarRating rating={5} /></p>
        <p>5 Stars ━━━━</p>
        <p>4 Stars ━━━━</p>
        <p>3 Stars ━━━━</p>
      </aside>
    </section>
  );
}

export function DashboardPage() {
  const { data: dashboard } = useApi<{ completed_bookings: number; active_courses: number }>("/dashboard/student");
  const { data: wallet } = useApi<{ currency: string; balance_minor: number }>("/wallet");
  return (
    <AppShell active="/dashboard">
      <main className={styles.main}>
        <PageTitle>Statistics</PageTitle>
        <section className={styles.stats}>
          <div>
            <Banknote size={24} color="var(--lime)" /> <b>{wallet?.currency ?? "INR"} {((wallet?.balance_minor ?? 0) / 100).toLocaleString()}</b>
            <span>Wallet balance</span>
          </div>
          <div>
            <Clock size={24} color="var(--lime)" /> <b>{dashboard?.active_courses ?? 0}</b>
            <span>Active courses</span>
          </div>
          <div>
            <BookOpen size={24} color="var(--lime)" /> <b>{dashboard?.completed_bookings ?? 0}</b>
            <span>Completed lessons</span>
          </div>
        </section>
        <section className={styles.dashboardGrid}>
          <article className={styles.whitePanel}>
            <h2>Hours Spent</h2>
            <p className="data-state">Detailed activity analytics appear as lessons are completed.</p>
          </article>
          <aside className={styles.credit}>
            <h2>Available Credit</h2>
            <strong>{wallet?.currency ?? "INR"} {((wallet?.balance_minor ?? 0) / 100).toLocaleString()}</strong>
            <p>Your current balance</p>
            <Link href="/payment">
              Add Credits <ArrowUpRight size={16} />
            </Link>
          </aside>
          <article className={styles.whitePanel}>
            <h2>Leader Board</h2>
            <p className="data-state">Leaderboard data is not available yet.</p>
          </article>
          <aside className={styles.score}>
            <h2>Credit score</h2>
            <strong>0</strong>
            <p>Reputation points</p>
          </aside>
        </section>
      </main>
    </AppShell>
  );
}

export function SettingsPage() {
  const router = useRouter();
  type Settings = { notify_activity: boolean; weekly_digest: boolean; notify_collaborations: boolean; theme: "light" | "dark" | "system" };
  const { data: settings, error, reload } = useApi<Settings>("/me/settings");
  const { data: profile } = useApi<Profile>("/me");

  async function save(values: Partial<Settings>) {
    const current = settings ?? { notify_activity: true, weekly_digest: true, notify_collaborations: true, theme: "system" as const };
    await apiFetch("/me/settings", { method: "PUT", body: JSON.stringify({ ...current, ...values }) });
    await reload();
  }

  async function logout() {
    await createClient().auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <AppShell active="/settings" mentor={profile?.role === "mentor"}>
      <main className={styles.main}>
        <PageTitle>Setting</PageTitle>
        {error && <p className="data-state" role="alert">{error}</p>}
        <section className={styles.settings}>
          {[
            ["Notify on updates and activity", "you’ll be notified when anyone accepts your request", "notify_activity"],
            ["Send weekly digest", "a weekly update on changes and more", "weekly_digest"],
            ["Collaborations", "Receive notifications about what’s happening", "notify_collaborations"],
          ].map(([title, copy, key]) => (
            <label key={title}>
              <span>
                <b>{title}</b>
                <small>{copy}</small>
              </span>
              <input type="checkbox" checked={settings?.[key as keyof Pick<Settings, "notify_activity" | "weekly_digest" | "notify_collaborations">] ?? true} onChange={(event) => void save({ [key]: event.target.checked })} />
            </label>
          ))}
          <Link href="/referrals">
            <b>Referral</b>
            <small>Refer and Earn</small>
            <ChevronRight size={18} />
          </Link>
          <Link href="/payment">
            <b>Payment</b>
            <small>Check your payment history and settings</small>
            <ChevronRight size={18} />
          </Link>
          <details>
            <summary>
              <b>Logout</b>
              <small>See you Soon!</small>
              <ChevronRight size={18} />
            </summary>
            <div className={styles.logout}>
              <h2>Are you sure you want to log out?</h2>
              <button className={styles.button} type="button" onClick={logout}>Log out</button>
            </div>
          </details>
        </section>
        <section className={styles.settings}>
          <h2>Theme</h2>
          <p>Colour Mode</p>
          <div className={styles.theme}>
            <button type="button" onClick={() => void save({ theme: "light" })} aria-pressed={settings?.theme === "light"}>
              <Sun size={16} /> Light mode
            </button>
            <button type="button" onClick={() => void save({ theme: "dark" })} aria-pressed={settings?.theme === "dark"}>
              <Moon size={16} /> Dark mode
            </button>
            <button type="button" onClick={() => void save({ theme: "system" })} aria-pressed={settings?.theme === "system"}>
              <Monitor size={16} /> System
            </button>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
