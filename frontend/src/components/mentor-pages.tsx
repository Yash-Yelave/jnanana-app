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
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const { data, loading, reload } = useApi<{ items: LessonRequest[] }>("/lesson-requests");

  const requests = data?.items ?? [];
  const request = requests[selectedIndex] || requests[0];

  async function handleOfferSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!request) return;
    setPending(true);
    setError("");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const amount = Number(form.get("amount")) || (request.proposed_amount_minor / 100);
    const note = String(form.get("note") || "Ready to mentor this session.");
    try {
      await apiFetch(`/lesson-requests/${request.id}/offers`, {
        method: "POST",
        body: JSON.stringify({
          amount_minor: amount * 100,
          currency: request.currency,
          note,
        }),
      });
      setMessage("Offer submitted successfully!");
      await reload();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to submit offer");
    } finally {
      setPending(false);
    }
  }

  async function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!request) return;
    setPending(true);
    setError("");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title"));
    const description = String(form.get("description"));
    const amount = Number(form.get("amount"));

    try {
      await apiFetch(`/lesson-requests/${request.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title,
          description,
          proposed_amount_minor: amount * 100,
        }),
      });
      setIsEditing(false);
      setMessage("Lesson request updated successfully!");
      await reload();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to update lesson request");
    } finally {
      setPending(false);
    }
  }

  async function handleCreateRequestSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
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
      setIsCreating(false);
      setMessage("New lesson request created successfully!");
      await reload();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to create lesson request");
    } finally {
      setPending(false);
    }
  }

  const showCreateForm = isCreating || (!loading && requests.length === 0);

  return (
    <AppShell active="/mentor/bookings" mentor>
      <main className={styles.main}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <PageTitle>Accept Lesson</PageTitle>

          {requests.length > 0 && (
            <div>
              {showCreateForm ? (
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  style={{ padding: "10px 22px", borderRadius: "999px", border: "1px solid #ddd", background: "#fff", fontWeight: 700, cursor: "pointer" }}
                >
                  ← Back to Existing Requests
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(true);
                    setIsEditing(false);
                  }}
                  style={{ padding: "10px 22px", borderRadius: "999px", border: 0, background: "#a3d95d", color: "#111", fontWeight: 800, cursor: "pointer" }}
                >
                  + Create New Request
                </button>
              )}
            </div>
          )}
        </div>

        {loading && !data && <p className="data-state">Loading lesson requests…</p>}
        {message && <p className="data-state" style={{ color: "#5e9d26", fontWeight: "800", fontSize: "16px", marginBottom: "16px" }}>✓ {message}</p>}
        {error && <p className="data-state" role="alert" style={{ color: "#b42318", fontWeight: "800", fontSize: "16px", marginBottom: "16px" }}>⚠ {error}</p>}

        {(data || !loading) && (showCreateForm ? (
          <section className={styles.panel} style={{ maxWidth: "720px", margin: "0 auto 40px", padding: "36px" }}>
            <h2 style={{ fontSize: "24px", marginBottom: "12px" }}>Create New Lesson Request</h2>
            <p style={{ color: "#666", marginBottom: "24px" }}>Fill in the details below to publish a new lesson request onto the platform.</p>

            <form onSubmit={handleCreateRequestSubmit} style={{ display: "grid", gap: "20px" }}>
              <label style={{ display: "grid", gap: "8px", fontWeight: "700" }}>
                Lesson Title / Topic
                <input
                  name="title"
                  placeholder="e.g. React & Next.js Architecture Deep Dive"
                  required
                  minLength={3}
                  style={{ height: "52px", padding: "0 18px", borderRadius: "12px", border: "1px solid #d8d8d8", outline: "none", fontSize: "16px" }}
                />
              </label>

              <label style={{ display: "grid", gap: "8px", fontWeight: "700" }}>
                Description
                <textarea
                  name="description"
                  placeholder="Describe what you want to learn or teach in this session..."
                  required
                  minLength={10}
                  style={{ minHeight: "120px", padding: "14px 18px", borderRadius: "12px", border: "1px solid #d8d8d8", outline: "none", fontSize: "15px", fontFamily: "inherit" }}
                />
              </label>

              <label style={{ display: "grid", gap: "8px", fontWeight: "700" }}>
                Proposed Rate (INR)
                <input
                  name="amount"
                  type="number"
                  defaultValue={250}
                  min="1"
                  required
                  style={{ height: "52px", padding: "0 18px", borderRadius: "12px", border: "1px solid #d8d8d8", outline: "none", fontSize: "16px" }}
                />
              </label>

              <div style={{ display: "flex", gap: "14px", marginTop: "12px" }}>
                <button
                  type="submit"
                  disabled={pending}
                  className="button button-primary"
                  style={{
                    height: "54px",
                    flex: 1,
                    borderRadius: "999px",
                    background: "#a3d95d",
                    color: "#111",
                    fontWeight: "800",
                    fontSize: "16px",
                    border: 0,
                    cursor: "pointer",
                  }}
                >
                  {pending ? "Submitting…" : "Submit Lesson Request →"}
                </button>
                {requests.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    style={{
                      height: "54px",
                      padding: "0 24px",
                      borderRadius: "999px",
                      border: "1px solid #ccc",
                      background: "#f5f5f5",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </section>
        ) : (
          <section className={styles.booking}>
            <article className={styles.panel}>
              {requests.length > 1 && (
                <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
                  <label style={{ fontWeight: "700", color: "#333" }}>Select Existing Request:</label>
                  <select
                    value={selectedIndex}
                    onChange={(e) => {
                      setSelectedIndex(Number(e.target.value));
                      setIsEditing(false);
                    }}
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

              {isEditing ? (
                <form onSubmit={handleEditSubmit} style={{ display: "grid", gap: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h2 style={{ fontSize: "20px" }}>Edit Selected Request</h2>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      style={{ padding: "6px 16px", borderRadius: "999px", border: "1px solid #ccc", background: "#f5f5f5", cursor: "pointer", fontWeight: "700" }}
                    >
                      Cancel
                    </button>
                  </div>
                  <label style={{ display: "grid", gap: "6px", fontWeight: "700" }}>
                    Title
                    <input
                      name="title"
                      defaultValue={request.title}
                      required
                      minLength={3}
                      style={{ height: "46px", padding: "0 14px", borderRadius: "10px", border: "1px solid #ddd", fontSize: "15px" }}
                    />
                  </label>
                  <label style={{ display: "grid", gap: "6px", fontWeight: "700" }}>
                    Description
                    <textarea
                      name="description"
                      defaultValue={request.description}
                      required
                      minLength={10}
                      style={{ minHeight: "100px", padding: "12px", borderRadius: "10px", border: "1px solid #ddd", fontSize: "14px", fontFamily: "inherit" }}
                    />
                  </label>
                  <label style={{ display: "grid", gap: "6px", fontWeight: "700" }}>
                    Proposed Rate (INR)
                    <input
                      name="amount"
                      type="number"
                      defaultValue={request.proposed_amount_minor / 100}
                      min="1"
                      required
                      style={{ height: "46px", padding: "0 14px", borderRadius: "10px", border: "1px solid #ddd", fontSize: "15px" }}
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={pending}
                    className="button button-primary"
                    style={{ height: "48px", borderRadius: "999px", background: "#a3d95d", border: 0, fontWeight: "800", cursor: "pointer", color: "#111" }}
                  >
                    {pending ? "Saving…" : "Save Changes →"}
                  </button>
                </form>
              ) : (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <h2 style={{ margin: 0 }}>{request.title}</h2>
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      style={{ padding: "8px 18px", borderRadius: "999px", border: 0, background: "#111", color: "#fff", fontWeight: "700", cursor: "pointer", fontSize: "13px" }}
                    >
                      Edit Request ✏️
                    </button>
                  </div>
                  <p className={styles.metaRow}>
                    <Calendar size={16} /> {new Date(request.requested_start).toLocaleDateString()} &nbsp;&nbsp;&nbsp;&nbsp;
                    <Clock size={16} /> {new Date(request.requested_start).toLocaleTimeString()}
                  </p>
                  <div>
                    <h3>Description</h3>
                    <p>{request.description}</p>
                  </div>
                  <div>
                    <h3>Status</h3>
                    <p>
                      <b>{request.status}</b>
                    </p>
                  </div>
                </>
              )}
            </article>

            <aside className={styles.panel}>
              <h2>Lesson Offer Form</h2>
              <form onSubmit={handleOfferSubmit} style={{ display: "grid", gap: "16px", marginTop: "16px" }}>
                <label style={{ display: "grid", gap: "6px", fontWeight: "700" }}>
                  Offer Rate (INR)
                  <input
                    name="amount"
                    type="number"
                    defaultValue={(request.proposed_amount_minor / 100)}
                    min="1"
                    required
                    style={{ height: "48px", padding: "0 16px", borderRadius: "12px", border: "1px solid #ddd", fontSize: "15px" }}
                  />
                </label>

                <label style={{ display: "grid", gap: "6px", fontWeight: "700" }}>
                  Note / Message
                  <textarea
                    name="note"
                    defaultValue="Ready to mentor this session at the proposed topic depth."
                    required
                    style={{ minHeight: "90px", padding: "12px", borderRadius: "12px", border: "1px solid #ddd", fontSize: "14px", fontFamily: "inherit" }}
                  />
                </label>

                <button
                  type="submit"
                  disabled={pending}
                  className="button button-primary"
                  style={{
                    height: "52px",
                    borderRadius: "999px",
                    background: "#a3d95d",
                    color: "#111",
                    fontWeight: "800",
                    border: 0,
                    cursor: "pointer",
                    marginTop: "8px",
                  }}
                >
                  {pending ? "Submitting…" : "Submit Offer →"}
                </button>
              </form>
            </aside>
          </section>
        ))}
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
