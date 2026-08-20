"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { getEvents, type EventItem } from "@/lib/api";
import { AppShell } from "@/components/app-shell";
import styles from "./page.module.css";

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getEvents()
      .then(setEvents)
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load events"));
  }, []);

  return (
    <AppShell active="/events">
      <div className={styles.page}>
        <header className="app-head">
          <p className="eyebrow">Jnanana</p>
          <h1>Events</h1>
          <p>Check in at a Jnanana event to receive your Jule Tokens and start requesting mentorship.</p>
        </header>

        {!events && !error && <p className="data-state">Loading events…</p>}

        {error && (
          <p className="data-state" role="alert">
            {error}
          </p>
        )}

        {events?.length === 0 && (
          <div className={styles.empty}>
            <h2>No events scheduled</h2>
            <p>There are no published events right now. Check back soon.</p>
          </div>
        )}

        {events && events.length > 0 && (
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
        )}
      </div>
    </AppShell>
  );
}
