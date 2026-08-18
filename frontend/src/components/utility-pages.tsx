"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
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
import { apiFetch } from "@/lib/api";
import { createClient, publicAsset } from "@/lib/supabase/client";
import type { Booking, Offer, Plan, Profile, Skill } from "@/lib/types";
import { useApi } from "@/lib/use-api";
import styles from "./utility-pages.module.css";

const days = Array.from({ length: 31 }, (_, i) => i + 1);

type Community = {
  id: string;
  name: string;
  description: string;
  image_path: string | null;
  tags: string[];
};

type Conversation = {
  id: string;
  kind: string;
  title: string | null;
};

type ChatMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export function SchedulePage({ booking = false, mentorId }: { booking?: boolean; mentorId?: string }) {
  const [day, setDay] = useState(19);
  const router = useRouter();
  const { data: skills } = useApi<Skill[]>("/skills");
  const { data: bookingData, reload } = useApi<{ items: Booking[] }>("/bookings");
  const offers = useApi<{ items: Offer[] }>("/offers");
  const [error, setError] = useState("");

  async function requestLesson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const start = new Date(`${data.get("date")}T${data.get("time")}`);
    try {
      await apiFetch("/lesson-requests", {
        method: "POST",
        body: JSON.stringify({
          preferred_mentor_id: mentorId ?? null,
          skill_id: data.get("skill_id") || null,
          title: data.get("title"),
          description: data.get("description"),
          requested_start: start.toISOString(),
          requested_end: new Date(start.getTime() + 60 * 60 * 1000).toISOString(),
          proposed_amount_minor: Number(data.get("amount")) * 100,
          currency: "INR",
        }),
      });
      await reload();
      router.push("/schedule");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to request lesson");
    }
  }

  async function updateOffer(offer: Offer, accept: boolean) {
    try {
      if (accept) {
        await apiFetch(`/offers/${offer.id}/accept`, { method: "POST", headers: { "Idempotency-Key": crypto.randomUUID() } });
      } else {
        await apiFetch(`/offers/${offer.id}/status`, { method: "POST", body: JSON.stringify({ status: "rejected" }) });
      }
      await Promise.all([reload(), offers.reload()]);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to update offer");
    }
  }
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
            <form onSubmit={requestLesson}>
            <h2>Availability</h2>
            {booking && <><label>Lesson title<input required name="title" minLength={3} placeholder="What do you want to learn?" /></label><label>Description<textarea required name="description" minLength={10} placeholder="Describe your learning goal" /></label></>}
            <label>
              Category
              <select name="skill_id" required={booking}>
                <option value="">Choose a skill</option>
                {skills?.map((skill) => <option value={skill.id} key={skill.id}>{skill.name}</option>)}
              </select>
            </label>
            <label>
              Date
              <input name="date" type="date" defaultValue="2026-08-19" required={booking} />
            </label>
            <label>
              Time
              <input name="time" type="time" defaultValue="14:00" required={booking} />
            </label>
            {booking && <label>Offer amount (INR)<input required name="amount" type="number" min="0" defaultValue="300" /></label>}
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
            {error && <p className="data-state" role="alert">{error}</p>}
            {booking ? <button className="button button-primary">Request lesson <ArrowRight size={16} /></button> : <><p>{bookingData?.items.length ?? 0} lessons in your schedule</p><h2>Pending offers</h2>{offers.data?.items.filter((offer) => offer.status === "pending").map((offer) => <div className={styles.bill} key={offer.id}><p>{offer.currency} {(offer.amount_minor / 100).toLocaleString()}</p><button className="button button-primary" type="button" onClick={() => void updateOffer(offer, true)}>Accept</button><button className="button button-secondary" type="button" onClick={() => void updateOffer(offer, false)}>Reject</button></div>)}{offers.data?.items.length === 0 && <p>No offers yet.</p>}</>}
            </form>
          </aside>
        </section>
      </main>
    </AppShell>
  );
}

export function SubscriptionPage() {
  const { data: plans, error, loading } = useApi<Plan[]>("/plans");
  const { data: profile } = useApi<Profile>("/me");
  return (
    <AppShell active={profile?.role === "mentor" ? "/mentor/home" : "/dashboard/home"} mentor={profile?.role === "mentor"}>
      <main className={styles.main}>
        <PageTitle>Subscription</PageTitle>
        <header className={styles.planIntro}>
          <span>UPSKILLINK PRO</span>
          <h2>Invest in your growth.</h2>
          <p>Unlock unlimited learning, mentorship and community access.</p>
        </header>
        <section className={styles.plans}>
          {loading && <p className="data-state">Loading plans…</p>}
          {error && <p className="data-state" role="alert">{error}</p>}
          {plans?.map((plan, i) => (
            <article className={i === 1 ? styles.featured : ""} key={plan.id}>
              <small>{i === 1 ? "MOST POPULAR" : "MONTHLY"}</small>
              <h2>{plan.name}</h2>
              <strong>
                {plan.currency} {(plan.price_minor / 100).toLocaleString()}
                <i>/{plan.billing_interval}</i>
              </strong>
              <p>{plan.features[0] ?? "Mentoring membership"}</p>
              <ul>
                {plan.features.map((feature) => <li key={feature}><Check size={16} color="var(--lime)" /> {feature}</li>)}
              </ul>
              <button className={i === 1 ? "button button-primary" : "button button-secondary"} disabled title="Payment provider is not configured">
                Payments coming soon <ArrowRight size={16} />
              </button>
            </article>
          ))}
        </section>
      </main>
    </AppShell>
  );
}

export function EditProfilePage() {
  const { data: profile, error, reload } = useApi<Profile>("/me");
  const [message, setMessage] = useState("");

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(
      Array.from(new FormData(event.currentTarget), ([key, value]) => [key, String(value).trim() || null]),
    );
    try {
      await apiFetch("/me/profile", { method: "PATCH", body: JSON.stringify(data) });
      if (profile?.role === "mentor") {
        await apiFetch("/mentor/profile", {
          method: "PATCH",
          body: JSON.stringify({
            headline: data.headline,
            hourly_rate_minor: Number(data.hourly_rate || 0) * 100,
            languages: String(data.languages ?? "").split(",").map((item) => item.trim()).filter(Boolean),
            professions: String(data.professions ?? "").split(",").map((item) => item.trim()).filter(Boolean),
            companies: String(data.companies ?? "").split(",").map((item) => item.trim()).filter(Boolean),
          }),
        });
      }
      setMessage("Profile saved.");
      await reload();
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "Unable to save profile");
    }
  }

  async function uploadAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !profile) return;
    const path = `${profile.id}/${crypto.randomUUID()}-${file.name.replaceAll(" ", "-")}`;
    const { error: uploadError } = await createClient().storage.from("avatars").upload(path, file, { upsert: false });
    if (uploadError) { setMessage(uploadError.message); return; }
    await apiFetch("/me/profile", { method: "PATCH", body: JSON.stringify({ avatar_path: path }) });
    await reload();
  }

  return (
    <AppShell active={profile?.role === "mentor" ? "/mentor/profile" : "/dashboard/home"} mentor={profile?.role === "mentor"}>
      <main className={styles.main}>
        <PageTitle>Edit Profile</PageTitle>
        {error && <p className="data-state" role="alert">{error}</p>}
        <form className={styles.edit} key={profile?.id} onSubmit={saveProfile}>
          <div className={styles.photo}>
            <Image src={publicAsset("avatars", profile?.avatar_path) ?? "/assets/app/mentor-1.png"} alt="Profile" width={130} height={130} />
            <label className="button button-secondary">Change photo<input type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadAvatar} hidden /></label>
          </div>
          <div className={styles.formGrid}>
            <label>
              First Name
              <input required name="first_name" defaultValue={profile?.first_name} />
            </label>
            <label>
              Last Name
              <input required name="last_name" defaultValue={profile?.last_name} />
            </label>
            <label>
              Username
              <input name="username" defaultValue={profile?.username ?? ""} />
            </label>
            <label>
              Email
              <input type="email" value="Managed by Supabase Auth" disabled />
            </label>
            <label>
              Phone
              <input name="phone" type="tel" defaultValue={profile?.phone ?? ""} />
            </label>
            <label>
              Location
              <input name="location" defaultValue={profile?.location ?? ""} />
            </label>
            <label className={styles.wide}>
              About
              <textarea name="bio" rows={5} defaultValue={profile?.bio ?? ""} />
            </label>
            {profile?.role === "mentor" && <>
              <label>Headline<input name="headline" defaultValue={profile.mentor?.headline ?? ""} /></label>
              <label>Hourly rate (INR)<input name="hourly_rate" type="number" min="0" defaultValue={(profile.mentor?.hourly_rate_minor ?? 0) / 100} /></label>
              <label>Languages<input name="languages" defaultValue={profile.mentor?.languages.join(", ") ?? ""} /></label>
              <label>Professions<input name="professions" defaultValue={profile.mentor?.professions.join(", ") ?? ""} /></label>
              <label className={styles.wide}>Companies<input name="companies" defaultValue={profile.mentor?.companies.join(", ") ?? ""} /></label>
            </>}
          </div>
          {message && <p className="data-state" role="status">{message}</p>}
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
  type Invoice = { id: string; number: string; storage_path: string | null; issued_at: string };
  const { data: wallet } = useApi<{ currency: string; balance_minor: number }>("/wallet");
  const { data: invoices, error } = useApi<Invoice[]>("/invoices");
  const { data: profile } = useApi<Profile>("/me");
  return (
    <AppShell active="/settings" mentor={profile?.role === "mentor"}>
      <main className={styles.main}>
        <PageTitle>Payment</PageTitle>
        <section className={styles.payment}>
          <article>
            <h2>Contact Email</h2>
            <label>
              <input type="radio" name="email" defaultChecked /> Send to my account email
              <br />
              <b>Supabase account email</b>
            </label>
            <label>
              <input type="radio" name="email" /> Send to another email
              <input type="email" placeholder="Email address" />
            </label>
          </article>
          <article>
            <h2>
              Card Details <button className={styles.addCardBtn} type="button" disabled title="Payment provider is not configured">+ Add Payment</button>
            </h2>
            <label className={styles.wallet}>
              <input type="radio" name="card" defaultChecked />
              <b>
                <Wallet size={18} /> Wallet
                <br />
                {wallet?.currency ?? "INR"} {((wallet?.balance_minor ?? 0) / 100).toLocaleString()} available
              </b>
            </label>
            <p>Card payments are unavailable until a payment provider is configured.</p>
          </article>
        </section>
        <section className={styles.invoices}>
          <h2>Invoices</h2>
          {error && <p className="data-state" role="alert">{error}</p>}
          {!error && invoices?.length === 0 && <p className="data-state">No invoices yet.</p>}
          {invoices?.map((invoice) => (
            <div key={invoice.id}>
              <b>
                <Calendar size={16} /> Invoice {invoice.number}
              </b>
              <span>{new Date(invoice.issued_at).toLocaleDateString()}</span>
              <i className={styles.paidStatus}>
                <CheckCircle2 size={16} /> Paid
              </i>
              <button className={styles.downloadBtn} type="button" disabled={!invoice.storage_path}>
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
  const { data: referral, error } = useApi<{ code: string; active: boolean }>("/referrals");
  const { data: wallet } = useApi<{ currency: string; balance_minor: number }>("/wallet");
  const { data: profile } = useApi<Profile>("/me");
  return (
    <AppShell active="/settings" mentor={profile?.role === "mentor"}>
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
              {error ? <b>{error}</b> : <b>{referral?.code ?? "Loading…"} {referral?.active ? "Active" : "Inactive"}</b>}
            </div>
          </article>
          <aside>
            <h2>Available Credit</h2>
            <strong>{wallet?.currency ?? "INR"} {((wallet?.balance_minor ?? 0) / 100).toLocaleString()}</strong>
            <p>Your current balance</p>
            <Link className="button button-primary" href="/payment">
              Add Credits <ArrowUpRight size={16} />
            </Link>
            <h2>Referral Earning</h2>
            <p>Earnings appear in your wallet after qualifying activity.</p>
          </aside>
        </section>
      </main>
    </AppShell>
  );
}

export function ChatPage() {
  const [message, setMessage] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userId, setUserId] = useState<string>();
  const [error, setError] = useState("");
  const { data: profile } = useApi<Profile>("/me");

  useEffect(() => {
    void Promise.all([apiFetch<{ items: Conversation[] }>("/conversations"), createClient().auth.getClaims()])
      .then(([result, auth]) => {
        setConversations(result.items);
        setActiveId(result.items[0]?.id);
        setUserId(auth.data?.claims?.sub);
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load conversations"));
  }, []);

  useEffect(() => {
    if (!activeId) return;
    let current = true;
    const supabase = createClient();
    void apiFetch<{ items: ChatMessage[] }>(`/conversations/${activeId}/messages`)
      .then((result) => current && setMessages(result.items))
      .catch((reason: unknown) => current && setError(reason instanceof Error ? reason.message : "Unable to load messages"));
    const channel = supabase
      .channel(`conversation:${activeId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${activeId}` },
        (payload) => {
          const incoming = payload.new as ChatMessage;
          setMessages((current) => (current.some(({ id }) => id === incoming.id) ? current : [...current, incoming]));
        },
      )
      .subscribe();
    return () => {
      current = false;
      void supabase.removeChannel(channel);
    };
  }, [activeId]);

  async function sendMessage() {
    const body = message.trim();
    if (!activeId || !body) return;
    try {
      const sent = await apiFetch<ChatMessage>(`/conversations/${activeId}/messages`, {
        method: "POST",
        body: JSON.stringify({ body }),
      });
      setMessages((current) => (current.some(({ id }) => id === sent.id) ? current : [...current, sent]));
      setMessage("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to send message");
    }
  }

  const activeConversation = conversations.find(({ id }) => id === activeId);
  return (
    <AppShell active="/chat" mentor={profile?.role === "mentor"}>
      <main className={styles.main}>
        <PageTitle>Chat Room</PageTitle>
        <section className={styles.chat}>
          <aside>
            <nav>
              <b>Direct</b>
              <b>Community</b>
            </nav>
            {conversations.map((conversation, i) => (
              <button
                className={conversation.id === activeId ? styles.selectedChat : ""}
                key={conversation.id}
                onClick={() => {
                  setMessages([]);
                  setActiveId(conversation.id);
                }}
                type="button"
              >
                <Image src={`/assets/app/mentor-${(i % 4) + 1}.png`} alt="" width={48} height={48} />
                <span>
                  <b>{conversation.title ?? "Direct conversation"}</b>
                  <small>{conversation.kind}</small>
                </span>
              </button>
            ))}
            {!conversations.length && !error && <p>Join a community to start chatting.</p>}
          </aside>
          <article>
            <h2>{activeConversation?.title ?? "Conversation"}</h2>
            {error && <p role="alert">{error}</p>}
            <div className={styles.messages}>
              {messages.map((item) => (
                <p
                  key={item.id}
                  style={{
                    alignSelf: item.sender_id === userId ? "flex-end" : "flex-start",
                    background: item.sender_id === userId ? "#efffde" : "#eee",
                  }}
                >
                  {item.body}
                </p>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void sendMessage();
              }}
            >
              <input disabled={!activeId} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write a message" aria-label="Message" />
              <button className={styles.sendBtn} disabled={!activeId || !message.trim()} aria-label="Send message">
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
  const router = useRouter();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [error, setError] = useState("");
  const { data: profile } = useApi<Profile>("/me");

  useEffect(() => {
    void apiFetch<Community[]>("/communities")
      .then(setCommunities)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load communities"));
  }, []);

  async function joinCommunity(communityId: string) {
    try {
      await apiFetch(`/communities/${communityId}/join`, { method: "POST" });
      router.push("/chat");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to join community");
    }
  }

  return (
    <AppShell active="/community" mentor={profile?.role === "mentor"}>
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
          {error && <p role="alert">{error}</p>}
          {communities.map((community) => (
            <article key={community.id}>
              <Image src={community.image_path ?? "/assets/app/course-design.png"} alt="" width={260} height={180} />
              <div>
                <h2>{community.name}</h2>
                <p>{community.description}</p>
                <b>{community.tags.join(" · ")}</b>
              </div>
              <button className="button button-primary" onClick={() => void joinCommunity(community.id)} type="button">
                Join <ArrowRight size={16} />
              </button>
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
        <button className={styles.reportBtn} type="button" disabled>
          <Flag size={16} /> Report a problem
        </button>
      </header>
      <p className="data-state" role="status">Live video is unavailable until a video provider is configured.</p>
      <section>
        <div className={styles.video}>
          <Image src="/assets/app/meeting-hero.png" alt="Video call with tutor" fill priority sizes="75vw" />
          <span>Basics of JS</span>
          <time className={styles.timeTag}>
            <Clock size={15} /> 00:04:24
          </time>
          <nav className={styles.meetingControls}>
            <button className={styles.endCall} type="button" aria-label="End call" disabled>
              <PhoneOff size={20} />
            </button>
            <button type="button" aria-label="Share screen" disabled>
              <Monitor size={20} />
            </button>
            <button type="button" aria-label="Reactions" disabled>
              <Smile size={20} />
            </button>
            <button type="button" aria-label="Search or attach file" disabled>
              <Search size={20} />
            </button>
            <button type="button" aria-label="Mute microphone" disabled>
              <MicOff size={20} />
            </button>
            <button type="button" aria-label="Toggle camera" disabled>
              <Video size={20} />
            </button>
          </nav>
        </div>
        <aside>
          <h2>Jesus Brown</h2>
          <p>Hello, I would like to know you could postpone the lesson to another day?</p>
          <p className={styles.mine}>Yes, of course. I have free time on Thursday at 9 am.</p>
          <textarea aria-label="Meeting chat reply" placeholder="Reply" disabled />
          <button className="button button-primary" type="button" disabled>Reply</button>
        </aside>
      </section>
    </main>
  );
}
