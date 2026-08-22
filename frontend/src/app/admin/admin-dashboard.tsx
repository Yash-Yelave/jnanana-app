"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Brand } from "@/components/brand";
import {
  getAdminMetrics,
  createAdminEvent,
  adjustUserTokens,
  approveMentor,
  rejectMentor,
  changeUserRole,
} from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import { useApi } from "@/lib/use-api";
import { ParticipantsTab } from "./participants-tab";
import { RequestsTab } from "./requests-tab";
import { BugsTab } from "./bugs-tab";
import styles from "./page.module.css";

type AdminMentor = {
  profile_id: string;
  first_name: string;
  last_name: string;
  headline: string | null;
  bio: string | null;
  approval_status: string;
  rejection_reason: string | null;
  professions: string[];
  created_at: string | null;
};


export function AdminDashboard() {
  const users = useApi<{ items: Profile[] }>("/admin/users");
  const mentorsApi = useApi<{ items: AdminMentor[] }>("/admin/mentors");
  const [metrics, setMetrics] = useState<Record<string, number> | null>(null);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<
    "overview" | "bugs" | "mentors" | "events" | "participants" | "requests" | "tokens" | "users"
  >("overview");
  const [mentorFilter, setMentorFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Event Form State
  const [eventName, setEventName] = useState("");
  const [eventSlug, setEventSlug] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventLoc, setEventLoc] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [creatingEvent, setCreatingEvent] = useState(false);

  // Token Form State
  const [tokenUserId, setTokenUserId] = useState("");
  const [tokenAmount, setTokenAmount] = useState<number>(50);
  const [tokenNotes, setTokenNotes] = useState("Event Activity Reward");
  const [adjustingTokens, setAdjustingTokens] = useState(false);

  useEffect(() => {
    getAdminMetrics()
      .then(setMetrics)
      .catch(() => null);
  }, []);

  const handleApproveMentor = async (mentorId: string) => {
    setProcessingId(mentorId);
    setMessage("");
    try {
      await approveMentor(mentorId);
      setMessage(`Mentor profile approved successfully!`);
      await mentorsApi.reload();
      const m = await getAdminMetrics();
      setMetrics(m);
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Failed to approve mentor profile");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectMentor = async (mentorId: string) => {
    const reason = window.prompt("Reason for rejection (Optional):", "Application does not meet guidelines");
    if (reason === null) return;
    setProcessingId(mentorId);
    setMessage("");
    try {
      await rejectMentor(mentorId, reason);
      setMessage(`Mentor profile rejected.`);
      await mentorsApi.reload();
      const m = await getAdminMetrics();
      setMetrics(m);
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Failed to reject mentor profile");
    } finally {
      setProcessingId(null);
    }
  };

  const handleCreateEvent = async (e: FormEvent) => {
    e.preventDefault();
    setCreatingEvent(true);
    setMessage("");
    try {
      await createAdminEvent({
        slug: eventSlug || eventName.toLowerCase().replace(/\s+/g, "-"),
        name: eventName,
        description: eventDesc,
        event_date: eventDate || new Date().toISOString(),
        location: eventLoc || "Main Stage",
      });
      setMessage(`Event "${eventName}" created successfully!`);
      setEventName("");
      setEventSlug("");
      setEventDesc("");
      setEventDate("");
      setEventLoc("");
      const m = await getAdminMetrics();
      setMetrics(m);
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Failed to create event");
    } finally {
      setCreatingEvent(false);
    }
  };

  const handleAdjustTokens = async (e: FormEvent) => {
    e.preventDefault();
    if (!tokenUserId) {
      setMessage("Please select or enter a User ID");
      return;
    }
    setAdjustingTokens(true);
    setMessage("");
    try {
      const res = await adjustUserTokens({
        user_id: tokenUserId,
        amount: Number(tokenAmount),
        notes: tokenNotes,
      });
      setMessage(`Tokens adjusted successfully! New balance: ${res.new_balance} Jools`);
      const m = await getAdminMetrics();
      setMetrics(m);
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Failed to adjust tokens");
    } finally {
      setAdjustingTokens(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await createClient().auth.signOut();
    } catch {}
    window.location.href = "/login";
  };

  const allMentors = mentorsApi.data?.items || [];

  const filteredMentors = mentorFilter === "all"
    ? allMentors
    : allMentors.filter((m) => m.approval_status === mentorFilter);

  const pendingCount = allMentors.filter((m) => m.approval_status === "pending").length;

  return (
    <main className={styles.page}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Brand />
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>Jnanana Administration Panel</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link
            href="/dashboard"
            style={{
              padding: "8px 16px",
              borderRadius: "0",
              background: "#F5B921",
              color: "#141210",
              fontWeight: 700,
              textDecoration: "none",
              fontSize: "14px",
            }}
          >
            Platform Dashboard →
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            style={{
              padding: "8px 16px",
              borderRadius: "0",
              background: "#D6206A",
              color: "#fff",
              fontWeight: 700,
              border: "1.5px solid #141210",
              boxShadow: "3px 3px 0 #141210",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      {message && (
        <div style={{ padding: "12px 20px", borderRadius: "0", background: "rgba(255, 184, 0, 0.15)", border: "1px solid #F5B921", color: "#F5B921", marginBottom: "24px" }}>
          {message}
        </div>
      )}

      {/* Admin Tab Navigation */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "24px" }}>
        {(["overview", "bugs", "mentors", "events", "participants", "requests", "tokens", "users"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "11px 18px",
              borderRadius: "0",
              background: activeTab === tab ? "#F5B921" : "#fff",
              color: "#141210",
              border: "1.5px solid #141210",
              boxShadow: activeTab === tab ? "0 0 0 #141210" : "3px 3px 0 #141210",
              transform: activeTab === tab ? "translate(3px, 3px)" : "none",
              transition: "transform .16s ease, box-shadow .16s ease",
              fontFamily: "var(--font-mono)",
              fontSize: "10.5px",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {tab === "bugs"
              ? `Bug Reports ${metrics?.open_bug_reports ? `(${metrics.open_bug_reports})` : ""}`
              : tab === "mentors"
              ? `Mentor Approvals ${pendingCount > 0 ? `(${pendingCount})` : ""}`
              : tab}
          </button>
        ))}
      </div>

      {activeTab === "bugs" && <BugsTab />}

      {activeTab === "participants" && <ParticipantsTab />}

      {activeTab === "requests" && <RequestsTab />}

      {/* TAB 1: OVERVIEW METRICS */}
      {activeTab === "overview" && (
        <section>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "16px" }}>Platform Overview Metrics</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
            {[
              { label: "Total users", val: metrics?.total_users ?? 0 },
              { label: "Total mentors", val: metrics?.total_mentors ?? 0 },
              { label: "Active events", val: metrics?.active_events ?? 0 },
              { label: "Event participants", val: metrics?.event_participants ?? 0 },
              { label: "Pending requests", val: metrics?.pending_requests ?? 0 },
              { label: "Open bug reports", val: metrics?.open_bug_reports ?? 0 },
              { label: "Jools issued", val: metrics?.jule_tokens_issued ?? 0 },
              { label: "Jools spent", val: metrics?.jule_tokens_spent ?? 0 },
            ].map((m) => (
              <div
                key={m.label}
                style={{
                  background: "#fff",
                  border: "1.5px solid #141210",
                  boxShadow: "4px 4px 0 #141210",
                  padding: "22px",
                }}
              >
                <strong
                  style={{
                    display: "block",
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(30px, 4vw, 42px)",
                    fontWeight: 800,
                    lineHeight: 1,
                    letterSpacing: "-0.03em",
                    color: "#F5B921",
                    WebkitTextStroke: "1.5px #141210",
                  }}
                >
                  {m.val}
                </strong>
                <span className="mono" style={{ display: "block", marginTop: "12px", color: "#6A675F" }}>
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB 2: MENTOR APPROVALS */}
      {activeTab === "mentors" && (
        <section style={{ background: "#F6EBDB", padding: "24px", borderRadius: "0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "1.25rem", margin: 0 }}>Mentor Application Approvals</h2>
            <div style={{ display: "flex", gap: "8px" }}>
              {(["pending", "approved", "rejected", "all"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setMentorFilter(f)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "0",
                    background: mentorFilter === f ? "#0B6B44" : "#141210",
                    color: mentorFilter === f ? "#141210" : "#6A675F",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    border: "none",
                    cursor: "pointer",
                    textTransform: "capitalize",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {filteredMentors.length === 0 ? (
              <p style={{ color: "#6A675F", textAlign: "center", padding: "30px 0" }}>
                No mentor applications found for filter &quot;{mentorFilter}&quot;.
              </p>
            ) : (
              filteredMentors.map((m) => {
                const isPending = m.approval_status === "pending";
                const isApproved = m.approval_status === "approved";
                const isRejected = m.approval_status === "rejected";

                return (
                  <div
                    key={m.profile_id}
                    style={{
                      background: "#fff",
                      padding: "20px",
                      borderRadius: "0",
                      border: "1.5px solid #141210",
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "16px",
                      boxShadow: "2px 2px 0 #141210",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <strong style={{ fontSize: "1.1rem", color: "#141210" }}>
                          {m.first_name} {m.last_name}
                        </strong>
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: "999px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            background: isApproved
                              ? "rgba(72, 187, 120, 0.2)"
                              : isRejected
                              ? "rgba(239, 68, 68, 0.2)"
                              : "rgba(255, 184, 0, 0.2)",
                            color: isApproved ? "#0B6B44" : isRejected ? "#B42318" : "#F5B921",
                            border: `1px solid ${isApproved ? "#0B6B44" : isRejected ? "#B42318" : "#F5B921"}`,
                          }}
                        >
                          {m.approval_status}
                        </span>
                      </div>

                      <p style={{ margin: "4px 0 8px", color: "#0B6B44", fontSize: "0.9rem", fontWeight: 600 }}>
                        {m.headline || "Mentor Application"}
                      </p>
                      {m.bio && <p style={{ margin: "0 0 8px", color: "#6A675F", fontSize: "0.85rem", maxWidth: "600px" }}>{m.bio}</p>}

                      {m.professions && m.professions.length > 0 && (
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          {m.professions.map((prof) => (
                            <span
                              key={prof}
                              style={{
                                padding: "2px 8px",
                                borderRadius: "0",
                                background: "#F6EBDB",
                                color: "#6A675F",
                                fontSize: "0.75rem",
                              }}
                            >
                              {prof}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: "10px" }}>
                      {isPending && (
                        <>
                          <button
                            type="button"
                            disabled={processingId === m.profile_id}
                            onClick={() => handleApproveMentor(m.profile_id)}
                            style={{
                              padding: "10px 20px",
                              borderRadius: "0",
                              background: "#0B6B44",
                              color: "#141210",
                              fontWeight: 700,
                              fontSize: "0.875rem",
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            ✓ Approve Mentor
                          </button>
                          <button
                            type="button"
                            disabled={processingId === m.profile_id}
                            onClick={() => handleRejectMentor(m.profile_id)}
                            style={{
                              padding: "10px 20px",
                              borderRadius: "0",
                              background: "rgba(239, 68, 68, 0.15)",
                              color: "#B42318",
                              border: "1px solid #B42318",
                              fontWeight: 700,
                              fontSize: "0.875rem",
                              cursor: "pointer",
                            }}
                          >
                            ✕ Reject
                          </button>
                        </>
                      )}
                      {isApproved && (
                        <span style={{ color: "#0B6B44", fontWeight: 600, fontSize: "0.875rem" }}>
                          ✓ Mentor Approved & Active
                        </span>
                      )}
                      {isRejected && (
                        <span style={{ color: "#B42318", fontWeight: 600, fontSize: "0.875rem" }}>
                          ✕ Application Rejected
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      )}

      {/* TAB 3: EVENT MANAGEMENT */}
      {activeTab === "events" && (
        <section style={{ maxWidth: "600px", background: "#F6EBDB", padding: "24px", borderRadius: "0" }}>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "16px" }}>Create Event (SRS Phase 1)</h2>
          <form onSubmit={handleCreateEvent} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem" }}>Event Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Jnanana Summit 2026"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "0", background: "#fff", border: "1.5px solid #141210", color: "#141210" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem" }}>Slug</label>
              <input
                type="text"
                placeholder="jnanana-summit-2026"
                value={eventSlug}
                onChange={(e) => setEventSlug(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "0", background: "#fff", border: "1.5px solid #141210", color: "#141210" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem" }}>Date & Time</label>
              <input
                type="datetime-local"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "0", background: "#fff", border: "1.5px solid #141210", color: "#141210" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem" }}>Location</label>
              <input
                type="text"
                placeholder="e.g. Main Auditorium / Hybrid"
                value={eventLoc}
                onChange={(e) => setEventLoc(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "0", background: "#fff", border: "1.5px solid #141210", color: "#141210" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem" }}>Description</label>
              <textarea
                rows={3}
                required
                placeholder="Describe the mentorship event..."
                value={eventDesc}
                onChange={(e) => setEventDesc(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "0", background: "#fff", border: "1.5px solid #141210", color: "#141210" }}
              />
            </div>
            <button
              type="submit"
              disabled={creatingEvent}
              style={{
                padding: "12px",
                borderRadius: "0",
                background: "#F5B921",
                color: "#141210",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
              }}
            >
              {creatingEvent ? "Publishing Event..." : "Publish Event"}
            </button>
          </form>
        </section>
      )}

      {/* TAB 4: TOKEN ALLOCATION CONTROLS */}
      {activeTab === "tokens" && (
        <section style={{ maxWidth: "600px", background: "#F6EBDB", padding: "24px", borderRadius: "0" }}>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "16px" }}>Grant / Deduct Jools</h2>
          <form onSubmit={handleAdjustTokens} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem" }}>Select User</label>
              <select
                value={tokenUserId}
                onChange={(e) => setTokenUserId(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "0", background: "#fff", border: "1.5px solid #141210", color: "#141210" }}
              >
                <option value="">-- Choose User --</option>
                {users.data?.items.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.first_name} {u.last_name} ({u.role}) - {u.id}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem" }}>Token Amount (+ to grant, - to deduct)</label>
              <input
                type="number"
                required
                value={tokenAmount}
                onChange={(e) => setTokenAmount(Number(e.target.value))}
                style={{ width: "100%", padding: "10px", borderRadius: "0", background: "#fff", border: "1.5px solid #141210", color: "#141210" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem" }}>Notes / Reason</label>
              <input
                type="text"
                value={tokenNotes}
                onChange={(e) => setTokenNotes(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "0", background: "#fff", border: "1.5px solid #141210", color: "#141210" }}
              />
            </div>
            <button
              type="submit"
              disabled={adjustingTokens}
              style={{
                padding: "12px",
                borderRadius: "0",
                background: "#F5B921",
                color: "#141210",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
              }}
            >
              {adjustingTokens ? "Processing..." : "Adjust Tokens"}
            </button>
          </form>
        </section>
      )}

      {/* TAB 5: USERS MANAGEMENT */}
      {activeTab === "users" && (
        <section>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "16px" }}>Platform Users ({users.data?.items.length ?? 0})</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {users.data?.items.map((profile) => (
              <div
                key={profile.id}
                style={{
                  background: "#F6EBDB",
                  padding: "16px",
                  borderRadius: "0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <strong style={{ fontSize: "1rem", display: "block" }}>{profile.first_name} {profile.last_name}</strong>
                  <span style={{ fontSize: "0.85rem", color: "#6A675F" }}>
                    Role: <strong>{profile.role}</strong> | ID: {profile.id}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <select
                    value={profile.role}
                    onChange={async (e) => {
                      const targetRole = e.target.value as "student" | "mentor";
                      try {
                        await changeUserRole(profile.id, targetRole, "Admin manually changed user role");
                        setMessage("✓ User role updated successfully!");
                        await users.reload();
                      } catch {
                        setMessage("Failed to update user role");
                      }
                    }}
                    style={{
                      padding: "6px 12px",
                      border: "1.5px solid #141210",
                      background: "#FFFFFF",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      color: "#141210",
                      cursor: "pointer",
                    }}
                  >
                    <option value="student">Student</option>
                    <option value="mentor">Mentor</option>
                  </select>
                  <button
                    onClick={() => {
                      setTokenUserId(profile.id);
                      setActiveTab("tokens");
                    }}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "0",
                      background: "rgba(255,184,0,0.15)",
                      color: "#F5B921",
                      border: "1px solid #F5B921",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Manage Tokens
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
