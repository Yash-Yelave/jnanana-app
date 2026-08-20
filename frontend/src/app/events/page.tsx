"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { getEvents, type EventItem } from "@/lib/api";
import { AppShell } from "@/components/app-shell";

type EventDetail = {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  edition: string;
  date: string;
  targetDate: string;
  time: string;
  location: string;
  description: string;
  highlights?: string[];
  audience?: string[];
  speaker?: {
    name: string;
    role: string;
    title: string;
  };
  seatsBadge?: string;
  primaryBtnText: string;
  primaryBtnLink: string;
  image?: string;
};

const spotlightEvents: EventDetail[] = [
  {
    id: "j-spotlight-edition-1",
    tag: "JNANANA FOUNDATION × ISF JUNICORNS",
    title: "J-SPOTLIGHT Edition 01: Finding the Next Junicorn",
    subtitle: "NATIONAL INNOVATION CONCLAVE • MONTHLY INNOVATION SERIES",
    edition: "EDITION 01 • BENGALURU",
    date: "Saturday, 29 August 2026",
    targetDate: "2026-08-29T16:00:00+05:30",
    time: "4:00 PM – 6:00 PM IST",
    location: "Draper U India, Bangalore",
    description:
      "Empowering India's Next Generation of High-Impact Founders. An exclusive monthly pitch & mentorship conclave connecting curated student innovators with industry chairs, venture capital leads, and global incubation pathways.",
    audience: ["Student Founders", "Deep-Tech Builders", "Patent Innovators", "Startup Researchers"],
    speaker: {
      name: "DR. J.A. CHOWDARY",
      role: "Founder & Chairman, International Startup Foundation",
      title: "Former IT Advisor to Govt of AP & TN | Ecosystem Architect",
    },
    seatsBadge: "ONLY 50 DELEGATE SEATS",
    primaryBtnText: "REQUEST DELEGATE SEAT",
    primaryBtnLink: "https://forms.gle/y5R1jv5FbQuu6VrNA",
    image: "/assets/brand/logo-icon.png",
  },
  {
    id: "junicorn-cohort-3",
    tag: "JUNICORN COHORT 3.0",
    title: "ISF Junicorn Rural Innovation Challenge — Cohort 3.0",
    subtitle: "NATIONAL STUDENT INNOVATION ACCELERATOR",
    edition: "COHORT 3.0 • NATIONAL CONCLAVE",
    date: "Saturday, 26 September 2026",
    targetDate: "2026-09-26T10:00:00+05:30",
    time: "10:00 AM – 5:00 PM IST",
    location: "Bangalore & Hybrid",
    description:
      "Bridging the gap between rural ambition and global opportunity. Empowering young innovators from across 20+ states to transform ideas into viable start-up ventures with live investor pitching.",
    highlights: [
      "25 Hardware and Software breakthrough prototypes cataloged",
      "Monthly J-Spotlight regional pitch meets across tech hubs",
      "Direct pathway to global investor summits in Texas & Dubai",
    ],
    primaryBtnText: "Apply Now (Cohort 3.0)",
    primaryBtnLink: "https://match.myanatomy.in/sc/69eaf7b184db4d003436f748/n",
    image: "/assets/brand/logo-icon.png",
  },
];

export default function EventsPage() {
  const [apiEvents, setApiEvents] = useState<EventItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getEvents()
      .then((data) => setApiEvents(data || []))
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load events"));
  }, []);

  return (
    <AppShell active="/events">
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "16px 0", color: "#141210" }}>
        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <span
            style={{
              padding: "4px 12px",
              borderRadius: "99px",
              background: "#F6EBDB",
              border: "1px solid #141210",
              color: "#141210",
              fontWeight: 700,
              fontSize: "0.8rem",
              textTransform: "uppercase",
              display: "inline-block",
              marginBottom: "8px",
            }}
          >
            ⚡ J-Spotlight & Junicorn Conclaves
          </span>
          <h1 style={{ fontSize: "2.25rem", fontWeight: 800, margin: 0, color: "#141210" }}>
            Upcoming Innovation Events
          </h1>
          <p style={{ color: "#6A675F", margin: "6px 0 0", fontSize: "1rem" }}>
            Check in at a Jnanana event to receive your Jule Tokens and start requesting mentorship.
          </p>
        </div>

        {error && (
          <p className="data-state" role="alert" style={{ color: "#b42318", marginBottom: "24px" }}>
            {error}
          </p>
        )}

        {/* Live Database Events Section if present */}
        {apiEvents.length > 0 && (
          <div style={{ marginBottom: "36px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0B6B44", margin: 0 }}>
              Official Platform Events ({apiEvents.length})
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
              {apiEvents.map((ev) => (
                <div
                  key={ev.id}
                  style={{
                    background: "#FFFFFF",
                    borderRadius: "18px",
                    padding: "24px",
                    border: "1.5px solid #141210",
                    boxShadow: "4px 4px 0 #141210",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: "99px",
                        background: "#062E24",
                        color: "#FFB800",
                        fontSize: "0.75rem",
                        fontWeight: 800,
                        display: "inline-block",
                        marginBottom: "12px",
                      }}
                    >
                      {ev.status.toUpperCase()} EVENT
                    </span>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#062E24", margin: "0 0 8px" }}>
                      {ev.name}
                    </h3>
                    <div style={{ display: "flex", gap: "12px", color: "#6A675F", fontSize: "0.85rem", marginBottom: "12px" }}>
                      <span>📅 {new Date(ev.event_date).toLocaleDateString()}</span>
                      <span>📍 {ev.location}</span>
                    </div>
                    <p style={{ fontSize: "0.925rem", color: "#141210", lineHeight: 1.5, marginBottom: "16px" }}>
                      {ev.description.slice(0, 120)}...
                    </p>
                  </div>
                  <Link
                    href={`/events/${ev.id}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      padding: "10px 18px",
                      borderRadius: "99px",
                      background: "linear-gradient(135deg, #FFB800 0%, #FF8A00 100%)",
                      color: "#000",
                      fontWeight: 800,
                      fontSize: "0.875rem",
                      textDecoration: "none",
                      border: "1.5px solid #141210",
                      boxShadow: "2px 2px 0 #141210",
                    }}
                  >
                    View Details & Check In →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Featured Conclaves */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0B6B44", margin: 0 }}>
            Featured Innovation Conclaves
          </h2>
          {spotlightEvents.map((ev) => (
            <article
              key={ev.id}
              style={{
                background: "#FFFFFF",
                borderRadius: "20px",
                padding: "28px",
                border: "1.5px solid #141210",
                boxShadow: "4px 4px 0 #141210",
              }}
            >
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: "99px",
                  background: "#062E24",
                  color: "#FFB800",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  display: "inline-block",
                  marginBottom: "12px",
                }}
              >
                {ev.tag}
              </span>
              <h3 style={{ fontSize: "1.4rem", fontWeight: 800, margin: "0 0 8px", color: "#062E24" }}>{ev.title}</h3>
              <p style={{ color: "#6A675F", fontSize: "0.95rem", margin: "0 0 16px", lineHeight: 1.5 }}>{ev.description}</p>
              <a
                href={ev.primaryBtnLink}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "10px 20px",
                  borderRadius: "99px",
                  background: "linear-gradient(135deg, #FFB800 0%, #FF8A00 100%)",
                  color: "#000",
                  fontWeight: 800,
                  fontSize: "0.875rem",
                  textDecoration: "none",
                  border: "1.5px solid #141210",
                  boxShadow: "2px 2px 0 #141210",
                }}
              >
                {ev.primaryBtnText} <ArrowRight size={16} />
              </a>
            </article>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
