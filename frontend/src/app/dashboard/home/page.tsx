import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Home" };

const courses = [
  ["DESIGN", "UI/UX Design", "course-design.png"],
  ["DATA", "DSA With C++", "course-data.png"],
  ["UI/UX", "Tailwind CSS", "course-css.png"],
] as const;

const mentors = [
  ["UI/UX Designer", "mentor-1.png"], ["Dancer", "mentor-2.png"], [".NET Developer", "mentor-3.png"], ["Musician", "mentor-4.png"],
] as const;

function Section({ title, children, href }: { title: string; children: React.ReactNode; href?: string }) {
  return <section className={styles.panel}><header><h2>{title}</h2>{href && <Link href={href}>View All</Link>}</header>{children}</section>;
}

function RightRail() {
  return <div className={styles.rail}>
    <Section title="Achievement"><div className={styles.achievement}><strong>93.75%</strong><div><b>Foundation of UX Design</b><span>by Google</span></div></div><Link className={styles.linkRow} href="/profile">Add to LinkedIn ›</Link></Section>
    <Section title="Schedule" href="/schedule"><div className={styles.days}>{[["Mon","03"],["Tue","04"],["Wed","05"],["Thu","06"],["Fri","07"],["Sat","08"],["Sun","09"]].map(([day,date])=><span className={day==="Thu"?styles.today:""} key={day}><b>{day}</b><i>{date}</i></span>)}</div><div className={styles.scheduleList}><article><h3>Basics Of JavaScript</h3><small>● March 24 at 4:00 PM</small><div><span>Meeting with Bhubnesh Maharana</span><Link href="/meeting">View</Link></div></article><article><h3>Backend With Django</h3><small>● March 25 at 4:00 PM</small><div><span>Meeting with Bhubnesh Maharana</span><Link href="/meeting">Join</Link></div></article></div></Section>
  </div>;
}

export default function StudentHomePage() {
  return <AppShell active="/dashboard/home" rightRail={<RightRail />}>
    <div className={styles.stack}>
      <section className={styles.proBanner}><div><h1>Become a Pro Member</h1><p>Unlimited access to 2000+ Mentor, Courses<br />Community and Daily Free Lessons.</p><Link href="/subscription">Register Now <span>↗</span></Link></div><Image src="/assets/app/pro-banner.png" alt="Learners connecting online" width={350} height={250} priority /></section>
      <section className={styles.learning}><h2>What You Want To Learn Today</h2><form><span aria-hidden="true">⌕</span><input aria-label="What do you want to learn?" defaultValue="Basics of JavaScript" /><button aria-label="Search">➤</button></form><div className={styles.tags}>{["React Basics","React Basics","React Basics","React Basics","React Basics"].map((tag,index)=><span key={index}>⌘ {tag}<b>2K+</b></span>)}</div></section>
      <Section title="Popular Course" href="/mentors"><div className={styles.courseGrid}>{courses.map(([type,title,image])=><article className={styles.course} key={title}><div><Image src={`/assets/app/${image}`} alt="" fill sizes="(max-width:767px) 30vw, 220px" /></div><small>{type}</small><h3>{title}</h3><p>by Bhubnesh M.</p><span>15 Lessons • 43 Hours</span></article>)}</div></Section>
      <Section title="Top Mentors" href="/mentors"><div className={styles.mentorGrid}>{mentors.map(([role,image])=><article key={role}><Image src={`/assets/app/${image}`} alt="Kristin Watson" width={62} height={62} /><div><h3>Kristin Watson</h3><p>♛ Top Tutor <span>{role}</span></p></div><Link href="/mentors/kristin" aria-label={`View Kristin Watson, ${role}`}>♟</Link></article>)}</div></Section>
      <Section title="Trending Workshops"><Link className={styles.workshop} href="/community"><Image src="/assets/app/workshop.png" alt="Portrait workshop with Kristin Watson" width={770} height={390} /><div><span><b>Portrait Workshop</b><small>by Kristin Watson</small></span><span><b>Design</b><small>Live on @24May at 9:00 PM</small></span></div></Link></Section>
    </div>
  </AppShell>;
}
