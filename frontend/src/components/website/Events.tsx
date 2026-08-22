"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getEvents, type EventItem } from "@/lib/api";
import { Button, Eyebrow, Section, Wrap } from "./ui";
import { Reveal } from "./Reveal";

/**
 * SRS §30 and §12 STEP 2 — an attendee who scans the QR code at an event lands
 * on this page, and the current event has to be visible immediately. Published
 * events only; the section hides itself when there are none.
 */
export function Events() {
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    getEvents()
      .then(setEvents)
      .catch(() => setEvents([]));
  }, []);

  if (events.length === 0) return null;

  return (
    <Section id="events" className="pt-0!">
      <Wrap>
        <Reveal variant="fade-up">
          <Eyebrow className="mb-5.5">Events</Eyebrow>
          <h2 className="mb-5 text-[clamp(38px,5.6vw,72px)]">
            Where it
            <br />
            <span className="text-magenta">actually happens.</span>
          </h2>
          <p className="lead">
            Come to an event, check in, and receive the Jools you spend on mentorship.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.slice(0, 3).map((event, i) => (
            <Reveal key={event.id} delay={i * 80}>
              <article className="flex h-full flex-col border-2 border-edge bg-paper-2 p-7">
                <time
                  dateTime={event.event_date}
                  className="font-mono text-[11px] tracking-[0.2em] text-emerald uppercase"
                >
                  {new Date(event.event_date).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                </time>
                <h3 className="mt-3 text-[22px] leading-snug">{event.name}</h3>
                <p className="mt-1 text-sm text-muted">{event.location}</p>
                <p className="mt-4 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">
                  {event.description}
                </p>
                <Link
                  href={`/events/${event.id}`}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-magenta transition-transform duration-200 hover:translate-x-0.5"
                >
                  View event &rarr;
                </Link>
              </article>
            </Reveal>
          ))}
        </div>
      </Wrap>
    </Section>
  );
}

/**
 * SRS §31 — the app section. This is the other half of the event-day entry
 * path: scan the QR, land here, register.
 */
export function AppCta() {
  return (
    <Section id="app" className="pt-0!">
      <Wrap>
        <Reveal variant="fade-up">
          <div className="border-2 border-edge bg-paper-2 p-[clamp(28px,5vw,64px)]">
            <Eyebrow className="mb-5.5">The App</Eyebrow>
            <h2 className="mb-5 text-[clamp(30px,4.4vw,56px)]">
              Experience Jṉanana
              <br />
              <span className="text-magenta">on the app.</span>
            </h2>
            <ul className="mb-8 grid gap-2.5 text-muted sm:grid-cols-2">
              <li>Manage your profile</li>
              <li>Discover mentors</li>
              <li>Track your Jools</li>
              <li>Request mentorship</li>
              <li>Participate in events</li>
              <li>Follow your request status</li>
            </ul>
            <div className="flex flex-wrap gap-3">
              <Button href="/onboarding/student" variant="magenta">
                Join as a Mentee
              </Button>
              <Button href="/onboarding/mentor" variant="amber">
                Join as a Mentor
              </Button>
            </div>
          </div>
        </Reveal>
      </Wrap>
    </Section>
  );
}
