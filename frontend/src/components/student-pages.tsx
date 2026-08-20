"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
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
  LogOut,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { apiFetch } from "@/lib/api";
import { createClient, publicAsset } from "@/lib/supabase/client";
import type { Booking, LessonRequest, Mentor, MentorProfile, Offer, Profile, Review } from "@/lib/types";
import { useApi, clearApiCache } from "@/lib/use-api";
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
          router.push("/dashboard");
        }
      }, 150);
    } else {
      router.push("/dashboard");
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
  const mentors = data?.items ?? [];

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
          {mentors.map((mentor, index) => {
            const name = `${mentor.first_name} ${mentor.last_name}`;
            const avatar = publicAsset("avatars", mentor.avatar_path) ?? `/assets/app/mentor-${(index % 4) + 1}.png`;
            const price = (mentor.hourly_rate_minor / 100).toLocaleString();
            const languages = mentor.languages.length > 0 ? mentor.languages : ["English"];
            const professions = mentor.professions.length > 0 ? mentor.professions : [mentor.headline || "Mentorship"];
            const companies = mentor.companies.length > 0 ? mentor.companies.join(", ") : "Independent";
            const bio = mentor.bio || "Experienced mentor ready to guide you in live 1:1 sessions.";

            return (
              <article className={styles.mentorCard} key={mentor.id}>
                <div className={styles.mentorBio}>
                  <Image src={avatar} alt={name} width={76} height={76} style={{ borderRadius: "50%", objectFit: "cover" }} />
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
                    {languages.map((lang) => (
                      <i key={lang}>{lang}</i>
                    ))}
                  </dd>
                  <dt>Profession</dt>
                  <dd>
                    {professions.map((prof) => (
                      <i key={prof}>{prof}</i>
                    ))}
                  </dd>
                  <dt>Experience</dt>
                  <dd>
                    <i>{companies}</i>
                  </dd>
                </dl>
                <p>{bio}</p>
                <Link href={`/mentors/${mentor.id}`}>
                  Show details <ArrowUpRight size={14} />
                </Link>
                <aside>
                  <b>Instant lessons</b>
                  <b>Mentorship</b>
                  <b>Tutorials</b>
                  <span>
                    Mentorship Fee<strong>10 Jule Tokens</strong>
                  </span>
                  <Link className={styles.button} href={`/mentors/${mentor.id}`}>
                    Request Mentorship <ArrowUpRight size={16} />
                  </Link>
                </aside>
              </article>
            );
          })}
        </div>
      </main>
    </AppShell>
  );
}

const tabs = [
  ["About", "/profile"],
  ["My Requests", "/requests"],
  ["Wallet", "/jule/transactions"],
] as const;

export function ProfileView({ mode = "about", mentorDetail = false, mentorApp = false, mentorId }: { mode?: "about" | "lessons" | "feedback"; mentorDetail?: boolean; mentorApp?: boolean; mentorId?: string }) {
  const router = useRouter();
  const active = mentorDetail ? "/mentors" : mentorApp ? "/mentor/profile" : "/profile";
  const { data, error, loading } = useApi<Profile | Mentor>(mentorDetail && mentorId ? `/mentors/${mentorId}` : "/me");
  const { data: walletData } = useApi<{ balance: number }>("/jule/wallet");

  const [showJuleModal, setShowJuleModal] = useState(false);
  const [requestNote, setRequestNote] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestMsg, setRequestMsg] = useState("");
  const [requestError, setRequestError] = useState("");

  const rawFirstName = data?.first_name || "";
  const rawLastName = data?.last_name || "";
  const formattedName = (rawFirstName || rawLastName) ? `${rawFirstName} ${rawLastName}`.trim() : "";
  const avatar = publicAsset("avatars", data?.avatar_path) ?? "/assets/app/mentor-1.png";
  const mentor = data && "headline" in data ? data : data?.mentor;

  const currentBalance = walletData?.balance ?? 0;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get("request") === "true") {
        setShowJuleModal(true);
      }
    }
  }, []);

  const handleConfirmRequest = async () => {
    setSubmittingRequest(true);
    setRequestError("");
    setRequestMsg("");
    try {
      const targetId = mentorId || (data && "id" in data ? (data as any).id : undefined);
      if (!targetId) {
        setRequestError("We couldn't identify this mentor. Please reopen their profile and try again.");
        return;
      }
      await apiFetch("/mentorship-requests", {
        method: "POST",
        body: JSON.stringify({
          mentor_id: targetId,
          tokens_used: 10,
          note: requestNote || "Requesting mentorship session",
        }),
      });
      clearApiCache();
      setRequestMsg("Request sent. 10 Jule Tokens deducted — track it under My Requests.");
      setTimeout(() => setShowJuleModal(false), 2000);
    } catch (err: any) {
      setRequestError(err.message || "Failed to submit mentorship request");
    } finally {
      setSubmittingRequest(false);
    }
  };

  return (
    <AppShell active={active} mentor={mentorApp}>
      <main className={styles.main}>
        {/* JULE TOKEN REQUEST MODAL */}
        {showJuleModal && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.8)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}>
            <div style={{
              background: "#F6EBDB",
              borderRadius: "0",
              padding: "32px",
              maxWidth: "500px",
              width: "100%",
              border: "1px solid rgba(255, 184, 0, 0.3)",
              color: "#141210"
            }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "12px" }}>
                ⚡ Request Mentorship
              </h2>
              <p style={{ color: "#6A675F", marginBottom: "20px", lineHeight: 1.5 }}>
                Use <strong>10 Jule Tokens</strong> to request a mentorship connection with <strong>{formattedName || "Mentor"}</strong>?
              </p>

              <div style={{
                background: "rgba(255, 184, 0, 0.1)",
                border: "1px solid rgba(255, 184, 0, 0.2)",
                borderRadius: "0",
                padding: "16px",
                marginBottom: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <span style={{ fontSize: "0.9rem", color: "#141210" }}>Your Jule Token balance:</span>
                <strong style={{ fontSize: "1.2rem", color: "#F5B921" }}>⚡ {currentBalance} Jule Tokens</strong>
              </div>

              {currentBalance < 10 ? (
                <div style={{ padding: "12px", borderRadius: "0", background: "rgba(239, 68, 68, 0.2)", border: "1px solid #EF4444", color: "#EF4444", marginBottom: "20px" }}>
                  Insufficient Jule Tokens. You have {currentBalance}, but 10 are required. Check in at an event to claim 50.
                </div>
              ) : (
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "#6A675F" }}>
                    Add a note for {formattedName} (Optional):
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe what you want to learn or get advice on..."
                    value={requestNote}
                    onChange={(e) => setRequestNote(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "0",
                      background: "#fff",
                border: "1.5px solid #141210",
                color: "#141210"
                    }}
                  />
                </div>
              )}

              {requestMsg && <div style={{ color: "#0B6B44", marginBottom: "16px", fontWeight: "600" }}>{requestMsg}</div>}
              {requestError && <div style={{ color: "#EF4444", marginBottom: "16px" }}>{requestError}</div>}

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setShowJuleModal(false)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "0",
                    background: "#fff",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                {currentBalance >= 10 && (
                  <button
                    onClick={handleConfirmRequest}
                    disabled={submittingRequest}
                    style={{
                      padding: "10px 24px",
                      borderRadius: "0",
                      background: "#F5B921",
                      color: "#000",
                      fontWeight: "700",
                      border: "none",
                      cursor: submittingRequest ? "not-allowed" : "pointer"
                    }}
                  >
                    {submittingRequest ? "Submitting..." : "Confirm (spend 10 Jule Tokens)"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className={styles.titleRow}>
          <PageTitle>{mentorDetail ? "Mentorship" : "Profile"}</PageTitle>
        </div>
        {loading && !data && <p className="data-state">Loading profile details…</p>}
        {error && !data && <p className="data-state" role="alert">{error}</p>}
        {(data || !loading) && (
          <>
            <section className={styles.profileName}>
              <Image src={avatar} alt={formattedName || "Profile Avatar"} width={100} height={100} />
              <div>
                <h2>
                  {formattedName || "Member Profile"} <CheckCircle2 size={24} className={styles.checkIcon} />
                </h2>
                <p>
                  <span className={styles.mentorBadge}>
                    <Crown size={14} /> {mentor ? "Verified mentor" : "Learner"}
                  </span>
                  {mentor?.headline && <span style={{ color: "#555", fontWeight: "600" }}>• {mentor.headline}</span>}
                </p>
              </div>
              {mentorDetail && (
                <div style={{ marginLeft: "auto", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                  <button
                    onClick={() => setShowJuleModal(true)}
                    style={{
                      padding: "12px 24px",
                      borderRadius: "0",
                      background: "#F5B921",
                      color: "#000",
                      fontWeight: 700,
                      fontSize: "1rem",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      boxShadow: "4px 4px 0 #141210",
                    }}
                  >
                    Request Mentorship (10 Jule Tokens)
                  </button>
                </div>
              )}
              {!mentorDetail && (
                <Link className={styles.primary} href="/profile/edit" style={{ marginLeft: "auto" }}>
                  Edit Profile
                </Link>
              )}
            </section>
            <nav className={styles.tabs}>
              {tabs.map(([label, href]) => (
                <Link
                  className={mode === label.toLowerCase() ? styles.current : ""}
                  href={mentorApp ? "/mentor/requests" : href}
                  key={label}
                >
                  {label}
                </Link>
              ))}
            </nav>
            {mode === "about" ? <About profile={data} mentor={mentor} /> : mode === "lessons" ? <Lessons mentorId={mentorId} /> : <Feedback mentorId={mentorId} />}
            
            {/* Logout Button */}
            {!mentorDetail && (
              <div style={{ marginTop: "40px", paddingTop: "24px", borderTop: "1px solid #141210", textAlign: "center" }}>
                <button
                  type="button"
                  onClick={async () => {
                    const supabase = createClient();
                    await supabase.auth.signOut();
                    router.push("/login?force=true");
                    router.refresh();
                  }}
                  style={{
                    padding: "12px 32px",
                    borderRadius: "0",
                    background: "#EF4444",
                    color: "#FFFFFF",
                    fontWeight: 700,
                    fontSize: "1rem",
                    border: "none",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "4px 4px 0 #141210",
                    transition: "transform 0.15s ease",
                  }}
                >
                  <LogOut size={20} />
                  Log Out
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </AppShell>
  );
}

function formatLabel(item: unknown): string {
  if (!item) return "";
  if (typeof item === "string") return item;
  if (typeof item === "object") {
    const obj = item as Record<string, unknown>;
    if (typeof obj.name === "string") return obj.name;
    if (typeof obj.title === "string") return obj.title;
    if (typeof obj.label === "string") return obj.label;
  }
  return String(item);
}

function About({ profile, mentor }: { profile?: Profile | Mentor; mentor?: MentorProfile | Mentor | null }) {
  const m = mentor ?? (profile && "mentor" in profile ? (profile as any).mentor : null);
  const rawLanguages: unknown[] = m?.languages ?? [];
  const rawProfessions: unknown[] = m?.professions ?? (profile && "skills" in profile ? (profile as any).skills : []) ?? [];
  const rawCompanies: unknown[] = m?.companies ?? [];

  const languages = rawLanguages.map(formatLabel).filter(Boolean);
  const professions = rawProfessions.map(formatLabel).filter(Boolean);
  const companies = rawCompanies.map(formatLabel).filter(Boolean);

  const headline = m?.headline ?? (profile && "headline" in profile ? (profile as any).headline : null);
  const bio = m?.bio ?? (profile && "bio" in profile ? (profile as any).bio : null);
  const location = profile && "location" in profile ? (profile as any).location : null;

  return (
    <section className={styles.profileGrid}>
      <article className={styles.whitePanel}>
        <dl className={styles.about}>
          <dt>Location & Local Time</dt>
          <dd>
            <i>{location || "Available online"}</i>
          </dd>
          <dt>Headline / Role</dt>
          <dd>{headline || "Platform Member"}</dd>
          <dt>Skills & Topics</dt>
          <dd>
            {professions.length > 0 ? (
              professions.map((skill, index) => <i key={index}>{skill}</i>)
            ) : (
              <i>General Learning</i>
            )}
          </dd>
          <dt>About</dt>
          <dd>{bio || "No biography has been added yet."}</dd>
          <dt>Speaks</dt>
          <dd>
            {(languages.length > 0 ? languages : ["English"]).map((language, index) => (
              <i key={index}>{language}</i>
            ))}
          </dd>
          <dt>Educational Institutes & Companies</dt>
          <dd>
            {companies.length > 0 ? (
              companies.map((company, index) => <i key={index}>{company}</i>)
            ) : (
              "Not provided"
            )}
          </dd>
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
          Member Status <strong>Active</strong>
        </p>
      </aside>
    </section>
  );
}

function Lessons({ mentorId }: { mentorId?: string }) {
  const { data: bookingData, error: bookingError, loading: bookingLoading, reload: reloadBookings } = useApi<{ items: Booking[] }>(
    mentorId ? `/mentors/${mentorId}/bookings` : "/bookings"
  );
  const { data: requestData, reload: reloadRequests } = useApi<{ items: LessonRequest[] }>("/lesson-requests");
  const { data: offerData, reload: reloadOffers } = useApi<{ items: Offer[] }>("/offers");

  const bookings = bookingData?.items ?? [];
  const requests = requestData?.items ?? [];
  const offers = offerData?.items ?? [];
  const [actingOfferId, setActingOfferId] = useState<string>();
  const [actionMsg, setActionMsg] = useState("");

  const handleAcceptOffer = async (offerId: string) => {
    setActingOfferId(offerId);
    setActionMsg("");
    try {
      await apiFetch(`/offers/${offerId}/accept`, {
        method: "POST",
        headers: { "Idempotency-Key": crypto.randomUUID() },
      });
      clearApiCache();
      setActionMsg("Offer accepted! Booking confirmed. Opening chat...");
      await Promise.all([reloadBookings(), reloadRequests(), reloadOffers()]);
    } catch (reason) {
      alert(reason instanceof Error ? reason.message : "Unable to accept offer");
    } finally {
      setActingOfferId(undefined);
    }
  };

  async function review(booking: Booking) {
    const rating = Number(window.prompt("Rating from 1 to 5"));
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return;
    const comment = window.prompt("Feedback (optional)");
    try {
      await apiFetch(`/bookings/${booking.id}/reviews`, { method: "POST", body: JSON.stringify({ rating, comment }) });
      await reloadBookings();
    } catch (reason) {
      window.alert(reason instanceof Error ? reason.message : "Unable to save review");
    }
  }

  return (
    <div style={{ display: "grid", gap: "28px" }}>
      {actionMsg && (
        <p style={{ padding: "14px 20px", borderRadius: "0", background: "#efffde", color: "#5c9822", fontWeight: 800 }}>
          ✓ {actionMsg}
        </p>
      )}

      {!mentorId && (
        <section className={styles.whitePanel}>
          <h2 style={{ fontSize: "22px", marginBottom: "16px" }}>My Lesson Requests & Mentor Offers</h2>
          {requests.length === 0 ? (
            <p className="data-state">No active lesson requests created yet.</p>
          ) : (
            <div style={{ display: "grid", gap: "16px" }}>
              {requests.map((req) => {
                const reqOffers = offers.filter((o) => o.request_id === req.id && o.status === "pending");
                return (
                  <div key={req.id} style={{ padding: "20px", borderRadius: "0", border: "1px solid #eee", background: "#fafafa" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h3 style={{ margin: 0, fontSize: "18px" }}>{req.title}</h3>
                      <span style={{ padding: "4px 14px", borderRadius: "999px", background: req.status === "accepted" ? "#efffde" : "#e9e9e9", color: req.status === "accepted" ? "#5c9822" : "#333", fontWeight: 800, fontSize: "13px" }}>
                        {req.status.toUpperCase()}
                      </span>
                    </div>
                    <p style={{ color: "#666", margin: "10px 0 14px", fontSize: "14px" }}>{req.description}</p>
                    <p style={{ fontWeight: 700, color: "#111", fontSize: "14px" }}>
                      Proposed Rate: {req.currency} {(req.proposed_amount_minor / 100).toLocaleString()}
                    </p>

                    {reqOffers.length > 0 && (
                      <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #ddd" }}>
                        <h4 style={{ fontSize: "14px", color: "#555", marginBottom: "10px" }}>Offers Received from Mentors:</h4>
                        {reqOffers.map((off) => (
                          <div key={off.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px", borderRadius: "0", background: "#fff", border: "1px solid #e0e0e0" }}>
                            <div>
                              <p style={{ margin: 0, fontWeight: 800, fontSize: "15px" }}>Rate: {off.currency} {(off.amount_minor / 100).toLocaleString()}</p>
                              {off.note && <small style={{ color: "#666" }}>"{off.note}"</small>}
                            </div>
                            <button
                              type="button"
                              disabled={actingOfferId === off.id}
                              onClick={() => void handleAcceptOffer(off.id)}
                              style={{ padding: "10px 20px", borderRadius: "999px", background: "#a3dc58", color: "#111", border: 0, fontWeight: 800, cursor: "pointer" }}
                            >
                              {actingOfferId === off.id ? "Accepting…" : "Accept Offer & Book →"}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      <section className={styles.whitePanel}>
        <h2 style={{ fontSize: "22px", marginBottom: "16px" }}>Booked Mentoring Sessions & Status</h2>
        {bookingLoading && <p className="data-state">Loading lessons…</p>}
        {bookingError && <p className="data-state" role="alert">{bookingError}</p>}
        {!bookingLoading && !bookingError && bookings.length === 0 && <p className="data-state">No confirmed mentoring sessions yet.</p>}
        <div style={{ display: "grid", gap: "16px" }}>
          {bookings.map((booking) => (
            <div className={styles.review} key={booking.id} style={{ alignItems: "center" }}>
              <Clock size={24} color="#5c9822" />
              <div style={{ flex: 1 }}>
                <b>Mentoring session</b>
                <br />
                <span>{new Date(booking.starts_at).toLocaleString()} · </span>
                <span style={{ padding: "3px 10px", borderRadius: "999px", background: "#efffde", color: "#5c9822", fontWeight: 800, fontSize: "12px" }}>
                  {booking.status.replaceAll("_", " ").toUpperCase()}
                </span>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <Link href={`/chat?mentorId=${booking.mentor_id}`} style={{ padding: "10px 18px", borderRadius: "999px", background: "#111", color: "#fff", fontWeight: 700, textDecoration: "none", fontSize: "14px" }}>
                  Chat with Mentor →
                </Link>
                {booking.status === "completed" && !mentorId && (
                  <button type="button" onClick={() => void review(booking)} style={{ padding: "10px 18px", borderRadius: "999px", background: "#a3dc58", border: 0, fontWeight: 800, cursor: "pointer" }}>
                    Leave review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
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
      </main>
    </AppShell>
  );
}
