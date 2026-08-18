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

export function ApprovalStatus() {
  const { data } = useApi<Profile>("/me");
  if (data?.mentor?.approval_status === "rejected") return <><h1>Application needs attention</h1><p>{data.mentor.rejection_reason ?? "Your mentor application was not approved."}</p><Link href="/mentor/profile">Update mentor profile →</Link></>;
  return <><h1>Patience, please!</h1><p>We&apos;re reviewing your mentor profile. We&apos;ll let you know when it is approved.</p><Link href="/login">Back to login →</Link></>;
}
