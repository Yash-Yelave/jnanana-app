"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, X, Clock, Sparkles } from "lucide-react";
import {
  getMyMentorshipRequests,
  getCachedRequests,
  actionMentorshipRequest,
  type MentorshipRequestItem, friendlyError } from "@/lib/api";
import { AppShell } from "@/components/app-shell";
import { BackButton } from "@/components/student-pages";
import { useApi } from "@/lib/use-api";
import { publicAsset } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import styles from "./mentorship-requests.module.css";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Declined",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function MentorshipRequestsPage() {
  const { data: profile } = useApi<Profile>("/me");
  const isMentor = profile?.role === "mentor";

  const [requests, setRequests] = useState<MentorshipRequestItem[] | null>(getCachedRequests());
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  // The request whose session length is being logged, and the value typed in.
  const [loggingId, setLoggingId] = useState<string | null>(null);
  const [minutes, setMinutes] = useState("");

  const load = useCallback(
    (force = false) =>
      getMyMentorshipRequests(force)
        .then(setRequests)
        .catch((err: unknown) => {
          if (!getCachedRequests()) {
            setError(friendlyError(err, "Unable to load your mentorship requests"));
          }
        }),
    [],
  );

  useEffect(() => {
    load();
  }, [load]);

  const act = async (
    id: string,
    action: "accept" | "reject" | "cancel" | "complete",
    durationMinutes?: number,
  ) => {
    setBusyId(id);
    setActionError(null);
    try {
      await actionMentorshipRequest(id, action, durationMinutes);
      setLoggingId(null);
      await load(true);
    } catch (err) {
      setActionError(friendlyError(err, "That action didn't go through. Please try again."));
    } finally {
      setBusyId(null);
    }
  };

  const logSession = (id: string) => {
    const parsed = Number(minutes);
    if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 1440) {
      setActionError("Enter the session length in minutes, between 1 and 1440.");
      return;
    }
    void act(id, "complete", Math.round(parsed));
  };

  return (
    <AppShell active={isMentor ? "/mentor/requests" : "/requests"} mentor={isMentor}>
      <div className={styles.page}>
        <header className="app-head">
          <p className="eyebrow">{isMentor ? "Your inbox" : "Your activity"}</p>
          <h1 style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <BackButton backHref="/dashboard" />
            {isMentor ? "Mentorship requests" : "My requests"}
          </h1>
          <p>
            {isMentor
              ? "Mentees who have spent their Jools to reach you. Accepting lets the Jnanana team coordinate the connection."
              : "Every mentorship request you've made, and where it stands."}
          </p>
        </header>

        {!requests && !error && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
            <div
              style={{
                background: "#F6EBDB",
                padding: "16px 20px",
                border: "1.5px solid #141210",
                boxShadow: "2px 2px 0 #141210",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                opacity: 0.8,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "0.85rem", color: "#6A675F", fontWeight: 600 }}>Loading requests...</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <p className="data-state" role="alert">
            {error}
          </p>
        )}

        {actionError && (
          <p className={styles.error} role="alert">
            {actionError}
          </p>
        )}

        {requests?.length === 0 && (
          <div className={styles.empty}>
            <Sparkles size={28} aria-hidden />
            <h2>{isMentor ? "No requests yet" : "You haven't made any requests yet"}</h2>
            <p>
              {isMentor
                ? "When a mentee requests mentorship with you, it will appear here."
                : "Check in at an event to receive Jools, then request mentorship from any mentor."}
            </p>
            {!isMentor && (
              <Link className="button button-primary" href="/mentors">
                Browse mentors
              </Link>
            )}
          </div>
        )}

        <div className={styles.list}>
          {requests?.map((request) => {
            const counterparty = isMentor ? request.mentee_name : request.mentor_name;
            const avatar = publicAsset("avatars", request.mentor_avatar) ?? "/assets/app/mentor-1.png";
            return (
              <article className={styles.card} key={request.id}>
                <Image
                  src={isMentor ? "/assets/app/mentor-1.png" : avatar}
                  alt=""
                  width={56}
                  height={56}
                  className={styles.avatar}
                />

                <div className={styles.body}>
                  <h3>{counterparty ?? "Jnanana member"}</h3>
                  {!isMentor && request.mentor_headline && <p className={styles.headline}>{request.mentor_headline}</p>}
                  {request.note && <p className={styles.note}>&ldquo;{request.note}&rdquo;</p>}
                  <div className={styles.meta}>
                    <span>
                      <Clock size={14} aria-hidden /> {new Date(request.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                    </span>
                    <span>
                      <Sparkles size={14} aria-hidden /> {request.tokens_used} Jools
                    </span>
                  </div>
                </div>

                <div className={styles.side}>
                  <span className={`${styles.pill} ${styles[request.status] ?? ""}`}>
                    {STATUS_LABEL[request.status] ?? request.status}
                  </span>

                  {request.status === "pending" && isMentor && (
                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={styles.accept}
                        onClick={() => void act(request.id, "accept")}
                        disabled={busyId === request.id}
                      >
                        <Check size={16} aria-hidden /> Accept
                      </button>
                      <button
                        type="button"
                        className={styles.reject}
                        onClick={() => void act(request.id, "reject")}
                        disabled={busyId === request.id}
                      >
                        <X size={16} aria-hidden /> Decline
                      </button>
                    </div>
                  )}

                  {request.status === "pending" && !isMentor && (
                    <button
                      type="button"
                      className={styles.reject}
                      onClick={() => void act(request.id, "cancel")}
                      disabled={busyId === request.id}
                    >
                      Cancel request
                    </button>
                  )}

                  {/* Only the mentor can close out a session, and the minutes
                      they log are what the public counter sums. */}
                  {request.status === "accepted" && isMentor && (
                    loggingId === request.id ? (
                      <div className={styles.logSession}>
                        <label htmlFor={`minutes-${request.id}`}>Session length</label>
                        <div>
                          <input
                            id={`minutes-${request.id}`}
                            type="number"
                            inputMode="numeric"
                            min={1}
                            max={1440}
                            placeholder="45"
                            value={minutes}
                            onChange={(event) => setMinutes(event.target.value)}
                            autoFocus
                          />
                          <span>min</span>
                          <button
                            type="button"
                            className={styles.accept}
                            onClick={() => logSession(request.id)}
                            disabled={busyId === request.id}
                          >
                            <Check size={16} aria-hidden /> Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className={styles.accept}
                        onClick={() => {
                          setMinutes("");
                          setActionError(null);
                          setLoggingId(request.id);
                        }}
                      >
                        Mark complete
                      </button>
                    )
                  )}

                  {request.status === "completed" && request.duration_minutes ? (
                    <small className={styles.refund}>{request.duration_minutes} minutes logged</small>
                  ) : null}

                  {request.status === "rejected" && (
                    <small className={styles.refund}>{request.tokens_used} Jools refunded</small>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
