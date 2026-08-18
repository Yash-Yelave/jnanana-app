"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import styles from "./page.module.css";

type Profile = { role: "student" | "mentor"; onboarding_status: "incomplete" | "pending" | "complete" };

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: String(data.get("email")),
        password: String(data.get("password")),
      });
      if (authError) throw authError;

      let profile: Profile;
      try {
        profile = await apiFetch<Profile>("/me");
      } catch (apiError) {
        if (apiError instanceof ApiError && apiError.status === 404) {
          router.replace("/onboarding/student");
          return;
        }
        throw apiError;
      }
      const destination =
        profile.onboarding_status === "pending"
          ? "/waiting"
          : profile.role === "mentor"
            ? "/mentor/home"
            : "/dashboard/home";
      router.replace(destination);
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to log in");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <label>
        Email address
        <input required name="email" type="email" autoComplete="email" placeholder="you@example.com" />
      </label>
      <label>
        Password
        <input required name="password" type="password" autoComplete="current-password" placeholder="Enter your password" />
      </label>
      <Link href="/onboarding/student">Forgot password?</Link>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <button disabled={pending}>{pending ? "Logging inâ€¦" : "Log in"} <span>â†’</span></button>
    </form>
  );
}
