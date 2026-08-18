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
  Banknote,
  BookOpen,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Brand } from "@/components/brand";
import { PageTitle, ProfileView, StarRating } from "@/components/student-pages";
import { apiFetch } from "@/lib/api";
import type { Booking, LessonRequest, Mentor } from "@/lib/types";
import { useApi } from "@/lib/use-api";
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
            <a href="#business">Upskillink Business</a>
          </nav>
          <Link href="/login">
            Sign Up <ArrowRight size={16} />
          </Link>
        </header>
        <span>WELCOME TO UPSKILLINK</span>
        <h1>
          Meet the Professional
          <br />
          Mentor
        </h1>
        <div className={styles.quote}>
          <b>“</b>
          <p>Now you can teach anywhere, anytime, and build an independent career.</p>
          <strong>
            10K+<small>Mentors</small>
          </strong>
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
        <span>WHY UPSKILLINK</span>
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
  const { data: requestData, error } = useApi<{ items: LessonRequest[] }>("/lesson-requests");
  const { data: mentorData } = useApi<{ items: Mentor[] }>("/mentors?limit=4");
  const { data: bookingData } = useApi<{ items: Booking[] }>("/bookings");
  return (
    <AppShell active="/mentor/home" mentor>
      <main className={styles.main}>
        <section className={styles.pro}>
          <div>
            <h1>Become a Pro Member</h1>
            <p>Unlimited access to 2000+ mentors, courses, community and daily free lessons.</p>
            <Link className="button button-primary" href="/subscription">
              Register Now <ArrowUpRight size={16} />
            </Link>
          </div>
          <Image src="/assets/onboarding/waiting.png" alt="" width={250} height={180} />
        </section>

        <section className={styles.homeGrid}>
          <article className={styles.panel}>
            <h2>Lesson Requests</h2>
            {error && <p className="data-state" role="alert">{error}</p>}
            {requestData?.items.length === 0 && <p className="data-state">No open lesson requests.</p>}
            {requestData?.items.slice(0, 6).map((request) => (
              <Link href="/mentor/bookings" key={request.id}>
                <span className={styles.timeDot}><Clock size={16} /></span>
                <b>
                  {request.title}
                  <small>{new Date(request.requested_start).toLocaleString()}</small>
                </b>
                <strong>{request.currency} {(request.proposed_amount_minor / 100).toLocaleString()}</strong>
              </Link>
            ))}
          </article>
          <aside className={styles.panel}>
            <h2>Schedule</h2>
            {bookingData?.items.slice(0, 3).map((booking) => <article key={booking.id}><b>Mentoring session</b><small>{new Date(booking.starts_at).toLocaleString()}</small>{booking.status === "confirmed" && <Link href="/meeting">View</Link>}</article>)}
            {bookingData?.items.length === 0 && <p className="data-state">No scheduled lessons.</p>}
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

export function MentorBookingsPage() {
  const [bid, setBid] = useState(false);
  const [error, setError] = useState("");
  const { data, reload } = useApi<{ items: LessonRequest[] }>("/lesson-requests");
  const request = data?.items[0];

  async function makeOffer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!request) return;
    const form = new FormData(event.currentTarget);
    try {
      await apiFetch(`/lesson-requests/${request.id}/offers`, { method: "POST", body: JSON.stringify({ amount_minor: Number(form.get("amount")) * 100, currency: request.currency, note: form.get("note") }) });
      setBid(false);
      await reload();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to create offer");
    }
  }
  return (
    <AppShell active="/mentor/bookings" mentor>
      <main className={styles.main}>
        <PageTitle>Accept Lesson</PageTitle>
        {!request && data && <p className="data-state">No open lesson requests.</p>}
        {error && <p className="data-state" role="alert">{error}</p>}
        <section className={styles.booking}>
          <article className={styles.panel}>
            <h2>{request?.title ?? "Lesson request"}</h2>
            <p className={styles.metaRow}>
              <Calendar size={16} /> {request ? new Date(request.requested_start).toLocaleDateString() : "—"} &nbsp;&nbsp;&nbsp;&nbsp;
              <Clock size={16} /> {request ? new Date(request.requested_start).toLocaleTimeString() : "—"}
            </p>
            <div>
              <h3>Description</h3>
              <p>{request?.description ?? "Select an open request to see its description."}</p>
            </div>
            <div>
              <h3>Tags</h3>
              <p>
                <b>{request?.status ?? "open"}</b>
              </p>
            </div>
            <h2>Resources</h2>
            <label className={styles.upload}>
              <UploadCloud size={32} />
              <input type="file" disabled />
              Resources become available after a booking is confirmed
              <br />
              SVG, PNG, JPG or GIF
            </label>
          </article>

          <aside className={styles.panel}>
            <h2>Bill</h2>
            <p>
              Live Lesson <b>{request?.currency ?? "INR"} {((request?.proposed_amount_minor ?? 0) / 100).toLocaleString()}</b>
            </p>
            <p>
              Platform Fees <b>Calculated after payment setup</b>
            </p>
            <hr />
            <strong>Total {request?.currency ?? "INR"} {((request?.proposed_amount_minor ?? 0) / 100).toLocaleString()}</strong>
            <div>
              <button className="button button-primary" type="button" disabled={!request} onClick={() => setBid(true)}>Make offer <ArrowRight size={16} /></button>
            </div>
          </aside>
        </section>

        {bid && (
          <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="bid-title">
            <form onSubmit={makeOffer}>
              <h2 id="bid-title">Make a counter offer</h2>
              <label>
                New Bid
                <input name="amount" type="number" defaultValue={(request?.proposed_amount_minor ?? 0) / 100} min="0" required />
              </label>
              <label>
                Feedback
                <textarea name="note" defaultValue="The topic requires additional time and preparation." />
              </label>
              <button className="button button-primary">Offer</button>
              <button className="button button-secondary" type="button" onClick={() => setBid(false)}>
                Cancel
              </button>
            </form>
          </div>
        )}
      </main>
    </AppShell>
  );
}

export function MentorLessonsPage() {
  const { data, error, reload } = useApi<{ items: Booking[] }>("/bookings");
  const lessonItems = data?.items ?? [];
  async function updateStatus(booking: Booking, status: "in_progress" | "completed") {
    try {
      await apiFetch(`/bookings/${booking.id}/status`, { method: "POST", body: JSON.stringify({ status }) });
      await reload();
    } catch (reason) { window.alert(reason instanceof Error ? reason.message : "Unable to update lesson"); }
  }
  return (
    <AppShell active="/mentor/lessons" mentor>
      <main className={styles.main}>
        <PageTitle>Lessons</PageTitle>
        <nav className={styles.lessonTabs}>
          <b>Upcoming</b>
          <span>Completed</span>
          <span>Drafts</span>
        </nav>
        <section className={styles.lessonList}>
          {error && <p className="data-state" role="alert">{error}</p>}
          {lessonItems.length === 0 && data && <p className="data-state">No booked lessons yet.</p>}
          {lessonItems.map((booking, i) => (
            <article className={styles.panel} key={booking.id}>
              <Image src={`/assets/app/course-${["design", "css", "data", "design"][i]}.png`} alt="" width={220} height={160} />
              <div>
                <small>{booking.status.replaceAll("_", " ")}</small>
                <h2>Mentoring session</h2>
                <p>
                  <Clock size={15} /> {new Date(booking.starts_at).toLocaleString()}
                </p>
                <p>Student: Bhubnesh Maharana</p>
              </div>
              <Link className="button button-primary" href={booking.status === "confirmed" ? "/meeting" : "/mentor/bookings"}>
                {booking.status === "confirmed" ? "Start class" : "View details"} <ArrowRight size={16} />
              </Link>
              {booking.status === "confirmed" && <button className="button button-secondary" type="button" onClick={() => void updateStatus(booking, "in_progress")}>Mark started</button>}
              {booking.status === "in_progress" && <button className="button button-primary" type="button" onClick={() => void updateStatus(booking, "completed")}>Mark completed</button>}
            </article>
          ))}
        </section>
      </main>
    </AppShell>
  );
}

export function MentorProfilePage() {
  return <ProfileView mentorApp />;
}

export function MentorDashboardPage() {
  const { data: dashboard } = useApi<{ completed_bookings: number; earnings_minor: number }>("/dashboard/mentor");
  const { data: wallet } = useApi<{ currency: string; balance_minor: number }>("/wallet");
  return (
    <AppShell active="/mentor/dashboard" mentor>
      <main className={styles.main}>
        <PageTitle>Dashboard</PageTitle>
        <section className={styles.summary}>
          <div>
            <Banknote size={24} color="var(--lime)" /> INR {((dashboard?.earnings_minor ?? 0) / 100).toLocaleString()}<small>Total Earning</small>
          </div>
          <div>
            <Clock size={24} color="var(--lime)" /> {dashboard?.completed_bookings ?? 0}<small>Completed sessions</small>
          </div>
          <div>
            <BookOpen size={24} color="var(--lime)" /> {dashboard?.completed_bookings ?? 0}<small>Total lessons</small>
          </div>
        </section>
        <section className={styles.dashboard}>
          <article className={styles.panel}>
            <h2>Hours Sent</h2>
            <p className="data-state">Detailed activity analytics appear as lessons are completed.</p>
          </article>
          <aside className={styles.panel}>
            <h2>Available Credit</h2>
            <strong>{wallet?.currency ?? "INR"} {((wallet?.balance_minor ?? 0) / 100).toLocaleString()}</strong>
            <p>Your current balance</p>
            <Link className="button button-primary" href="/payment">
              Add Credits <ArrowUpRight size={16} />
            </Link>
          </aside>
          <article className={styles.panel}>
            <h2>Leader Board</h2>
            <p className="data-state">Leaderboard data is not available yet.</p>
          </article>
          <aside className={styles.panel}>
            <h2>Credit score</h2>
            <strong className={styles.score}>0</strong>
            <p>Reputation points</p>
          </aside>
        </section>
      </main>
    </AppShell>
  );
}
