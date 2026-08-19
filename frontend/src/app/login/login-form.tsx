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
  const [isSignUp, setIsSignUp] = useState(false);
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

      if (isSignUp) {
        // Create account flow using sign in credentials
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        router.replace("/onboarding/student");
        return;
      }

      // Standard Sign In flow
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
      setError(loginError instanceof Error ? loginError.message : "Authentication error");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        <button
          type="button"
          onClick={() => { setIsSignUp(false); setError(""); }}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "8px",
            border: "1.5px solid #141210",
            background: !isSignUp ? "#0b6b44" : "#fff",
            color: !isSignUp ? "#fff" : "#141210",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setIsSignUp(true); setError(""); }}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "8px",
            border: "1.5px solid #141210",
            background: isSignUp ? "#0b6b44" : "#fff",
            color: isSignUp ? "#fff" : "#141210",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          New Account
        </button>
      </div>

      <form onSubmit={submit}>
        <label>
          Email address
          <input required name="email" type="email" autoComplete="email" placeholder="you@example.com" />
        </label>
        <label>
          Password
          <input required name="password" type="password" autoComplete="current-password" placeholder="Enter your password" />
        </label>
        {!isSignUp && <Link href="/forgot-password">Forgot password?</Link>}
        {error && <p className={styles.error} role="alert">{error}</p>}
        <button disabled={pending}>
          {pending ? (isSignUp ? "Creating account..." : "Signing in...") : (isSignUp ? "Create Account & Sign In" : "Sign In")} <span>→</span>
        </button>
      </form>
    </div>
  );
}
