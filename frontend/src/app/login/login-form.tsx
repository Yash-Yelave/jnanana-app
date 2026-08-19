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
    const email = String(data.get("email"));
    const password = String(data.get("password"));

    try {
      const supabase = createClient();
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) throw authError;

      const isAdmin = authData.user?.app_metadata?.role === "admin";
      if (isAdmin) {
        router.replace("/admin");
        router.refresh();
        return;
      }

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
            : "/dashboard";
      router.replace(destination);
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in. Please check your credentials.");
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
      <Link href="/forgot-password">Forgot password?</Link>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <button disabled={pending}>
        {pending ? "Signing in..." : "Sign In"} <span>→</span>
      </button>
    </form>
  );
}
