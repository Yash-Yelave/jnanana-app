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
  const [isSuccess, setIsSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    setIsSuccess(false);
    
    const email = String(new FormData(event.currentTarget).get("email")).trim();
    const redirectUrl = `${siteUrl()}/auth/confirm?type=recovery`;

    const { error } = await createClient().auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      setMessage(error.message || "Failed to send password reset email.");
      setIsSuccess(false);
    } else {
      setMessage("🎉 Password reset link sent! Please check your email inbox to reset your password.");
      setIsSuccess(true);
    }
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
            {message && (
              <p
                style={{
                  padding: "10px 14px",
                  borderRadius: "0",
                  fontSize: "0.9rem",
                  marginTop: "12px",
                  background: isSuccess ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                  color: isSuccess ? "#0B6B44" : "#B42318",
                  border: `1px solid ${isSuccess ? "#0B6B44" : "#B42318"}`,
                }}
                role="status"
              >
                {message}
              </p>
            )}
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
