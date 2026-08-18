"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowLeft } from "lucide-react";
import { Brand } from "@/components/brand";
import { siteUrl } from "@/lib/env";
import { createClient } from "@/lib/supabase/client";
import styles from "../login/page.module.css";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const email = String(new FormData(event.currentTarget).get("email"));
    const { error } = await createClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl()}/auth/confirm?type=recovery`,
    });
    setMessage(error ? error.message : "Check your email for a password reset link.");
    setPending(false);
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.form}>
          <Brand />
          <div className={styles.copy}>
            <p>ACCOUNT RECOVERY</p>
            <h1>
              Reset your
              <br />
              <em>password.</em>
            </h1>
            <span>We&apos;ll send a secure reset link to your email.</span>
          </div>
          <form onSubmit={submit}>
            <label>
              Email address
              <input required name="email" type="email" autoComplete="email" />
            </label>
            {message && <p className={styles.error} role="status">{message}</p>}
            <button disabled={pending}>
              {pending ? "Sending…" : "Send reset link"}
              <span>→</span>
            </button>
          </form>
          <p className={styles.join}>
            <Link
              className={styles.backLink}
              href="/login"
              onClick={(e) => {
                e.preventDefault();
                router.push("/login");
              }}
            >
              <ArrowLeft size={16} /> Back to login
            </Link>
          </p>
        </div>
        <aside aria-hidden="true" />
      </section>
    </main>
  );
}
