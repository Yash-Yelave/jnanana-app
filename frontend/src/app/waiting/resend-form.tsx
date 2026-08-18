"use client";

import { useState, type FormEvent } from "react";
import { siteUrl } from "@/lib/env";
import { createClient } from "@/lib/supabase/client";
import styles from "./page.module.css";

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
