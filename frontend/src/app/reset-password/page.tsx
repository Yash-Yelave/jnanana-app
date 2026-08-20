"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { Brand } from "@/components/brand";
import { createClient } from "@/lib/supabase/client";
import styles from "../login/page.module.css";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [pending, setPending] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function initSessionCheck() {
      try {
        // 1. Check for ?code= parameter in URL (PKCE flow fallback)
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        if (code) {
          const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);
          if (!exchangeErr) {
            setHasValidSession(true);
            setCheckingSession(false);
            return;
          }
        }

        // 2. Check existing active session (set via /auth/confirm or hash fragment)
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setHasValidSession(true);
        } else {
          // Listen for recovery state change
          const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
            if (event === "PASSWORD_RECOVERY" || s) {
              setHasValidSession(true);
            }
          });
          setTimeout(() => {
            subscription.unsubscribe();
          }, 3000);
        }
      } catch (err) {
        console.error("Session check error:", err);
      } finally {
        setCheckingSession(false);
      }
    }

    initSessionCheck();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setSuccessMsg("");

    const data = new FormData(event.currentTarget);
    const password = String(data.get("password"));
    const confirmPassword = String(data.get("confirm_password"));

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      setPending(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setPending(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message || "Failed to update password. Please request a new reset link.");
        setPending(false);
        return;
      }

      setSuccessMsg("🎉 Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        router.replace("/login?reset=success");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setPending(false);
    }
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

          {checkingSession ? (
            <p style={{ color: "#6A675F", padding: "20px 0" }}>Verifying password reset link…</p>
          ) : !hasValidSession ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", margin: "16px 0" }}>
              <div
                style={{
                  padding: "16px",
                  borderRadius: "0",
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid #EF4444",
                  color: "#EF4444",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                }}
              >
                <AlertCircle size={20} style={{ flexShrink: 0, marginTop: "2px" }} />
                <div style={{ fontSize: "0.9rem", lineHeight: 1.5 }}>
                  <strong>Reset link expired or invalid</strong>
                  <p style={{ margin: "4px 0 0", color: "#F8FAFC" }}>
                    Your password reset link may have expired or already been used. Please request a new link below.
                  </p>
                </div>
              </div>
              <Link
                href="/forgot-password"
                style={{
                  padding: "12px 20px",
                  borderRadius: "0",
                  background: "#F5B921",
                  color: "#000",
                  fontWeight: 700,
                  textAlign: "center",
                  textDecoration: "none",
                  fontSize: "0.95rem",
                }}
              >
                Request New Password Link →
              </Link>
            </div>
          ) : (
            <form onSubmit={submit}>
              <label>
                New password
                <input required minLength={8} name="password" type="password" autoComplete="new-password" placeholder="Enter new password" />
              </label>
              <label>
                Confirm password
                <input required minLength={8} name="confirm_password" type="password" autoComplete="new-password" placeholder="Confirm new password" />
              </label>

              {error && (
                <div style={{ padding: "10px 14px", borderRadius: "0", background: "rgba(239, 68, 68, 0.15)", border: "1px solid #EF4444", color: "#EF4444", fontSize: "0.9rem", marginTop: "12px" }} role="alert">
                  {error}
                </div>
              )}

              {successMsg && (
                <div style={{ padding: "12px 16px", borderRadius: "0", background: "rgba(16, 185, 129, 0.15)", border: "1px solid #10B981", color: "#10B981", fontSize: "0.95rem", marginTop: "12px", display: "flex", alignItems: "center", gap: "8px" }} role="status">
                  <CheckCircle2 size={18} />
                  {successMsg}
                </div>
              )}

              <button disabled={pending || Boolean(successMsg)}>
                {pending ? "Saving…" : "Save password"}
                <span>→</span>
              </button>
            </form>
          )}

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
