"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowLeft } from "lucide-react";
import { Brand } from "@/components/brand";
import { createClient } from "@/lib/supabase/client";
import styles from "../login/page.module.css";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password"));
    if (password !== String(data.get("confirm_password"))) {
      setError("Passwords do not match.");
      setPending(false);
      return;
    }
    const { error: updateError } = await createClient().auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setPending(false);
      return;
    }
    router.replace("/dashboard/home");
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.form}>
          <Brand />
          <div className={styles.copy}>
            <p>ACCOUNT RECOVERY</p>
            <h1>
              Choose a new
              <br />
              <em>password.</em>
            </h1>
          </div>
          <form onSubmit={submit}>
            <label>
              New password
              <input required minLength={8} name="password" type="password" autoComplete="new-password" />
            </label>
            <label>
              Confirm password
              <input required minLength={8} name="confirm_password" type="password" autoComplete="new-password" />
            </label>
            {error && <p className={styles.error} role="alert">{error}</p>}
            <button disabled={pending}>
              {pending ? "Saving…" : "Save password"}
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
