"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Calendar, MapPin, CheckCircle, Sparkles, ArrowRight } from "lucide-react";
import { getEvent, getMyParticipation, checkinEvent, type EventItem, friendlyError } from "@/lib/api";
import { AppShell } from "@/components/app-shell";
import styles from "./page.module.css";

export default function EventDetailPage() {
  const { id } = useParams() as { id: string };
  const [event, setEvent] = useState<EventItem | null>(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [tokensGranted, setTokensGranted] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(
    () =>
      Promise.all([getEvent(id), getMyParticipation(id).catch(() => null)])
        .then(([detail, participation]) => {
          setEvent(detail);
          setCheckedIn(participation?.checkin_status === "checked_in");
        })
        .catch((err: unknown) => setError(friendlyError(err, "Unable to load this event")))
        .finally(() => setLoading(false)),
    [id],
  );

  useEffect(() => {
    if (!id) return;
    load();
  }, [id, load]);

  const handleCheckin = async () => {
    setCheckingIn(true);
    setActionError(null);
    try {
      const res = await checkinEvent(id);
      setCheckedIn(true);
      setTokensGranted(res.tokens_granted);
    } catch (err) {
      setActionError(friendlyError(err, "Check-in failed. Please try again."));
    } finally {
      setCheckingIn(false);
    }
  };

  if (loading) {
    return (
      <AppShell active="/events">
        <p className="data-state">Loading event…</p>
      </AppShell>
    );
  }

  if (error || !event) {
    return (
      <AppShell active="/events">
        <div className={styles.empty}>
          <h2>Event not found</h2>
          <p>{error ?? "We couldn't load this event."}</p>
          <Link className={styles.checkinButton} href="/events">
            Back to events
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell active="/events">
      <div className={styles.page}>
        <article className={styles.banner}>
          <span className={styles.tag}>Jnanana event</span>
          <h1>{event.name}</h1>

          <div className={styles.meta}>
            <span>
              <Calendar size={18} aria-hidden />
              {new Date(event.event_date).toLocaleDateString("en-IN", { dateStyle: "full" })}
            </span>
            <span>
              <MapPin size={18} aria-hidden />
              {event.location}
            </span>
          </div>

          <p className={styles.description}>{event.description}</p>

          {/* B1 — check-in is what puts Jule Tokens in a mentee's wallet. */}
          {checkedIn ? (
            <div className={styles.checkedIn}>
              <CheckCircle size={24} aria-hidden />
              <div>
                <strong>You&rsquo;re checked in</strong>
                <p>
                  {tokensGranted
                    ? `${tokensGranted} Jule Tokens have been added to your wallet.`
                    : "Your attendance is verified."}
                </p>
              </div>
            </div>
          ) : (
            <button type="button" className={styles.checkinButton} onClick={handleCheckin} disabled={checkingIn}>
              <Sparkles size={18} aria-hidden />
              {checkingIn ? "Checking in…" : "Check in & claim your Jule Tokens"}
            </button>
          )}

          {actionError && (
            <p className={styles.error} role="alert">
              {actionError}
            </p>
          )}
        </article>

        <section className={styles.discover}>
          <div>
            <h2>Ready to find a mentor?</h2>
            <p>Connect directly with startup founders, tech leaders and industry guides using your Jule Tokens.</p>
          </div>
          <Link className={styles.discoverLink} href="/dashboard">
            Browse mentors <ArrowRight size={18} aria-hidden />
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
