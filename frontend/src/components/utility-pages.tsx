"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { AppShell } from "@/components/app-shell";
import { PageTitle } from "@/components/student-pages";
import { apiFetch } from "@/lib/api";
import { createClient, publicAsset } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import { useApi } from "@/lib/use-api";
import styles from "./utility-pages.module.css";

export function EditProfilePage() {
  const { data: profile, error, reload } = useApi<Profile>("/me");
  const [message, setMessage] = useState("");

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const raw = Object.fromEntries(
      Array.from(new FormData(event.currentTarget), ([key, value]) => [key, String(value).trim()]),
    );
    const languagesList = raw.languages ? raw.languages.split(",").map((item) => item.trim()).filter(Boolean) : [];
    const professionsList = raw.professions ? raw.professions.split(",").map((item) => item.trim()).filter(Boolean) : [];
    const companiesList = raw.companies ? raw.companies.split(",").map((item) => item.trim()).filter(Boolean) : [];

    try {
      const usernameValue = raw.username && raw.username.length >= 3 ? raw.username : null;
      await apiFetch("/me/profile", {
        method: "PATCH",
        body: JSON.stringify({
          first_name: raw.first_name || null,
          last_name: raw.last_name || null,
          username: usernameValue,
          phone: raw.phone || null,
          location: raw.location || null,
          bio: raw.bio || null,
          headline: raw.headline || null,
          languages: languagesList,
          professions: professionsList,
          companies: companiesList,
        }),
      });

      if (profile?.role === "mentor") {
        await apiFetch("/mentor/profile", {
          method: "PATCH",
          body: JSON.stringify({
            headline: raw.headline || null,
            hourly_rate_minor: Number(raw.hourly_rate || 0) * 100,
            languages: languagesList,
            professions: professionsList,
            companies: companiesList,
          }),
        });
      }
      setMessage("✓ Profile saved successfully!");
      await reload();
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "Unable to save profile");
    }
  }

  async function uploadAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !profile) return;
    const path = `${profile.id}/${crypto.randomUUID()}-${file.name.replaceAll(" ", "-")}`;
    const { error: uploadError } = await createClient().storage.from("avatars").upload(path, file, { upsert: false });
    if (uploadError) { setMessage(uploadError.message); return; }
    await apiFetch("/me/profile", { method: "PATCH", body: JSON.stringify({ avatar_path: path }) });
    await reload();
  }

  return (
    <AppShell active={profile?.role === "mentor" ? "/mentor/profile" : "/profile"} mentor={profile?.role === "mentor"}>
      <main className={styles.main}>
        <PageTitle>Edit Profile</PageTitle>
        {error && <p className="data-state" role="alert">{error}</p>}
        <form className={styles.edit} key={profile?.id} onSubmit={saveProfile}>
          <div className={styles.photo}>
            <Image src={publicAsset("avatars", profile?.avatar_path) ?? "/assets/app/mentor-1.png"} alt="Profile" width={130} height={130} />
            <label className="button button-secondary">Change photo<input type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadAvatar} hidden /></label>
          </div>
          <div className={styles.formGrid}>
            <label>
              First Name
              <input required name="first_name" defaultValue={profile?.first_name} />
            </label>
            <label>
              Last Name
              <input required name="last_name" defaultValue={profile?.last_name} />
            </label>
            <label>
              Username
              <input name="username" defaultValue={profile?.username ?? ""} />
            </label>
            <label>
              Email
              <input type="email" value="Managed by Supabase Auth" disabled />
            </label>
            <label>
              Phone
              <input name="phone" type="tel" defaultValue={profile?.phone ?? ""} />
            </label>
            <label>
              Location & Local Time
              <input name="location" defaultValue={profile?.location ?? ""} placeholder="e.g. Mumbai, India" />
            </label>
            <label className={styles.wide}>
              Headline / Role
              <input name="headline" defaultValue={profile?.mentor?.headline ?? ""} placeholder="e.g. Senior Full Stack Developer & Tutor" />
            </label>
            <label className={styles.wide}>
              About Biography
              <textarea name="bio" rows={4} defaultValue={profile?.bio ?? ""} placeholder="Share your background, teaching style, and interests..." />
            </label>
            <label>
              Speaks / Languages (comma-separated)
              <input name="languages" defaultValue={profile?.mentor?.languages?.join(", ") ?? "English, Hindi"} placeholder="e.g. English, Hindi, Spanish" />
            </label>
            <label>
              Skills & Professions (comma-separated)
              <input name="professions" defaultValue={profile?.mentor?.professions?.join(", ") ?? ""} placeholder="e.g. React, Python, Data Science" />
            </label>
            <label className={styles.wide}>
              Educational Institutes & Companies (comma-separated)
              <input name="companies" defaultValue={profile?.mentor?.companies?.join(", ") ?? ""} placeholder="e.g. IIT Bombay, Stanford University, Google" />
            </label>
            {profile?.role === "mentor" && (
              <label>
                Hourly Rate (INR)
                <input name="hourly_rate" type="number" min="0" defaultValue={(profile.mentor?.hourly_rate_minor ?? 0) / 100} />
              </label>
            )}
          </div>
          {message && <p className="data-state" role="status" style={{ color: message.startsWith("✓") ? "#0B6B44" : "#B42318", fontWeight: "700" }}>{message}</p>}
          <div className={styles.actions}>
            <Link className="button button-secondary" href={profile?.role === "mentor" ? "/mentor/profile" : "/profile"}>
              Cancel
            </Link>
            <button className="button button-primary">Save changes</button>
          </div>
        </form>
      </main>
    </AppShell>
  );
}
