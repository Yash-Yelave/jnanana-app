"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Send,
  PhoneOff,
  Monitor,
  Smile,
  Search,
  MicOff,
  Video,
  Flag,
  Wallet,
  CheckCircle2,
  ArrowRight,
  ArrowUpRight,
  Clock,
  Calendar,
  Download,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageTitle } from "@/components/student-pages";
import styles from "./utility-pages.module.css";

const days = Array.from({ length: 31 }, (_, i) => i + 1);

export function SchedulePage({ booking = false }: { booking?: boolean }) {
  const [day, setDay] = useState(19);
  return (
    <AppShell active="/mentors">
      <main className={styles.main}>
        <PageTitle>{booking ? "Book a lesson" : "Schedule"}</PageTitle>
        <section className={styles.schedule}>
          <article>
            <div className={styles.monthHeader}>
              <h2>January 2022</h2>
              <div className={styles.navBtns}>
                <button type="button" aria-label="Previous month">
                  <ChevronLeft size={18} />
                </button>
                <button type="button" aria-label="Next month">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
            <div className={styles.week}>
              <b>Sun</b>
              <b>Mon</b>
              <b>Tue</b>
              <b>Wed</b>
              <b>Thu</b>
              <b>Fri</b>
              <b>Sat</b>
              {days.map((x) => (
                <button className={day === x ? styles.selected : ""} onClick={() => setDay(x)} key={x}>
                  {x}
                </button>
              ))}
            </div>
          </article>
          <aside>
            <h2>Availability</h2>
            <label>
              Category
              <select>
                <option>UI/UX Design</option>
                <option>Development</option>
              </select>
            </label>
            <label>
              Date
              <input type="date" defaultValue="2026-08-19" />
            </label>
            <label>
              Time
              <input type="time" defaultValue="14:00" />
            </label>
            <div className={styles.bill}>
              <h2>Bill</h2>
              <p>
                Base Charge <b>₹300</b>
              </p>
              <p>
                Hourly Charge <b>₹20</b>
              </p>
              <p>
                Streak benefit <b>-₹20</b>
              </p>
              <strong>Total ₹300</strong>
            </div>
            <Link className="button button-primary" href="/payment">
              Pay <ArrowRight size={16} />
            </Link>
          </aside>
        </section>
      </main>
    </AppShell>
  );
}

export function SubscriptionPage() {
  return (
    <AppShell active="/dashboard/home">
      <main className={styles.main}>
        <PageTitle>Subscription</PageTitle>
        <header className={styles.planIntro}>
          <span>UPSKILLINK PRO</span>
          <h2>Invest in your growth.</h2>
          <p>Unlock unlimited learning, mentorship and community access.</p>
        </header>
        <section className={styles.plans}>
          {[
            ["Basic", "₹499", "Essential courses and community access"],
            ["Professional", "₹999", "Everything in Basic plus monthly mentorship"],
            ["Premium", "₹1,499", "Unlimited mentorship and priority booking"],
          ].map(([name, price, copy], i) => (
            <article className={i === 1 ? styles.featured : ""} key={name}>
              <small>{i === 1 ? "MOST POPULAR" : "MONTHLY"}</small>
              <h2>{name}</h2>
              <strong>
                {price}
                <i>/month</i>
              </strong>
              <p>{copy}</p>
              <ul>
                <li>
                  <Check size={16} color="var(--lime)" /> Access all learning tracks
                </li>
                <li>
                  <Check size={16} color="var(--lime)" /> Verified mentor network
                </li>
                <li>
                  <Check size={16} color="var(--lime)" /> Community rooms
                </li>
                <li>
                  <Check size={16} color="var(--lime)" /> Progress analytics
                </li>
              </ul>
              <Link className={i === 1 ? "button button-primary" : "button button-secondary"} href="/payment">
                Choose {name} <ArrowRight size={16} />
              </Link>
            </article>
          ))}
        </section>
      </main>
    </AppShell>
  );
}

export function EditProfilePage() {
  return (
    <AppShell active="/dashboard/home">
      <main className={styles.main}>
        <PageTitle>Edit Profile</PageTitle>
        <form className={styles.edit}>
          <div className={styles.photo}>
            <Image src="/assets/app/mentor-1.png" alt="Profile" width={130} height={130} />
            <button className="button button-secondary" type="button">
              Change photo
            </button>
          </div>
          <div className={styles.formGrid}>
            <label>
              First Name
              <input defaultValue="Kristin" />
            </label>
            <label>
              Last Name
              <input defaultValue="Watson" />
            </label>
            <label>
              Username
              <input defaultValue="intBhubnesh" />
            </label>
            <label>
              Email
              <input type="email" defaultValue="bhubnesh2002@gmail.com" />
            </label>
            <label>
              Phone
              <input type="tel" defaultValue="+91 98765 43210" />
            </label>
            <label>
              Location
              <input defaultValue="Berlin, Germany" />
            </label>
            <label className={styles.wide}>
              About
              <textarea rows={5} defaultValue="UI/UX designer and lifelong learner." />
            </label>
          </div>
          <div className={styles.actions}>
            <Link className="button button-secondary" href="/profile">
              Cancel
            </Link>
            <button className="button button-primary">Save changes</button>
          </div>
        </form>
      </main>
    </AppShell>
  );
}

export function PaymentPage() {
  return (
    <AppShell active="/settings">
      <main className={styles.main}>
        <PageTitle>Payment</PageTitle>
        <section className={styles.payment}>
          <article>
            <h2>Contact Email</h2>
            <label>
              <input type="radio" name="email" defaultChecked /> Send to my account email
              <br />
              <b>bhubnesh2002@gmail.com</b>
            </label>
            <label>
              <input type="radio" name="email" /> Send to another email
              <input type="email" placeholder="Email address" />
            </label>
          </article>
          <article>
            <h2>
              Card Details <button className={styles.addCardBtn} type="button">+ Add Payment</button>
            </h2>
            <label className={styles.wallet}>
              <input type="radio" name="card" defaultChecked />
              <b>
                <Wallet size={18} /> Wallet
                <br />
                Get 50 reputation points
              </b>
            </label>
            <label>
              <input type="radio" name="card" />
              <b>
                VISA **** 3278
                <br />
                Get 50 reputation points
              </b>
            </label>
          </article>
        </section>
        <section className={styles.invoices}>
          <h2>Invoices</h2>
          {["Jun 10, 2022", "May 10, 2022", "Apr 10, 2022"].map((date, i) => (
            <div key={date}>
              <b>
                <Calendar size={16} /> Basic Plan - June 2022
              </b>
              <strong>{i === 1 ? "₹1,440.00" : "₹144.00"}</strong>
              <span>{date}</span>
              <i className={styles.paidStatus}>
                <CheckCircle2 size={16} /> Paid
              </i>
              <button className={styles.downloadBtn} type="button">
                <Download size={14} /> Download
              </button>
            </div>
          ))}
        </section>
      </main>
    </AppShell>
  );
}

export function ReferralsPage() {
  return (
    <AppShell active="/settings">
      <main className={styles.main}>
        <PageTitle>Referral</PageTitle>
        <section className={styles.referralHero}>
          <div>
            <h2>Become a Pro Member</h2>
            <p>Refer and Earn Wallet points every time your friend spends.</p>
            <b>● Earn +25 wallet points for first referral</b>
            <b>● Earn 10% of what your friend spends</b>
          </div>
          <Image src="/assets/onboarding/waiting.png" alt="" width={350} height={260} />
        </section>
        <section className={styles.referralBody}>
          <article>
            <h2>How Referral Works</h2>
            <Image src="/assets/app/workshop.png" alt="Learner working in a library" width={850} height={450} />
            <h2>Referral Codes</h2>
            <div className={styles.codes}>
              <b>Attend 10 Lessons in a Week 4/5</b>
              <b>Foundation of UX Design 4/5</b>
              <b>FDS34NJDS 4/5</b>
            </div>
          </article>
          <aside>
            <h2>Available Credit</h2>
            <strong>₹2,350</strong>
            <p>Your current balance</p>
            <Link className="button button-primary" href="/payment">
              Add Credits <ArrowUpRight size={16} />
            </Link>
            <h2>Referral Earning</h2>
            {["Joel Becker", "Emily R.", "Jacob M."].map((x) => (
              <p key={x}>
                {x}
                <b>+ ₹32</b>
              </p>
            ))}
          </aside>
        </section>
      </main>
    </AppShell>
  );
}

export function ChatPage() {
  const [message, setMessage] = useState("");
  return (
    <AppShell active="/chat">
      <main className={styles.main}>
        <PageTitle>Chat Room</PageTitle>
        <section className={styles.chat}>
          <aside>
            <nav>
              <b>Direct</b>
              <b>Community</b>
            </nav>
            {["Blender Guilt", "Canvas Art", "Startup Strategists", "Bessie’s Group"].map((x, i) => (
              <button className={i === 0 ? styles.selectedChat : ""} key={x}>
                <Image src={`/assets/app/mentor-${(i % 4) + 1}.png`} alt="" width={48} height={48} />
                <span>
                  <b>{x}</b>
                  <small>{i + 2}m ago</small>
                </span>
              </button>
            ))}
          </aside>
          <article>
            <h2>Blender Guilt</h2>
            <div className={styles.messages}>
              <p>Hello, would you like to know if you could postpone the lesson to another day?</p>
              <p>I have free time on Thursday at 9 am</p>
              <p>Can you share the recorded lecture of the lessons?</p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setMessage("");
              }}
            >
              <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write a message" aria-label="Message" />
              <button className={styles.sendBtn} aria-label="Send message">
                <Send size={18} />
              </button>
            </form>
          </article>
        </section>
      </main>
    </AppShell>
  );
}

export function CommunityPage() {
  return (
    <AppShell active="/community">
      <main className={styles.main}>
        <PageTitle>Open Mic</PageTitle>
        <section className={styles.community}>
          <header>
            <span>COMMUNITY</span>
            <h2>
              Find your people.
              <br />
              Build something together.
            </h2>
            <p>Join rooms created around the skills and ideas you care about.</p>
          </header>
          {[
            ["Blender Guilt", "3D Modeling · Texturing Tips"],
            ["AR x VR World", "AR Games · Beta Testing"],
            ["Startup Strategists", "Business · Growth"],
          ].map(([name, tags], i) => (
            <article key={name}>
              <Image src={`/assets/app/course-${["design", "css", "data"][i]}.png`} alt="" width={260} height={180} />
              <div>
                <h2>{name}</h2>
                <p>A supportive community to share progress, discuss challenges and exchange feedback.</p>
                <b>{tags}</b>
              </div>
              <Link className="button button-primary" href="/chat">
                Join <ArrowRight size={16} />
              </Link>
            </article>
          ))}
        </section>
      </main>
    </AppShell>
  );
}

export function MeetingPage() {
  return (
    <main className={styles.meeting}>
      <header>
        <PageTitle>Basic Of JavaScript</PageTitle>
        <button className={styles.reportBtn} type="button">
          <Flag size={16} /> Report a problem
        </button>
      </header>
      <section>
        <div className={styles.video}>
          <Image src="/assets/app/meeting-hero.png" alt="Video call with tutor" fill priority sizes="75vw" />
          <span>Basics of JS</span>
          <time className={styles.timeTag}>
            <Clock size={15} /> 00:04:24
          </time>
          <nav className={styles.meetingControls}>
            <button className={styles.endCall} type="button" aria-label="End call">
              <PhoneOff size={20} />
            </button>
            <button type="button" aria-label="Share screen">
              <Monitor size={20} />
            </button>
            <button type="button" aria-label="Reactions">
              <Smile size={20} />
            </button>
            <button type="button" aria-label="Search or attach file">
              <Search size={20} />
            </button>
            <button type="button" aria-label="Mute microphone">
              <MicOff size={20} />
            </button>
            <button type="button" aria-label="Toggle camera">
              <Video size={20} />
            </button>
          </nav>
        </div>
        <aside>
          <h2>Jesus Brown</h2>
          <p>Hello, I would like to know you could postpone the lesson to another day?</p>
          <p className={styles.mine}>Yes, of course. I have free time on Thursday at 9 am.</p>
          <textarea aria-label="Meeting chat reply" placeholder="Reply" />
          <button className="button button-primary" type="button">Reply</button>
        </aside>
      </section>
    </main>
  );
}
