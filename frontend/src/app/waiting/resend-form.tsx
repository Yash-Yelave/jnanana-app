"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { siteUrl } from "@/lib/env";
import { createClient } from "@/lib/supabase/client";
import styles from "./page.module.css";
import type { Profile } from "@/lib/types";
import { useApi } from "@/lib/use-api";

export function ResendForm() {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const email = String(new FormData(event.currentTarget).get("email"));
    const { error } = await createClient().auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${siteUrl()}/auth/confirm` },
    });
    setMessage(error ? error.message : "Verification email sent.");
    setPending(false);
  }

  return <form className={styles.resend} onSubmit={submit}><label>Email address<input required type="email" name="email" autoComplete="email" /></label><button disabled={pending}>{pending ? "Sending…" : "Resend email"}</button>{message && <span role="status">{message}</span>}</form>;
}

export function BackToLoginButton({ children = "Back to login →", className }: { children?: React.ReactNode; className?: string }) {
  const [pending, setPending] = useState(false);

  const handleBackToLogin = async () => {
    setPending(true);
    try {
      await createClient().auth.signOut();
    } catch {
      // Ignore errors if session was missing
    }
    window.location.href = "/login";
  };

  return (
    <button
      type="button"
      className={className}
      onClick={handleBackToLogin}
      disabled={pending}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        marginTop: "16px",
        padding: "14px 28px",
        borderRadius: "999px",
        background: "#0B6B44",
        color: "#141210",
        fontWeight: 800,
        border: 0,
        cursor: "pointer",
        transition: "transform 160ms ease, box-shadow 160ms ease",
      }}
    >
      {pending ? "Navigating…" : children}
    </button>
  );
}

export function ApprovalStatus() {
  const { data } = useApi<Profile>("/me");
  if (data?.mentor?.approval_status === "rejected")
    return (
      <>
        <h1>Application needs attention</h1>
        <p>{data.mentor.rejection_reason ?? "Your mentor application was not approved."}</p>
        <Link href="/mentor/profile">Update mentor profile →</Link>
      </>
    );
  return (
    <>
      <h1>Patience, please!</h1>
      <p>We&apos;re reviewing your mentor profile. We&apos;ll let you know when it is approved.</p>
      <BackToLoginButton />
    </>
  );
}
