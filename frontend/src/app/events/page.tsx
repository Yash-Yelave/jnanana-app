"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { getEvents, type EventItem, friendlyError } from "@/lib/api";
import { AppShell } from "@/components/app-shell";
import { BackButton } from "@/components/student-pages";
import styles from "./page.module.css";

/**
 * The conclaves are editorial content rather than platform records: they are
 * announced and take registrations before anyone creates the matching event
 * row, and they link out to their own forms. Platform events — the ones you
 * check in at for Jule Tokens — come from the API above them.
 */
type Conclave = {
  id: string;
  tag: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  highlights?: string[];
  audience?: string[];
  speaker?: { name: string; role: string; title: string };
  seatsBadge?: string;
  ctaText: string;
  ctaLink: string;
};

const conclaves: Conclave[] = [
  {
    id: "j-spotlight-edition-1",
    tag: "Jnanana Foundation × ISF Junicorns",
    title: "J-Spotlight Edition 01: Finding the Next Junicorn",
    date: "Saturday, 29 August 2026",
    time: "4:00 PM – 6:00 PM IST",
    location: "Draper U India, Bangalore",
    description:
      "Empowering India's next generation of high-impact founders. An exclusive monthly pitch and mentorship conclave connecting curated student innovators with industry chairs, venture capital leads, and global incubation pathways.",
    audience: ["Student Founders", "Deep-Tech Builders", "Patent Innovators", "Startup Researchers"],
    speaker: {
      name: "Dr. J.A. Chowdary",
      role: "Founder & Chairman, International Startup Foundation",
      title: "Former IT Advisor to Govt of AP & TN · Ecosystem Architect",
    },
    seatsBadge: "Only 50 delegate seats",
    ctaText: "Request delegate seat",
    ctaLink: "https://forms.gle/y5R1jv5FbQuu6VrNA",
  },
  {
    id: "junicorn-cohort-3",
    tag: "Junicorn Cohort 3.0",
    title: "ISF Junicorn Rural Innovation Challenge — Cohort 3.0",
    date: "Saturday, 26 September 2026",
    time: "10:00 AM – 5:00 PM IST",
    location: "Bangalore & Hybrid",
    description:
      "Bridging the gap between rural ambition and global opportunity. Empowering young innovators from across 20+ states to transform ideas into viable start-up ventures with live investor pitching.",
    highlights: [
      "25 hardware and software breakthrough prototypes cataloged",
      "Monthly J-Spotlight regional pitch meets across tech hubs",
      "Direct pathway to global investor summits in Texas & Dubai",
    ],
    ctaText: "Apply now (Cohort 3.0)",
    ctaLink: "https://match.myanatomy.in/sc/69eaf7b184db4d003436f748/n",
  },
];

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getEvents()
      .then((data) => setEvents(data ?? []))
      .catch((err) => setError(friendlyError(err, "Unable to load events")));
  }, []);

  return (
    <AppShell active="/events">
      <div className={styles.page}>
        <header className="app-head">
          <p className="eyebrow">J-Spotlight &amp; Junicorn Conclaves</p>
          <h1 style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <BackButton backHref="/dashboard" />
            Events
          </h1>
          <p>Check in at a Jnanana event to receive your Jools Tokens and start requesting mentorship.</p>
        </header>

        {!events && !error && <p className="data-state">Loading events…</p>}

        {error && (
          <p className="data-state" role="alert">
            {error}
          </p>
        )}

        {events && events.length > 0 && (
          <section>
            <h2 className={styles.sectionTitle}>Platform events</h2>
            <div className={styles.grid}>
              {events.map((event) => (
                <article className={styles.card} key={event.id}>
                  <span className={styles.status}>{event.status}</span>
                  <h2>{event.name}</h2>
                  <div className={styles.meta}>
                    <span>
                      <Calendar size={16} aria-hidden />
                      {new Date(event.event_date).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                    </span>
                    <span>
                      <MapPin size={16} aria-hidden />
                      {event.location}
                    </span>
                  </div>
                  <p className={styles.blurb}>{event.description}</p>
                  <Link className={styles.cta} href={`/events/${event.id}`}>
                    View event <ArrowRight size={16} aria-hidden />
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}

        {events?.length === 0 && (
          <div className={styles.empty}>
            <h2>No events scheduled</h2>
            <p>There are no published events right now. The conclaves below are still open.</p>
          </div>
        )}

        <section>
          <h2 className={styles.sectionTitle}>Featured conclaves</h2>
          <div className={styles.conclaves}>
            {conclaves.map((item) => (
              <article className={styles.conclave} key={item.id}>
                <span className={styles.tag}>{item.tag}</span>
                <h3>{item.title}</h3>

                <div className={styles.meta}>
                  <span>
                    <Calendar size={16} aria-hidden />
                    {item.date} · {item.time}
                  </span>
                  <span>
                    <MapPin size={16} aria-hidden />
                    {item.location}
                  </span>
                </div>

                <p className={styles.conclaveBlurb}>{item.description}</p>

                {item.speaker && (
                  <div className={styles.speaker}>
                    <strong>{item.speaker.name}</strong>
                    <span>{item.speaker.role}</span>
                    <span>{item.speaker.title}</span>
                  </div>
                )}

                {item.highlights && (
                  <ul className={styles.highlights}>
                    {item.highlights.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                )}

                {item.audience && (
                  <div className={styles.audience}>
                    {item.audience.map((who) => (
                      <span key={who}>{who}</span>
                    ))}
                  </div>
                )}

                <div className={styles.conclaveFoot}>
                  <a className={styles.cta} href={item.ctaLink} target="_blank" rel="noreferrer">
                    {item.ctaText} <ArrowRight size={16} aria-hidden />
                  </a>
                  {item.seatsBadge && <small className={styles.seats}>{item.seatsBadge}</small>}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
