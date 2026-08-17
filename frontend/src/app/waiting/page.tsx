import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Brand } from "@/components/brand";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Please wait" };

export default async function WaitingPage({ searchParams }: { searchParams: Promise<{ feedback?: string }> }) {
  const feedback = Boolean((await searchParams).feedback);
  return <main className={styles.page}><section className={styles.panel}>
    <Brand /><div className={styles.content}><Image src={`/assets/onboarding/${feedback ? "feedback" : "waiting"}.png`} alt="" width={650} height={520} priority />
      {feedback ? <><div className={styles.stars} aria-label="Five out of five stars">★★★★★</div><h1>Thank you for your precious feedback!</h1><p>It will help us to improve the experience next time</p><Link href="/dashboard/home">Back to home →</Link></> : <><h1>Patience, please!</h1><p>We&apos;re brewing some digital magic. Your experience is worth the wait!</p><Link href="/waiting?feedback=1">Continue →</Link></>}
    </div>
  </section></main>;
}
