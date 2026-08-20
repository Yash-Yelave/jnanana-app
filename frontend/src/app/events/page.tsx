"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, Clock, ExternalLink, CheckCircle2, Award, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { getEvents, type EventItem } from "@/lib/api";

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

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    function calculate() {
      const difference = +new Date(targetDate) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }
    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return null;

  return (
    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
      {[
        { label: "Days", val: timeLeft.days },
        { label: "Hours", val: timeLeft.hours },
        { label: "Mins", val: timeLeft.minutes },
        { label: "Secs", val: timeLeft.seconds },
      ].map((item) => (
        <div
          key={item.label}
          style={{
            background: "#0F172A",
            borderRadius: "10px",
            padding: "8px 12px",
            border: "1px solid rgba(255, 184, 0, 0.3)",
            textAlign: "center",
            minWidth: "60px",
          }}
        >
          <strong style={{ fontSize: "1.25rem", color: "#FFB800", display: "block", fontWeight: 800, lineHeight: 1 }}>
            {String(item.val).padStart(2, "0")}
          </strong>
          <span style={{ fontSize: "0.65rem", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function EventsPage() {
  const [apiEvents, setApiEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    getEvents()
      .then((data) => setApiEvents(data || []))
      .catch(() => null);
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
            Attend live pitching conclaves, connect with venture chairs, and discover opportunities.
          </p>
        </div>

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

        {/* Featured Spotlight Conclaves */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {spotlightEvents.map((ev) => (
            <article
              key={ev.id}
              style={{
                background: "#1E293B",
                borderRadius: "20px",
                padding: "32px",
                border: "1px solid rgba(255, 184, 0, 0.3)",
                color: "#FFFFFF",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
              }}
            >
              {/* Event Header & Countdown Row */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "20px",
                  marginBottom: "20px",
                  paddingBottom: "20px",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px", flexWrap: "wrap" }}>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "6px",
                        background: "rgba(255, 184, 0, 0.15)",
                        color: "#FFB800",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        border: "1px solid #FFB800",
                      }}
                    >
                      {ev.tag}
                    </span>
                    {ev.seatsBadge && (
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: "6px",
                          background: "rgba(239, 68, 68, 0.2)",
                          color: "#EF4444",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          border: "1px solid #EF4444",
                        }}
                      >
                        🔥 {ev.seatsBadge}
                      </span>
                    )}
                  </div>

                  <h2 style={{ fontSize: "1.6rem", fontWeight: 800, margin: "0 0 6px", color: "#F8FAFC" }}>
                    {ev.title}
                  </h2>
                  <p style={{ color: "#38BDF8", fontSize: "0.875rem", fontWeight: 700, margin: 0 }}>
                    {ev.subtitle}
                  </p>
                </div>

                {/* Countdown Box */}
                <div>
                  <span style={{ fontSize: "0.75rem", color: "#94A3B8", fontWeight: 700, display: "block", marginBottom: "6px" }}>
                    ⏳ LIVE EVENT COUNTDOWN
                  </span>
                  <CountdownTimer targetDate={ev.targetDate} />
                </div>
              </div>

              {/* Event Metadata (Date, Time, Location) */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", marginBottom: "20px", color: "#CBD5E1", fontSize: "0.95rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Calendar size={18} color="#FFB800" />
                  <strong>{ev.date}</strong>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Clock size={18} color="#FFB800" />
                  <span>{ev.time}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <MapPin size={18} color="#FFB800" />
                  <span>{ev.location}</span>
                </div>
              </div>

              {/* Description */}
              <p style={{ fontSize: "1rem", color: "#E2E8F0", lineHeight: 1.6, marginBottom: "20px" }}>
                {ev.description}
              </p>

              {/* Speaker Card if available */}
              {ev.speaker && (
                <div
                  style={{
                    background: "#0F172A",
                    borderRadius: "14px",
                    padding: "16px 20px",
                    border: "1px solid rgba(255, 184, 0, 0.2)",
                    marginBottom: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                  }}
                >
                  <Award size={36} color="#FFB800" style={{ flexShrink: 0 }} />
                  <div>
                    <strong style={{ fontSize: "1rem", color: "#F8FAFC", display: "block" }}>
                      Keynote Speaker: {ev.speaker.name}
                    </strong>
                    <span style={{ fontSize: "0.85rem", color: "#FFB800", fontWeight: 600, display: "block" }}>
                      {ev.speaker.role}
                    </span>
                    <small style={{ fontSize: "0.8rem", color: "#94A3B8" }}>{ev.speaker.title}</small>
                  </div>
                </div>
              )}

              {/* Highlights list if available */}
              {ev.highlights && ev.highlights.length > 0 && (
                <div style={{ marginBottom: "20px" }}>
                  <strong style={{ fontSize: "0.9rem", color: "#FFB800", display: "block", marginBottom: "8px" }}>
                    Key Conclave Highlights:
                  </strong>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {ev.highlights.map((h, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", color: "#CBD5E1" }}>
                        <CheckCircle2 size={16} color="#10B981" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <a
                  href={ev.primaryBtnLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: "12px 24px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #FFB800 0%, #FF8A00 100%)",
                    color: "#000",
                    fontWeight: 800,
                    textDecoration: "none",
                    fontSize: "0.95rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 4px 14px rgba(255, 184, 0, 0.4)",
                  }}
                >
                  {ev.primaryBtnText}
                  <ExternalLink size={16} />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
