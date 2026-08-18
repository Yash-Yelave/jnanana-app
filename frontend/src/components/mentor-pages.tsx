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
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [bid, setBid] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const { data, reload } = useApi<{ items: LessonRequest[] }>("/lesson-requests");

  const requests = data?.items ?? [];
  const request = requests[selectedIndex] || requests[0];

  async function makeOffer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!request) return;
    setError("");
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await apiFetch(`/lesson-requests/${request.id}/offers`, {
        method: "POST",
        body: JSON.stringify({
          amount_minor: Number(form.get("amount")) * 100,
          currency: request.currency,
          note: String(form.get("note")),
        }),
      });
      setBid(false);
      setMessage("Counter offer submitted successfully!");
      await reload();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to create offer");
    }
  }

  async function acceptDirectly() {
    if (!request) return;
    setError("");
    setMessage("");
    try {
      await apiFetch(`/lesson-requests/${request.id}/offers`, {
        method: "POST",
        body: JSON.stringify({
          amount_minor: request.proposed_amount_minor,
          currency: request.currency,
          note: "Accepted request at proposed rate.",
        }),
      });
      setMessage("Lesson offer created for proposed amount!");
      await reload();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to accept lesson");
    }
  }

  async function createSampleRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title"));
    const description = String(form.get("description"));
    const amount = Number(form.get("amount")) || 200;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    const endDate = new Date(startDate.getTime() + 3600000);

    try {
      await apiFetch("/lesson-requests", {
        method: "POST",
        body: JSON.stringify({
          title,
          description,
          proposed_amount_minor: amount * 100,
          currency: "INR",
          requested_start: startDate.toISOString(),
          requested_end: endDate.toISOString(),
        }),
      });
      setShowCreateModal(false);
      setMessage("New lesson request created successfully!");
      await reload();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to create lesson request (Student account required to post requests)");
    }
  }

  return (
    <AppShell active="/mentor/bookings" mentor>
      <main className={styles.main}>
        <PageTitle>Accept Lesson</PageTitle>

        {message && <p className="data-state" style={{ color: "#5e9d26", fontWeight: "700" }}>{message}</p>}
        {error && <p className="data-state" role="alert" style={{ color: "#b42318", fontWeight: "700" }}>{error}</p>}

        {requests.length > 1 && (
          <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
            <label style={{ fontWeight: "700", color: "#333" }}>Select Lesson Request:</label>
            <select
              value={selectedIndex}
              onChange={(e) => setSelectedIndex(Number(e.target.value))}
              style={{ padding: "10px 16px", borderRadius: "12px", border: "1px solid #d8d8d8", outline: "none", fontSize: "14px" }}
            >
              {requests.map((item, index) => (
                <option key={item.id} value={index}>
                  {item.title} — {item.currency} {(item.proposed_amount_minor / 100).toLocaleString()}
                </option>
              ))}
            </select>
          </div>
        )}

        {!request && data && (
          <div className={styles.panel} style={{ textAlign: "center", padding: "40px 20px", marginBottom: "24px" }}>
            <h2>No Open Lesson Requests</h2>
            <p style={{ color: "#666", margin: "12px 0 20px" }}>Create a new lesson request to test filling and submitting booking details.</p>
            <button
              className="button button-primary"
              type="button"
              onClick={() => setShowCreateModal(true)}
              style={{ cursor: "pointer", border: 0, padding: "12px 28px", borderRadius: "999px", background: "#a3d95d", fontWeight: 800 }}
            >
              Create Lesson Request +
            </button>
          </div>
        )}

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
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
              <button
                className="button button-primary"
                type="button"
                disabled={!request}
                onClick={acceptDirectly}
                style={{ cursor: request ? "pointer" : "not-allowed" }}
              >
                Accept Lesson <ArrowRight size={16} />
              </button>
              <button
                className="button button-secondary"
                type="button"
                disabled={!request}
                onClick={() => setBid(true)}
                style={{ cursor: request ? "pointer" : "not-allowed", border: "1px solid #ddd", borderRadius: "999px", padding: "12px", fontWeight: 700 }}
              >
                Make Counter Offer
              </button>
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                style={{ cursor: "pointer", border: 0, padding: "10px", borderRadius: "999px", background: "#f0f0f0", fontWeight: 700, fontSize: "13px" }}
              >
                + New Request
              </button>
            </div>
          </aside>
        </section>

        {bid && (
          <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="bid-title">
            <form onSubmit={makeOffer}>
              <h2 id="bid-title">Make a counter offer</h2>
              <label>
                New Bid (INR)
                <input name="amount" type="number" defaultValue={(request?.proposed_amount_minor ?? 0) / 100} min="1" required />
              </label>
              <label>
                Feedback / Note
                <textarea name="note" defaultValue="The topic requires additional time and preparation." required />
              </label>
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="submit" className="button button-primary" style={{ flex: 1, cursor: "pointer" }}>Submit Offer</button>
                <button className="button button-secondary" type="button" onClick={() => setBid(false)} style={{ flex: 1, cursor: "pointer", border: "1px solid #ccc", background: "#f5f5f5" }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {showCreateModal && (
          <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="create-title">
            <form onSubmit={createSampleRequest}>
              <h2 id="create-title">Create Lesson Request</h2>
              <label>
                Title
                <input name="title" placeholder="e.g. Advanced React & Next.js Architecture" required minLength={3} />
              </label>
              <label>
                Description
                <textarea name="description" placeholder="Explain what topic you need help with..." required minLength={10} />
              </label>
              <label>
                Proposed Amount (INR)
                <input name="amount" type="number" defaultValue={250} min="1" required />
              </label>
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="submit" className="button button-primary" style={{ flex: 1, cursor: "pointer" }}>Submit Request</button>
                <button type="button" onClick={() => setShowCreateModal(false)} style={{ flex: 1, cursor: "pointer", border: "1px solid #ccc", background: "#f5f5f5" }}>
                  Cancel
                </button>
              </div>
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
