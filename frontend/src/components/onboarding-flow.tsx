"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Brand } from "@/components/brand";
import { ApiError, apiFetch } from "@/lib/api";
import { siteUrl } from "@/lib/env";
import { createClient } from "@/lib/supabase/client";
import styles from "./onboarding-flow.module.css";

const skills = ["Business management", "Design", "Development", "Marketing"];

function StepHeader({ step, total }: { step: number; total: number }) {
  return <header className={styles.header}><Brand /><span>{step} of {total}</span></header>;
}

function Figure({ learner = false }: { learner?: boolean }) {
  return <aside className={styles.figure}><Image src={`/assets/onboarding/${learner ? "learner" : "mentor"}-figure.png`} alt="" fill priority sizes="(max-width: 800px) 0px, 38vw" /></aside>;
}

function Fields({ mentor = false }: { mentor?: boolean }) {
  return <div className={styles.fields}>
    <label>First Name<input required name="first_name" autoComplete="given-name" placeholder="Kavita" /></label>
    <label>Last Name<input required name="last_name" autoComplete="family-name" placeholder="Patil" /></label>
    <label>Mobile Number<div className={styles.phone}><span>+91</span><input required name="phone" autoComplete="tel" inputMode="tel" placeholder="98765 43210" /></div></label>
    <label>Email<input required name="email" autoComplete="email" type="email" placeholder="kavitapatil@gmail.com" /></label>
    <label>Password<input required name="password" autoComplete="new-password" type="password" minLength={8} placeholder="••••••••" /></label>
    <label className={styles.code}>{mentor ? "Referral" : "Access"} Code<div><input name="referral_code" placeholder={mentor ? "FIRST100" : "AF89f908"} /><span>✓</span></div></label>
  </div>;
}

export function OnboardingFlow({ role }: { role: "student" | "mentor" }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [skill, setSkill] = useState("Design");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function complete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const firstName = String(form.get("first_name"));
    const lastName = String(form.get("last_name"));
    const phone = String(form.get("phone"));
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    const skillSlug = skill.toLowerCase().replaceAll(" ", "-");
    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${siteUrl()}/auth/confirm?next=${role === "mentor" ? "/waiting" : "/dashboard"}`,
          data: {
            role,
            first_name: firstName,
            last_name: lastName,
            phone,
            skill_slug: skillSlug,
            headline: role === "mentor" ? `${skill} mentor` : undefined,
            languages: role === "mentor" ? ["English"] : undefined,
            professions: role === "mentor" ? [skill] : undefined,
          },
        },
      });
      if (signUpError) throw signUpError;

      if (data.session) {
        try {
          await apiFetch("/me");
        } catch (profileError) {
          if (!(profileError instanceof ApiError) || profileError.status !== 404) throw profileError;
          const availableSkills = await apiFetch<Array<{ id: string; slug: string }>>("/skills");
          const selectedSkill = availableSkills.find((item) => item.slug === skillSlug);
          await apiFetch("/me/onboarding", {
            method: "POST",
            body: JSON.stringify({
              role,
              first_name: firstName,
              last_name: lastName,
              phone,
              skill_ids: selectedSkill ? [selectedSkill.id] : [],
              headline: role === "mentor" ? `${skill} mentor` : undefined,
              languages: role === "mentor" ? ["English"] : [],
              professions: role === "mentor" ? [skill] : [],
            }),
          });
        }
      }
      router.push(!data.session ? "/waiting?verify=email" : role === "mentor" ? "/waiting" : "/dashboard");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to create your account");
    } finally {
      setPending(false);
    }
  }

  const isDetails = step === 2;
  const totalSteps = 2;
  const currentStep = isDetails ? 2 : 1;

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <div className={styles.formSide}>
          <StepHeader step={currentStep} total={totalSteps} />
          {isDetails ? (
            <form onSubmit={complete}>
              <h1>
                Tell us about <em>you</em>
              </h1>
              <Fields mentor={role === "mentor"} />
              {error && (
                <p className={styles.error} role="alert">
                  {error}
                </p>
              )}
              <div className={styles.actions}>
                <button type="button" className={styles.back} onClick={() => setStep(1)}>
                  Back
                </button>
                <button disabled={pending}>
                  {pending ? "Creating account…" : "Continue"} <span>→</span>
                </button>
              </div>
            </form>
          ) : (
            <>
              <h1>What a kind of <em>skills</em> you wanna {role === "mentor" ? <em>Teach</em> : "learn"} ?</h1>
              <div className={styles.skills}>
                {skills.map((name, index) => (
                  <button type="button" className={skill === name ? styles.selectedSkill : ""} onClick={() => setSkill(name)} key={name}>
                    <span>{["↗", "✦", "‹/›", "◎"][index]}</span>
                    {name}
                  </button>
                ))}
              </div>
              <div className={styles.dots}>
                <b></b>
                <i></i>
                <i></i>
              </div>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.back}
                  onClick={() => router.push("/login")}
                >
                  ← Back to login
                </button>
                <button type="button" onClick={() => setStep(2)}>
                  Finish <span>→</span>
                </button>
              </div>
            </>
          )}
        </div>
        <Figure learner={isDetails} />
      </section>
    </main>
  );
}
