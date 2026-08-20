"use client";

import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import type { Booking, Mentor } from "@/lib/types";
import { useApi } from "@/lib/use-api";
import styles from "./page.module.css";

function Section({ title, children, href }: { title: string; children: React.ReactNode; href?: string }) {
  return (
    <section className={styles.panel}>
      <header>
        <h2>{title}</h2>
        {href && <Link href={href}>View All</Link>}
      </header>
      {children}
    </section>
  );
}

function RightRail({ bookings, completed }: { bookings: Booking[]; completed: number }) {
  return (
    <div className={styles.rail}>
      <Section title="Achievement">
        <div className={styles.achievement}>
          <strong>{completed}</strong>
          <div>
            <b>Completed lessons</b>
            <span>Your verified learning history</span>
          </div>
        </div>
        <Link className={styles.linkRow} href="/profile/lessons">
          View lessons ›
        </Link>
      </Section>
      <Section title="Schedule" href="/schedule">
        <div className={styles.scheduleList}>
          {bookings.slice(0, 2).map((booking) => (
            <article key={booking.id}>
              <h3>Mentoring session</h3>
              <small>{new Date(booking.starts_at).toLocaleString()}</small>
              <div>
                <span>{booking.status.replaceAll("_", " ")}</span>
                <Link href="/schedule">View</Link>
              </div>
            </article>
          ))}
          {bookings.length === 0 && <p className="data-state">No scheduled lessons.</p>}
        </div>
      </Section>
    </div>
  );
}

export default function StudentHomePage() {
  const { data: courseData } = useApi<Array<{ id: string; title: string }>>("/courses");
  const { data: mentorData } = useApi<{ items: Mentor[] }>("/mentors?limit=4");
  const { data: bookingData } = useApi<{ items: Booking[] }>("/bookings");
  const { data: dashboard } = useApi<{ completed_bookings: number; active_courses: number }>("/dashboard/student");

  const courses = (courseData ?? []).slice(0, 3).map((course) => ["COURSE", course.title, "course-design.png"] as const);
  const mentors = (mentorData?.items ?? [])
    .map((mentor, index) => [mentor.headline ?? "Mentor", `mentor-${(index % 4) + 1}.png`, `${mentor.first_name} ${mentor.last_name}`, mentor.id] as const)
    .slice(0, 4);

  return (
    <AppShell active="/dashboard/home" rightRail={<RightRail bookings={bookingData?.items ?? []} completed={dashboard?.completed_bookings ?? 0} />}>
      <div className={styles.stack}>
        <section className={styles.learning}>
          <h2>What You Want To Learn Today</h2>
          <form>
            <span aria-hidden="true">⌕</span>
            <input aria-label="What do you want to learn?" defaultValue="Basics of JavaScript" />
            <button aria-label="Search">➤</button>
          </form>
          <div className={styles.tags}>
            {["React Basics", "Design Systems", "Web Architecture", "Growth Marketing", "AI Engineering"].map((tag, index) => (
              <span key={index}>
                ⌘ {tag} <b>2K+</b>
              </span>
            ))}
          </div>
        </section>
        <Section title="Popular Course" href="/mentors">
          <div className={styles.courseGrid}>
            {courses.map(([type, title, image]) => (
              <article className={styles.course} key={title}>
                <div>
                  <Image src={`/assets/app/${image}`} alt="" fill sizes="(max-width:767px) 30vw, 220px" />
                </div>
                <small>{type}</small>
                <h3>{title}</h3>
                <p>Published course</p>
              </article>
            ))}
            {courses.length === 0 && <p className="data-state">No published courses yet.</p>}
          </div>
        </Section>
        <Section title="Top Mentors" href="/mentors">
          <div className={styles.mentorGrid}>
            {mentors.map(([role, image, name, id]) => (
              <article key={id}>
                <Image src={`/assets/app/${image}`} alt={name} width={62} height={62} />
                <div>
                  <h3>{name}</h3>
                  <p>
                    ♛ Verified <span>{role}</span>
                  </p>
                </div>
                <Link href={`/mentors/${id}`} aria-label={`View ${name}, ${role}`}>
                  ♟
                </Link>
              </article>
            ))}
            {mentors.length === 0 && <p className="data-state">No approved mentors yet.</p>}
          </div>
        </Section>
        <Section title="Trending Workshops">
          <Link className={styles.workshop} href="/community">
            <Image src="/assets/app/workshop.png" alt="Portrait workshop with Kristin Watson" width={770} height={390} />
            <div>
              <span>
                <b>Portrait Workshop</b>
                <small>by Kristin Watson</small>
              </span>
              <span>
                <b>Design</b>
                <small>Live on @24May at 9:00 PM</small>
              </span>
            </div>
          </Link>
        </Section>
      </div>
    </AppShell>
  );
}
