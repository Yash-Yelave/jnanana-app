"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Brand } from "@/components/brand";
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
    <label>First Name<input required placeholder="Bhubnesh" /></label>
    <label>Last Name<input required placeholder="Sharma" /></label>
    <label>Mobile Number<div className={styles.phone}><span>+91</span><input required inputMode="tel" placeholder="98765 43210" /></div></label>
    <label>Email<input required type="email" placeholder="bhubnesh2002@gmail.com" /></label>
    <label>Password<input required type="password" minLength={8} placeholder="••••••••" /></label>
    <label className={styles.code}>{mentor ? "Referral" : "Access"} Code<div><input placeholder={mentor ? "FIRST100" : "AF89f908"} /><span>✓</span></div></label>
  </div>;
}

export function OnboardingFlow({ role }: { role: "student" | "mentor" }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [skill, setSkill] = useState("Design");
  const total = role === "student" ? 3 : 3;

  if (role === "student" && step === 0) return <main className={styles.page}><section className={`${styles.panel} ${styles.rolePanel}`}>
    <StepHeader step={1} total={3} />
    <h1>Choose Your Side</h1>
    <div className={styles.roles}>
      {(["student", "mentor"] as const).map((value) => <article className={value === "student" ? styles.selected : ""} key={value}>
        <Image src={`/assets/onboarding/${value === "student" ? "learner" : "tutor"}-choice.png`} alt="" width={280} height={210} />
        <h2>{value === "student" ? "Learner" : "Tutor"}</h2>
        <ul><li>Learn from skilled mentors</li><li>Book sessions at your pace</li><li>Grow with practical guidance</li></ul>
        <button type="button" onClick={() => value === "student" ? setStep(1) : router.push("/onboarding/mentor")}>Continue <span>→</span></button>
      </article>)}
    </div>
  </section></main>;

  const detailsStep = step === 2;
  return <main className={styles.page}><section className={styles.panel}>
    <div className={styles.formSide}>
      <StepHeader step={detailsStep ? (role === "mentor" ? 2 : 3) : (role === "mentor" ? 1 : 2)} total={total} />
      {detailsStep ? <form onSubmit={(event) => { event.preventDefault(); router.push("/waiting"); }}>
        <h1>Tell us about <em>you</em></h1><Fields mentor={role === "mentor"} />
        <div className={styles.actions}><button type="button" className={styles.back} onClick={() => setStep(1)}>Back</button><button>Continue <span>→</span></button></div>
      </form> : <>
        <h1>What a kind of <em>skills</em> you wanna {role === "mentor" ? <em>Teach</em> : "learn"} ?</h1>
        <div className={styles.skills}>{skills.map((name, index) => <button type="button" className={skill === name ? styles.selectedSkill : ""} onClick={() => setSkill(name)} key={name}><span>{["↗", "✦", "‹/›", "◎"][index]}</span>{name}</button>)}</div>
        <div className={styles.dots}><b></b><i></i><i></i></div>
        <div className={styles.actions}><button type="button" className={styles.back} onClick={() => role === "student" ? setStep(0) : router.push("/login")}>Back</button><button type="button" onClick={() => setStep(2)}>Finish <span>→</span></button></div>
      </>}
    </div>
    <Figure learner={detailsStep} />
  </section></main>;
}
