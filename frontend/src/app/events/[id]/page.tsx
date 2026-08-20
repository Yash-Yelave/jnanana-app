"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { getEvent, type EventItem } from "@/lib/api";
import { AppShell } from "@/components/app-shell";

export default function EventDetailPage() {
  const { id } = useParams() as { id: string };
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getEvent(id)
      .then(setEvent)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <AppShell active="/events">
        <div style={{ padding: "40px", textAlign: "center", color: "#141210" }}>Loading event details...</div>
      </AppShell>
    );
  }

  if (error || !event) {
    return (
      <AppShell active="/events">
        <div style={{ padding: "40px", textAlign: "center", color: "#EF4444" }}>
          <h2>Event Not Found</h2>
          <p>{error || "Unable to load event"}</p>
          <Link href="/dashboard" style={{ color: "#0B6B44", fontWeight: "700", textDecoration: "underline" }}>
            Return to Dashboard
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell active="/events">
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "16px", color: "#141210" }}>
        {/* Event Banner Poster Card */}
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "24px",
            padding: "36px",
            border: "1.5px solid #141210",
            marginBottom: "32px",
            boxShadow: "4px 4px 0 #141210",
          }}
        >
          <span
            style={{
              display: "inline-block",
              padding: "6px 14px",
              borderRadius: "9999px",
              background: "#062E24",
              color: "#FFB800",
              fontSize: "0.85rem",
              fontWeight: "800",
              marginBottom: "20px",
              border: "1px solid #141210",
            }}
          >
            Phase 1 Official Event
          </span>
          <h1 style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "16px", lineHeight: 1.15, color: "#0B6B44" }}>
            {event.name}
          </h1>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", color: "#6A675F", marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Calendar size={18} color="#0B6B44" />
              <span style={{ fontWeight: "700" }}>{new Date(event.event_date).toLocaleDateString("en-US", { dateStyle: "full" })}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <MapPin size={18} color="#0B6B44" />
              <span style={{ fontWeight: "700" }}>{event.location}</span>
            </div>
          </div>

          <p style={{ fontSize: "1.1rem", color: "#141210", lineHeight: 1.6, marginBottom: "32px" }}>
            {event.description}
          </p>

          <div
            style={{
              padding: "24px",
              borderRadius: "18px",
              background: "#F6EBDB",
              border: "1.5px solid #141210",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: "800", color: "#062E24", margin: "0 0 4px" }}>
                Ready to find a mentor?
              </h3>
              <p style={{ margin: 0, color: "#6A675F", fontSize: "0.925rem" }}>
                Connect directly with top startup founders, tech leaders, and industry guides.
              </p>
            </div>
            <Link
              href="/dashboard"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 24px",
                borderRadius: "9999px",
                background: "linear-gradient(135deg, #FFB800 0%, #FF8A00 100%)",
                color: "#000",
                fontWeight: "800",
                fontSize: "0.95rem",
                textDecoration: "none",
                border: "1.5px solid #141210",
                boxShadow: "3px 3px 0 #141210",
              }}
            >
              Browse All Mentors →
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
