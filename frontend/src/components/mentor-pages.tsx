"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Clock,
  Calendar,
  UploadCloud,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Brand } from "@/components/brand";
import { PageTitle, ProfileView, StarRating } from "@/components/student-pages";
import { apiFetch, actionMentorshipRequest, type MentorshipRequestItem } from "@/lib/api";
import type { Booking, LessonRequest, Mentor } from "@/lib/types";
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

  const pending = requests?.filter((request) => request.status === "pending") ?? [];
  const accepted = requests?.filter((request) => request.status === "accepted") ?? [];

  return (
    <AppShell active="/mentor/home" mentor>
      <main className={styles.main}>
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
                <strong>{request.tokens_used} Jule</strong>
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
