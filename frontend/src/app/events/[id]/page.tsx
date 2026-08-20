"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, CheckCircle, Sparkles, User, ArrowRight } from "lucide-react";
import { getEvent, checkinEvent, type EventItem } from "@/lib/api";
import { AppShell } from "@/components/app-shell";

export default function EventDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkinMessage, setCheckinMessage] = useState<string | null>(null);
  const [tokensGranted, setTokensGranted] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getEvent(id)
      .then(setEvent)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCheckin = async () => {
    if (!id) return;
    setCheckingIn(true);
    setError(null);
    try {
      const res = await checkinEvent(id);
      setCheckinMessage(res.message);
      setTokensGranted(res.tokens_granted);
    } catch (err: any) {
      setError(err.message || "Failed to check in");
    } finally {
      setCheckingIn(false);
    }
  };

  if (loading) {
    return (
      <AppShell active="/events">
        <div style={{ padding: "40px", textAlign: "center", color: "#fff" }}>Loading event details...</div>
      </AppShell>
    );
  }

  if (error || !event) {
    return (
      <AppShell active="/events">
        <div style={{ padding: "40px", textAlign: "center", color: "#ff4d4d" }}>
          <h2>Event Not Found</h2>
          <p>{error || "Unable to load event"}</p>
          <Link href="/dashboard" style={{ color: "#FFB800", textDecoration: "underline" }}>
            Return to Dashboard
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell active="/events">
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "24px", color: "#fff" }}>
        {/* Banner Card */}
        <div
          style={{
            background: "linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)",
            borderRadius: "20px",
            padding: "32px",
            border: "1px solid rgba(255, 184, 0, 0.2)",
            marginBottom: "32px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
          }}
        >
          <span
            style={{
              display: "inline-block",
              padding: "4px 12px",
              borderRadius: "9999px",
              background: "rgba(255, 184, 0, 0.15)",
              color: "#FFB800",
              fontSize: "0.875rem",
              fontWeight: "600",
              marginBottom: "16px",
            }}
          >
            Phase 1 Live Event
          </span>
          <h1 style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "16px", lineHeight: 1.2 }}>
            {event.name}
          </h1>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", color: "#A0AEC0", marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Calendar size={18} color="#FFB800" />
              <span>{new Date(event.event_date).toLocaleDateString("en-US", { dateStyle: "full" })}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <MapPin size={18} color="#FFB800" />
              <span>{event.location}</span>
            </div>
          </div>

          <p style={{ fontSize: "1.1rem", color: "#E2E8F0", lineHeight: 1.6, marginBottom: "28px" }}>
            {event.description}
          </p>

        </div>

        {/* Participating Mentors List */}
        <h2 style={{ fontSize: "1.75rem", fontWeight: "700", marginBottom: "20px" }}>
          Mentors at this Event
        </h2>

        {event.participating_mentors && event.participating_mentors.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
            {event.participating_mentors.map((m: any) => (
              <div
                key={m.id}
                style={{
                  background: "#1E293B",
                  borderRadius: "16px",
                  padding: "20px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                    <Image
                      src={m.avatar_path || "/assets/app/mentor-1.png"}
                      alt={m.first_name}
                      width={52}
                      height={52}
                      style={{ borderRadius: "50%", objectFit: "cover" }}
                    />
                    <div>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: "700", margin: 0 }}>
                        {m.first_name} {m.last_name}
                      </h3>
                      <span style={{ fontSize: "0.85rem", color: "#94A3B8" }}>
                        {m.headline || "Mentor"}
                      </span>
                    </div>
                  </div>
                  <p style={{ fontSize: "0.9rem", color: "#CBD5E1", lineHeight: 1.4, marginBottom: "16px" }}>
                    {m.bio ? m.bio.slice(0, 100) + "..." : "Available for mentorship at this event."}
                  </p>
                </div>

                <Link
                  href={`/mentors/${m.id}?event_id=${event.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "10px 16px",
                    borderRadius: "10px",
                    background: "rgba(255, 184, 0, 0.12)",
                    color: "#FFB800",
                    fontWeight: "600",
                    textDecoration: "none",
                  }}
                >
                  Request Mentorship (10 Jule)
                  <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: "40px",
              background: "#1E293B",
              borderRadius: "16px",
              textAlign: "center",
              color: "#94A3B8",
            }}
          >
            No mentors currently assigned to this event. Explore all mentors from the main discovery tab.
          </div>
        )}
      </div>
    </AppShell>
  );
}
