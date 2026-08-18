import Image from "next/image";
import Link from "next/link";
import {
  Star,
  CheckCircle2,
  GraduationCap,
  Crown,
  ArrowLeft,
  ArrowUpRight,
  ChevronRight,
  Clock,
  BookOpen,
  Sun,
  Moon,
  Monitor,
  Banknote,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import styles from "./student-pages.module.css";

const mentors = [
  ["Kristin Watson", "mentor-1.png", "Google · Amazon", "200"],
  ["Jacob M.", "mentor-2.png", "Netflix · IBM", "300"],
  ["Michael T.", "mentor-3.png", "IITM · Goldman Sachs", "450"],
  ["Emily R.", "mentor-4.png", "Freelance", "100"],
] as const;

export function StarRating({ rating = 5 }: { rating?: number }) {
  return (
    <span className={styles.starRating} aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={16} className={i < rating ? styles.starFilled : styles.starEmpty} fill={i < rating ? "#ffc107" : "none"} />
      ))}
    </span>
  );
}

export function PageTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1 className={styles.pageTitle}>
      <span className={styles.backBtn}><ArrowLeft size={20} /></span>
      {children}
    </h1>
  );
}

export function MentorDirectory() {
  const filters = (
    <div className={styles.filters}>
      <h2>Category</h2>
      <p>
        <button type="button">Coding</button>
        <button type="button">Marketing</button>
        <button type="button">Music</button>
        <button type="button">Painting</button>
      </p>
      <h2>Sort by</h2>
      <p>
        <button type="button">Relevance</button>
        <button type="button">Price</button>
        <button type="button">Review</button>
      </p>
      <h2>Tutor speaks</h2>
      <p>
        <button type="button">English</button>
        <button type="button">Hindi</button>
        <button type="button">Telugu</button>
      </p>
      <h2>Price</h2>
      <input type="range" aria-label="Maximum price" min="100" max="10000" />
      <h2>Reviews</h2>
      {["1 star & above", "2 star & above", "3 star & above", "4 star & above"].map((x) => (
        <label key={x}>
          <input type="radio" name="review" /> {x}
        </label>
      ))}
    </div>
  );

  return (
    <AppShell active="/mentors" rightRail={filters}>
      <main className={styles.main}>
        <PageTitle>Mentorship</PageTitle>
        <input className={styles.fullSearch} type="search" placeholder="Search mentors or topics" aria-label="Search mentors" />
        <div className={styles.mentorList}>
          {mentors.map(([name, image, companies, price]) => (
            <article className={styles.mentorCard} key={name}>
              <div className={styles.mentorBio}>
                <Image src={`/assets/app/${image}`} alt="" width={76} height={76} />
                <div>
                  <h2>
                    {name} <StarRating rating={5} />
                  </h2>
                  <strong className={styles.verifiedTag}>
                    <GraduationCap size={15} /> Professional <CheckCircle2 size={15} /> Verified
                  </strong>
                </div>
              </div>
              <dl>
                <dt>Language:</dt>
                <dd>
                  <i>English</i> <i>Telugu</i>
                </dd>
                <dt>Profession</dt>
                <dd>
                  <i>SDE 3</i> <i>.net Developer</i> <i>Full Stack</i>
                </dd>
                <dt>Experience</dt>
                <dd>
                  <i>{companies}</i>
                </dd>
              </dl>
              <p>I have a Master degree in Art Education. Book a fully prepared lesson from someone with years of practical teaching experience.</p>
              <Link href={`/mentors/${name.toLowerCase().replaceAll(" ", "-")}`}>
                Show details <ArrowUpRight size={14} />
              </Link>
              <aside>
                <b>Instant lessons</b>
                <b>Mentorship</b>
                <b>Tutorials</b>
                <span>
                  Starting from<strong>₹{price}</strong>per lesson
                </span>
                <Link className={styles.button} href="/lessons/book">
                  Book a lesson <ArrowUpRight size={16} />
                </Link>
              </aside>
            </article>
          ))}
        </div>
      </main>
    </AppShell>
  );
}

const tabs = [
  ["About", "/profile"],
  ["Lessons", "/profile/lessons"],
  ["Feedback", "/profile/feedback"],
  ["Schedule", "/schedule"],
  ["Community", "/community"],
] as const;

export function ProfileView({ mode = "about", mentorDetail = false, mentorApp = false }: { mode?: "about" | "lessons" | "feedback"; mentorDetail?: boolean; mentorApp?: boolean }) {
  const active = mentorDetail ? "/mentors" : mentorApp ? "/mentor/home" : "/dashboard/home";
  return (
    <AppShell active={active} mentor={mentorApp}>
      <main className={styles.main}>
        <div className={styles.titleRow}>
          <PageTitle>{mentorDetail ? "Mentorship" : "Profile"}</PageTitle>
          {!mentorDetail && (
            <Link className={styles.primary} href="/profile/edit">
              Edit Profile
            </Link>
          )}
        </div>
        <section className={styles.profileHero}>
          <Image src="/assets/app/profile-hero.png" alt="Kristin Watson at her desk" fill priority sizes="(max-width: 767px) 100vw, 75vw" />
        </section>
        <section className={styles.profileName}>
          <Image src="/assets/app/mentor-1.png" alt="" width={112} height={112} />
          <div>
            <h2>
              Kristin Watson <CheckCircle2 size={20} className={styles.checkIcon} />
            </h2>
            <p>
              <Crown size={16} /> <b>Top Tutor</b> UI/UX Designer
            </p>
          </div>
          {mentorDetail && <Link className={styles.button} href="/chat">Message</Link>}
        </section>
        <nav className={styles.tabs}>
          {tabs.map(([label, href]) => (
            <Link
              className={mode === label.toLowerCase() ? styles.current : ""}
              href={mentorApp ? "/mentor/lessons" : mentorDetail ? (label === "About" ? "/mentors/kristin-watson" : href) : href}
              key={label}
            >
              {label}
            </Link>
          ))}
        </nav>
        {mode === "about" ? <About /> : mode === "lessons" ? <Lessons /> : <Feedback />}
      </main>
    </AppShell>
  );
}

function About() {
  return (
    <section className={styles.profileGrid}>
      <article className={styles.whitePanel}>
        <dl className={styles.about}>
          <dt>Location & Local Time</dt>
          <dd>
            <i>● Berlin, Germany, GMT+2</i>
          </dd>
          <dt>Experience</dt>
          <dd>8+ years</dd>
          <dt>Skills</dt>
          <dd>
            <i>UI/UX</i> <i>Graphic Design</i> <i>Front-End</i>
          </dd>
          <dt>About</dt>
          <dd>I have Master degree in Art Education. If you book a lesson with me, you can expect a fully prepared lesson from someone who has decades of experience teaching art to all skill levels.</dd>
          <dt>Speaks</dt>
          <dd>
            <i>English</i> <i>Hindi</i>
          </dd>
          <dt>Educational Institutes</dt>
          <dd>Parul University</dd>
          <dt>My teaching materials</dt>
          <dd>
            <i>PDF file</i> <i>Presentation slides/PPT</i> <i>Audio File</i> <i>Video File</i>
          </dd>
        </dl>
      </article>
      <aside className={styles.whitePanel}>
        <h3>Very reliable</h3>
        <b>100% attendance rate</b>
        <hr />
        <p>
          Completed lectures <strong>43</strong>
        </p>
        <p>
          Tutoring Since <strong>Mar, 2020</strong>
        </p>
        <p>
          On Upskillink since <strong>Apr, 2018</strong>
        </p>
      </aside>
    </section>
  );
}

function Lessons() {
  return (
    <section className={styles.profileGrid}>
      <article className={styles.whitePanel}>
        <p className={styles.green}>Skill Level: Beginner</p>
        <h2>Master the basics of Figma and Auto layout</h2>
        <p>Subject <b>UI/UX</b></p>
        <p>Category <b>Design</b></p>
        <p>Dive into the world of advanced UI/UX design with our comprehensive guide on mastering Figma and its powerful Auto Layout feature.</p>
        <h3>What you&apos;ll learn</h3>
        <p>Build flexible, responsive designs that adapt seamlessly to any screen size.</p>
        <footer>
          <Clock size={16} /> 45 mins Language: English <Link href="/lessons/book">Book</Link>
        </footer>
      </article>
      <aside className={styles.whitePanel}>
        <h2>Start learning now</h2>
        <p>🚀 Instant tutoring available</p>
        <p>⚗ Trial lesson available</p>
        <p>₹ 100% Money Back Guarantee</p>
        <Link className={styles.primary} href="/lessons/book">
          Book a lesson <ArrowUpRight size={16} />
        </Link>
      </aside>
    </section>
  );
}

function Feedback() {
  return (
    <section className={styles.profileGrid}>
      <article className={styles.whitePanel}>
        {mentors.concat(mentors.slice(0, 2)).map(([name, image], i) => (
          <div className={styles.review} key={`${name}${i}`}>
            <Image src={`/assets/app/${image}`} alt="" width={52} height={52} />
            <p>
              <b>{name}</b>
              <StarRating rating={5} />
              <br />
              This course took my design skills to the next level! The hands-on approach made my workflow smoother and more efficient.
            </p>
          </div>
        ))}
      </article>
      <aside className={styles.whitePanel}>
        <h2>
          32 Reviews <b>4.7</b>
        </h2>
        <p className={styles.stars}><StarRating rating={5} /></p>
        <p>5 Stars ━━━━</p>
        <p>4 Stars ━━━━</p>
        <p>3 Stars ━━━━</p>
      </aside>
    </section>
  );
}

export function DashboardPage() {
  const leaders = ["Charlie Rawal", "Ariana Agarwal", "Bhubnesh Maharana", "Kiran", "Jacob M."];
  return (
    <AppShell active="/dashboard">
      <main className={styles.main}>
        <PageTitle>Statistics</PageTitle>
        <section className={styles.stats}>
          <div>
            <Banknote size={24} color="var(--lime)" /> <b>₹ 10,000</b>
            <span>Total Earning</span>
          </div>
          <div>
            <Clock size={24} color="var(--lime)" /> <b>240 hrs</b>
            <span>Total Teaching</span>
          </div>
          <div>
            <BookOpen size={24} color="var(--lime)" /> <b>12</b>
            <span>Total lessons</span>
          </div>
        </section>
        <section className={styles.dashboardGrid}>
          <article className={styles.whitePanel}>
            <h2>Hours Spent</h2>
            <div className={styles.chart}>
              {[65, 40, 72, 50, 25, 76, 70].map((height, i) => (
                <i style={{ height: `${height}%` }} key={i}></i>
              ))}
            </div>
            <div className={styles.months}>Jan Feb Mar Apr May Jun Jul</div>
          </article>
          <aside className={styles.credit}>
            <h2>Available Credit</h2>
            <strong>₹2,350</strong>
            <p>Your current balance</p>
            <Link href="/payment">
              Add Credits <ArrowUpRight size={16} />
            </Link>
          </aside>
          <article className={styles.whitePanel}>
            <h2>Leader Board</h2>
            <ol>
              {leaders.map((name, i) => (
                <li key={name}>
                  <span>{i + 1}</span>
                  {name}
                  <b>{(13.45 - i).toFixed(3)}</b>
                </li>
              ))}
            </ol>
          </article>
          <aside className={styles.score}>
            <h2>Credit score</h2>
            <strong>821</strong>
            <p>Your Reputation Points</p>
          </aside>
        </section>
      </main>
    </AppShell>
  );
}

export function SettingsPage() {
  return (
    <AppShell active="/settings">
      <main className={styles.main}>
        <PageTitle>Setting</PageTitle>
        <section className={styles.settings}>
          {[
            ["Notify on updates and activity", "you’ll be notified when anyone accepts your request"],
            ["Send weekly digest", "a weekly update on changes and more"],
            ["Collaborations", "Receive notifications about what’s happening"],
          ].map(([title, copy]) => (
            <label key={title}>
              <span>
                <b>{title}</b>
                <small>{copy}</small>
              </span>
              <input type="checkbox" defaultChecked />
            </label>
          ))}
          <Link href="/referrals">
            <b>Referral</b>
            <small>Refer and Earn</small>
            <ChevronRight size={18} />
          </Link>
          <Link href="/payment">
            <b>Payment</b>
            <small>Check your payment history and settings</small>
            <ChevronRight size={18} />
          </Link>
          <details>
            <summary>
              <b>Logout</b>
              <small>See you Soon!</small>
              <ChevronRight size={18} />
            </summary>
            <div className={styles.logout}>
              <h2>Are you sure you want to log out?</h2>
              <Link className={styles.button} href="/">Log out</Link>
            </div>
          </details>
        </section>
        <section className={styles.settings}>
          <h2>Theme</h2>
          <p>Colour Mode</p>
          <div className={styles.theme}>
            <button type="button">
              <Sun size={16} /> Light mode
            </button>
            <button type="button">
              <Moon size={16} /> Dark mode
            </button>
            <button type="button">
              <Monitor size={16} /> System
            </button>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
