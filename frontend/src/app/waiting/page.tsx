import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { ApprovalStatus, BackToLoginButton, ResendForm } from "./resend-form";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Please wait" };

export default async function WaitingPage({ searchParams }: { searchParams: Promise<{ feedback?: string; verify?: string }> }) {
  const params = await searchParams;
  const feedback = Boolean(params.feedback);
  const verifyEmail = params.verify === "email";
  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <Brand />
        <div className={styles.content}>
          <Image src={`/assets/onboarding/${feedback ? "feedback" : "waiting"}.png`} alt="" width={650} height={520} priority />
          {feedback ? (
            <>
              <div className={styles.stars} aria-label="Five out of five stars">
                ★★★★★
              </div>
              <h1>Thank you for your precious feedback!</h1>
              <p>It will help us to improve the experience next time</p>
              <Link href="/dashboard">Back to dashboard →</Link>
            </>
          ) : verifyEmail ? (
            <>
              <h1>Check your email</h1>
              <p>Use the verification link we sent before logging in to your account.</p>
              <ResendForm />
              <BackToLoginButton>Go to login →</BackToLoginButton>
            </>
          ) : (
            <ApprovalStatus />
          )}
        </div>
      </section>
    </main>
  );
}
