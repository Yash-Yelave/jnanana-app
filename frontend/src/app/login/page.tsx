import type { Metadata } from "next";
import Image from "next/image";
import { Brand } from "@/components/brand";
import { LoginForm } from "./login-form";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return <main className={styles.page}><section className={styles.card}>
    <div className={styles.form}><Brand /><div className={styles.copy}><p>WELCOME BACK</p><h1>Continue your<br /><em>learning journey.</em></h1><span>Log in to connect with mentors and keep building your skills.</span></div>
      <LoginForm />
      <p className={styles.join}>New to Jnanana Foundation? <a href="/onboarding/student">Create an account</a></p>
    </div>
    <aside><Image src="/assets/onboarding/mentor-figure.png" alt="A mentor working at a laptop" fill priority sizes="45vw" /></aside>
  </section></main>;
}
