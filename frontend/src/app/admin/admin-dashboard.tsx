"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Brand } from "@/components/brand";
import {
  apiFetch,
  getAdminMetrics,
  createAdminEvent,
  adjustUserTokens,
  assignMentorToEvent,
} from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import { useApi } from "@/lib/use-api";
import styles from "./page.module.css";

export function AdminDashboard() {
  const users = useApi<{ items: Profile[] }>("/admin/users");
  const [metrics, setMetrics] = useState<Record<string, number> | null>(null);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "events" | "tokens" | "users">("overview");

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
    } catch (err: any) {
      setMessage(err.message || "Failed to create event");
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
      setMessage(`Tokens adjusted successfully! New balance: ${res.new_balance} Jule Tokens`);
      const m = await getAdminMetrics();
      setMetrics(m);
    } catch (err: any) {
      setMessage(err.message || "Failed to adjust tokens");
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

  return (
    <main className={styles.page} style={{ background: "#0F172A", minHeight: "100vh", color: "#F8FAFC", padding: "24px" }}>
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
              borderRadius: "8px",
              background: "linear-gradient(135deg, #FFB800 0%, #FF8A00 100%)",
              color: "#000",
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
              borderRadius: "8px",
              background: "#EF4444",
              color: "#fff",
              fontWeight: 700,
              border: 0,
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      {message && (
        <div style={{ padding: "12px 20px", borderRadius: "8px", background: "rgba(255, 184, 0, 0.15)", border: "1px solid #FFB800", color: "#FFB800", marginBottom: "24px" }}>
          {message}
        </div>
      )}

      {/* Admin Tab Navigation */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        {(["overview", "events", "tokens", "users"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              background: activeTab === tab ? "#FFB800" : "#1E293B",
              color: activeTab === tab ? "#000" : "#94A3B8",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW METRICS */}
      {activeTab === "overview" && (
        <section>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "16px" }}>Platform Overview Metrics</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
            {[
              { label: "Total Users", val: metrics?.total_users ?? 0, color: "#3B82F6" },
              { label: "Total Mentors", val: metrics?.total_mentors ?? 0, color: "#10B981" },
              { label: "Active Events", val: metrics?.active_events ?? 0, color: "#F59E0B" },
              { label: "Event Participants", val: metrics?.event_participants ?? 0, color: "#8B5CF6" },
              { label: "Pending Requests", val: metrics?.pending_requests ?? 0, color: "#EC4899" },
              { label: "Jule Tokens Issued", val: metrics?.jule_tokens_issued ?? 0, color: "#EAB308" },
              { label: "Jule Tokens Spent", val: metrics?.jule_tokens_spent ?? 0, color: "#6366F1" },
            ].map((m) => (
              <div
                key={m.label}
                style={{
                  background: "#1E293B",
                  borderRadius: "12px",
                  padding: "20px",
                  borderLeft: `4px solid ${m.color}`,
                }}
              >
                <span style={{ fontSize: "0.875rem", color: "#94A3B8", display: "block" }}>{m.label}</span>
                <strong style={{ fontSize: "1.75rem", fontWeight: 800 }}>{m.val}</strong>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB 2: EVENT MANAGEMENT */}
      {activeTab === "events" && (
        <section style={{ maxWidth: "600px", background: "#1E293B", padding: "24px", borderRadius: "12px" }}>
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
                style={{ width: "100%", padding: "10px", borderRadius: "6px", background: "#0F172A", border: "1px solid #334155", color: "#fff" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem" }}>Slug</label>
              <input
                type="text"
                placeholder="jnanana-summit-2026"
                value={eventSlug}
                onChange={(e) => setEventSlug(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", background: "#0F172A", border: "1px solid #334155", color: "#fff" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem" }}>Date & Time</label>
              <input
                type="datetime-local"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", background: "#0F172A", border: "1px solid #334155", color: "#fff" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem" }}>Location</label>
              <input
                type="text"
                placeholder="e.g. Main Auditorium / Hybrid"
                value={eventLoc}
                onChange={(e) => setEventLoc(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", background: "#0F172A", border: "1px solid #334155", color: "#fff" }}
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
                style={{ width: "100%", padding: "10px", borderRadius: "6px", background: "#0F172A", border: "1px solid #334155", color: "#fff" }}
              />
            </div>
            <button
              type="submit"
              disabled={creatingEvent}
              style={{
                padding: "12px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #FFB800 0%, #FF8A00 100%)",
                color: "#000",
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

      {/* TAB 3: TOKEN ALLOCATION CONTROLS */}
      {activeTab === "tokens" && (
        <section style={{ maxWidth: "600px", background: "#1E293B", padding: "24px", borderRadius: "12px" }}>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "16px" }}>Grant / Deduct Jule Tokens</h2>
          <form onSubmit={handleAdjustTokens} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem" }}>Select User</label>
              <select
                value={tokenUserId}
                onChange={(e) => setTokenUserId(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", background: "#0F172A", border: "1px solid #334155", color: "#fff" }}
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
                style={{ width: "100%", padding: "10px", borderRadius: "6px", background: "#0F172A", border: "1px solid #334155", color: "#fff" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "0.875rem" }}>Notes / Reason</label>
              <input
                type="text"
                value={tokenNotes}
                onChange={(e) => setTokenNotes(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", background: "#0F172A", border: "1px solid #334155", color: "#fff" }}
              />
            </div>
            <button
              type="submit"
              disabled={adjustingTokens}
              style={{
                padding: "12px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #FFB800 0%, #FF8A00 100%)",
                color: "#000",
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

      {/* TAB 4: USERS MANAGEMENT */}
      {activeTab === "users" && (
        <section>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "16px" }}>Platform Users ({users.data?.items.length ?? 0})</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {users.data?.items.map((profile) => (
              <div
                key={profile.id}
                style={{
                  background: "#1E293B",
                  padding: "16px",
                  borderRadius: "8px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <strong style={{ fontSize: "1rem", display: "block" }}>{profile.first_name} {profile.last_name}</strong>
                  <span style={{ fontSize: "0.85rem", color: "#94A3B8" }}>
                    Role: <strong>{profile.role}</strong> | ID: {profile.id}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setTokenUserId(profile.id);
                    setActiveTab("tokens");
                  }}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    background: "rgba(255,184,0,0.15)",
                    color: "#FFB800",
                    border: "1px solid #FFB800",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Manage Tokens
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
