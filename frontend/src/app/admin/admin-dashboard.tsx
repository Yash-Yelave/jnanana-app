"use client";

import { useState } from "react";
import { Brand } from "@/components/brand";
import { apiFetch } from "@/lib/api";
import type { Profile } from "@/lib/types";
import { useApi } from "@/lib/use-api";
import styles from "./page.module.css";

type Application = { profile_id: string; name: string; headline: string | null; created_at: string };

export function AdminDashboard() {
  const users = useApi<{ items: Profile[] }>("/admin/users");
  const applications = useApi<{ items: Application[] }>("/admin/mentor-applications");
  const [message, setMessage] = useState("");

  async function decide(id: string, status: "approved" | "rejected") {
    const reason = status === "rejected" ? window.prompt("Reason for rejection") : null;
    if (status === "rejected" && !reason) return;
    try {
      await apiFetch(`/admin/mentor-applications/${id}/decision`, { method: "POST", body: JSON.stringify({ status, reason }) });
      setMessage(`Application ${status}.`);
      await Promise.all([users.reload(), applications.reload()]);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to update application"); }
  }

  async function changeRole(profile: Profile) {
    const role = profile.role === "student" ? "mentor" : "student";
    const reason = window.prompt(`Reason for changing this user to ${role}`);
    if (!reason) return;
    try {
      await apiFetch(`/admin/users/${profile.id}/role`, { method: "POST", body: JSON.stringify({ role, reason }) });
      setMessage(`Role changed to ${role}.`);
      await Promise.all([users.reload(), applications.reload()]);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to change role"); }
  }

  return <main className={styles.page}><header><Brand /><h1>Administration</h1></header>{message && <p className="data-state" role="status">{message}</p>}
    <section><h2>Pending mentor applications</h2>{applications.error && <p role="alert">{applications.error}</p>}{applications.data?.items.length === 0 && <p>No pending applications.</p>}{applications.data?.items.map((item) => <article key={item.profile_id}><span><b>{item.name}</b><small>{item.headline ?? "No headline"}</small></span><button onClick={() => void decide(item.profile_id, "approved")}>Approve</button><button onClick={() => void decide(item.profile_id, "rejected")}>Reject</button></article>)}</section>
    <section><h2>Users</h2>{users.error && <p role="alert">{users.error}</p>}{users.data?.items.map((profile) => <article key={profile.id}><span><b>{profile.first_name} {profile.last_name}</b><small>{profile.role} · {profile.onboarding_status}</small></span><button onClick={() => void changeRole(profile)}>Change to {profile.role === "student" ? "mentor" : "student"}</button></article>)}</section>
  </main>;
}
