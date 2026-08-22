"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Clock,
  Calendar,
  UploadCloud,
  BookOpen,
  CheckCircle2,
  Check,
  Circle,
  X,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Brand } from "@/components/brand";
import { PageTitle, ProfileView, StarRating } from "@/components/student-pages";
import { apiFetch, actionMentorshipRequest, type MentorshipRequestItem } from "@/lib/api";
import type { Booking, LessonRequest, Mentor, Profile } from "@/lib/types";
import { useApi, clearApiCache } from "@/lib/use-api";
import styles from "./mentor-pages.module.css";

export function MentorMarketingPage() {
  return (
    <main className={styles.marketing}>
      <section className={styles.hero}>
        <header>
          <Brand />
          <nav>
            <a href="#categories">Category</a>
            <a href="#about">About Us</a>
            <a href="#business">Jnanana Foundation Business</a>
          </nav>
          <Link href="/login">
            Sign Up <ArrowRight size={16} />
          </Link>
        </header>
        <span>WELCOME TO JNANANA FOUNDATION</span>
        <h1>
          Meet the Professional
          <br />
          Mentor
        </h1>
        {/* Design system §0.2: no invented statistics. The mentor count that sat
            here was fabricated; omit the claim rather than soften it. */}
        <div className={styles.quote}>
          <b>“</b>
          <p>Now you can teach anywhere, anytime, and build an independent career.</p>
        </div>
        <Image src="/assets/app/mentor-marketing-hero.png" alt="Professional mentor" width={500} height={560} priority />
        <div className={styles.rating}>
          <StarRating rating={5} />
          <p>“Personalized tutoring on this platform transformed my teaching experience.”</p>
        </div>
        <div className={styles.heroActions}>
          <Link className="button button-primary" href="/onboarding/mentor">
            Request Demo <ArrowUpRight size={16} />
          </Link>
          <Link className="button button-secondary" href="/onboarding/mentor">
            I’m Mentor
          </Link>
        </div>
      </section>

      <section className={styles.mentorAbout} id="about">
        <span>WHY JNANANA FOUNDATION</span>
        <h2>Turn your experience into impact</h2>
        <div>
          <article>
            <b>01</b>
            <h3>Accept a lesson</h3>
            <p>Choose requests that match your skills and schedule.</p>
          </article>
          <article>
            <b>02</b>
            <h3>Connect with learners</h3>
            <p>Conduct practical, personalized live sessions.</p>
          </article>
          <article>
            <b>03</b>
            <h3>Earn rewards</h3>
            <p>Grow your reputation and professional network.</p>
          </article>
        </div>
      </section>

      <section className={styles.mentorCta}>
        <h2>Start mentoring on your terms.</h2>
        <Link className="button button-primary" href="/onboarding/mentor">
          Become a mentor <ArrowRight size={18} />
        </Link>
      </section>
    </main>
  );
}

export function MentorHomePage() {
  const { data: requests, error } = useApi<MentorshipRequestItem[]>("/mentorship-requests/my");
  const { data: mentorData } = useApi<{ items: Mentor[] }>("/mentors?limit=4");
  const { data: profile } = useApi<Profile>("/me");
  const { data: settings, reload: reloadSettings } = useApi<{ tour_completed: boolean }>("/me/settings");
  const [dismissed, setDismissed] = useState(false);

  const hasBio = Boolean(profile?.bio && profile.bio.trim().length > 0);
  const hasHeadline = Boolean(profile?.mentor?.headline && profile.mentor.headline.trim().length > 0);
  const hasProfessions = Boolean(profile?.mentor?.professions && profile.mentor.professions.length > 0);
  const profileStepCompleted = hasBio && hasHeadline && hasProfessions;

  const inboxStepCompleted = Boolean(requests !== undefined);
  const dashboardStepCompleted = true;

  const completedCount = (profileStepCompleted ? 1 : 0) + (inboxStepCompleted ? 1 : 0) + (dashboardStepCompleted ? 1 : 0);
  const showTour = settings && !settings.tour_completed && !dismissed && completedCount < 3;

  useEffect(() => {
    if (completedCount === 3 && settings && !settings.tour_completed) {
      void apiFetch("/me/settings", {
        method: "PUT",
        body: JSON.stringify({
          ...settings,
          tour_completed: true,
        }),
      })
        .then(() => {
          clearApiCache("/me/settings");
          if (reloadSettings) reloadSettings();
        })
        .catch(() => {});
    }
  }, [completedCount, settings, reloadSettings]);

  const handleDismissTour = async () => {
    setDismissed(true);
    try {
      await apiFetch("/me/settings", {
        method: "PUT",
        body: JSON.stringify({
          ...settings,
          tour_completed: true,
        }),
      });
      clearApiCache("/me/settings");
      if (reloadSettings) reloadSettings();
    } catch {
      // ignore
    }
  };

  const pending = requests?.filter((request) => request.status === "pending") ?? [];
  const accepted = requests?.filter((request) => request.status === "accepted") ?? [];

  return (
    <AppShell active="/mentor/home" mentor>
      <main className={styles.main}>
        {showTour && (
          <div
            style={{
              background: "#F6EBDB",
              border: "1.5px solid #141210",
              boxShadow: "4px 4px 0 #141210",
              padding: "24px",
              marginBottom: "28px",
              color: "#141210",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <span
                  style={{
                    background: "#0B6B44",
                    color: "#FFFFFF",
                    fontSize: "0.75rem",
                    fontWeight: 800,
                    padding: "3px 8px",
                    border: "1.5px solid #141210",
                    boxShadow: "2px 2px 0 #141210",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    display: "inline-block",
                    marginBottom: "8px",
                  }}
                >
                  🚀 Mentor Guide
                </span>
                <h2 style={{ fontSize: "1.3rem", fontWeight: 800, margin: "0 0 4px" }}>
                  Welcome, {profile?.first_name || "Mentor"}!
                </h2>
                <p style={{ fontSize: "0.9rem", color: "#6A675F", margin: 0 }}>
                  Complete these tasks to optimize your profile and manage student connections.
                </p>
              </div>
              <button
                onClick={handleDismissTour}
                aria-label="Dismiss tour guide"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  color: "#6A675F",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Checklist Items */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", margin: "20px 0" }}>
              {/* Step 1 */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      border: "1.5px solid #141210",
                      background: profileStepCompleted ? "#0B6B44" : "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: profileStepCompleted ? "#FFFFFF" : "#141210",
                    }}
                  >
                    {profileStepCompleted ? <Check size={14} strokeWidth={3} /> : <Circle size={8} fill="#141210" />}
                  </div>
                  <div>
                    <strong style={{ fontSize: "0.95rem", textDecoration: profileStepCompleted ? "line-through" : "none" }}>
                      Complete your mentor profile details
                    </strong>
                    <span style={{ display: "block", fontSize: "0.825rem", color: "#6A675F" }}>
                      Provide a bio, a headline, and select your professions.
                    </span>
                  </div>
                </div>
                {!profileStepCompleted && (
                  <Link
                    href="/mentor/profile"
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      color: "#141210",
                      textDecoration: "underline",
                    }}
                  >
                    Update Profile →
                  </Link>
                )}
              </div>

              {/* Step 2 */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      border: "1.5px solid #141210",
                      background: inboxStepCompleted ? "#0B6B44" : "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: inboxStepCompleted ? "#FFFFFF" : "#141210",
                    }}
                  >
                    {inboxStepCompleted ? <Check size={14} strokeWidth={3} /> : <Circle size={8} fill="#141210" />}
                  </div>
                  <div>
                    <strong style={{ fontSize: "0.95rem", textDecoration: inboxStepCompleted ? "line-through" : "none" }}>
                      Check your incoming requests inbox
                    </strong>
                    <span style={{ display: "block", fontSize: "0.825rem", color: "#6A675F" }}>
                      Review student requests who spend their Jools to reach you.
                    </span>
                  </div>
                </div>
                <Link
                  href="/mentor/requests"
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "#141210",
                    textDecoration: "underline",
                  }}
                >
                  View Inbox →
                </Link>
              </div>

              {/* Step 3 */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      border: "1.5px solid #141210",
                      background: dashboardStepCompleted ? "#0B6B44" : "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: dashboardStepCompleted ? "#FFFFFF" : "#141210",
                    }}
                  >
                    <Check size={14} strokeWidth={3} />
                  </div>
                  <div>
                    <strong style={{ fontSize: "0.95rem", textDecoration: "line-through" }}>
                      Track reviews & metrics on your dashboard
                    </strong>
                    <span style={{ display: "block", fontSize: "0.825rem", color: "#6A675F" }}>
                      Monitor your ratings, earnings, and completed session hours.
                    </span>
                  </div>
                </div>
                <Link
                  href="/mentor/dashboard"
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "#141210",
                    textDecoration: "underline",
                  }}
                >
                  View Dashboard →
                </Link>
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "20px", paddingTop: "16px", borderTop: "1px dashed rgba(20,18,16,0.15)" }}>
              <div style={{ flex: 1, height: "10px", background: "#FFFFFF", border: "1px solid #141210", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${(completedCount / 3) * 100}%`,
                    background: completedCount === 3 ? "#0B6B44" : "#F5B921",
                    transition: "width 0.4s ease-in-out",
                  }}
                />
              </div>
              <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#141210" }}>
                {completedCount}/3 Steps Completed
              </span>
            </div>
          </div>
        )}

        <section className={styles.homeGrid}>
          <article className={styles.panel}>
            <h2>Mentorship Requests</h2>
            {error && <p className="data-state" role="alert">{error}</p>}
            {requests && pending.length === 0 && <p className="data-state">No pending mentorship requests.</p>}
            {pending.slice(0, 6).map((request) => (
              <Link href="/mentor/requests" key={request.id}>
                <span className={styles.timeDot}><Clock size={16} /></span>
                <b>
                  {request.mentee_name ?? "A mentee"}
                  <small>{new Date(request.created_at).toLocaleString()}</small>
                </b>
                <strong>{request.tokens_used} Jools</strong>
              </Link>
            ))}
          </article>
          <aside className={styles.panel}>
            <h2>Accepted</h2>
            {accepted.slice(0, 3).map((request) => (
              <article key={request.id}>
                <b>{request.mentee_name ?? "A mentee"}</b>
                <small>{new Date(request.updated_at).toLocaleString()}</small>
              </article>
            ))}
            {requests && accepted.length === 0 && (
              <p className="data-state">Nothing accepted yet. The Jnanana team coordinates each connection.</p>
            )}
          </aside>
        </section>

        <section className={styles.panel}>
          <h2>Top Mentors</h2>
          <div className={styles.people}>
            {mentorData?.items.map((mentor, index) => (
              <span key={mentor.id}>
                <Image src={`/assets/app/mentor-${(index % 4) + 1}.png`} alt={`${mentor.first_name} ${mentor.last_name}`} width={55} height={55} />
                <b>
                  {mentor.first_name} {mentor.last_name}<small>{mentor.headline ?? "Verified mentor"}</small>
                </b>
              </span>
            ))}
          </div>
        </section>
      </main>
    </AppShell>
  );
}

export function MentorProfilePage() {
  return <ProfileView mentorApp />;
}

export function MentorDashboardPage() {
  const { data: requests } = useApi<MentorshipRequestItem[]>("/mentorship-requests/my");

  const count = (status: string) => requests?.filter((request) => request.status === status).length ?? 0;
  const pending = count("pending");

  return (
    <AppShell active="/mentor/dashboard" mentor>
      <main className={styles.main}>
        <PageTitle>Dashboard</PageTitle>
        <section className={styles.summary}>
          <div>
            <Clock size={24} color="var(--lime)" /> {pending}<small>Pending requests</small>
          </div>
          <div>
            <CheckCircle2 size={24} color="var(--lime)" /> {count("accepted")}<small>Accepted</small>
          </div>
          <div>
            <BookOpen size={24} color="var(--lime)" /> {count("completed")}<small>Completed</small>
          </div>
        </section>
        <section className={styles.dashboard}>
          <article className={styles.panel}>
            <h2>Mentorship Requests</h2>
            {pending > 0 ? (
              <>
                <p>
                  {pending} {pending === 1 ? "mentee is" : "mentees are"} waiting on your response.
                </p>
                <Link className="button button-primary" href="/mentor/requests">
                  Review requests <ArrowUpRight size={16} />
                </Link>
              </>
            ) : (
              <p className="data-state">No pending requests right now.</p>
            )}
          </article>
          <aside className={styles.panel}>
            <h2>Your profile</h2>
            <p>Keep your expertise and mentorship areas current so mentees can find you.</p>
            <Link className="button button-primary" href="/mentor/profile">
              Edit profile <ArrowUpRight size={16} />
            </Link>
          </aside>
        </section>
      </main>
    </AppShell>
  );
}
