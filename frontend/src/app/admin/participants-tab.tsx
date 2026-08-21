"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getAdminEvents,
  getEventParticipants,
  adminCheckinParticipant,
  setEventPublished,
  type EventItem,
  type Participant, friendlyError } from "@/lib/api";

/**
 * SRS §11 / §36 — the admin's primary job on event day: see who is present and
 * check them in, which is what releases their 50 Jule Tokens.
 */
export function ParticipantsTab() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventId, setEventId] = useState<string>("");
  const [participants, setParticipants] = useState<Participant[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminEvents()
      .then((rows) => {
        setEvents(rows);
        if (rows.length > 0) setEventId((current) => current || rows[0].id);
      })
      .catch((err: unknown) => setError(friendlyError(err, "Couldn't load events")));
  }, []);

  const loadParticipants = useCallback(() => {
    if (!eventId) return Promise.resolve();
    return getEventParticipants(eventId)
      .then(setParticipants)
      .catch((err: unknown) =>
        setError(friendlyError(err, "Couldn't load participants")),
      );
  }, [eventId]);

  useEffect(() => {
    loadParticipants();
  }, [loadParticipants]);

  const checkIn = async (userId: string, name: string) => {
    setBusyId(userId);
    setNote("");
    setError("");
    try {
      const res = await adminCheckinParticipant(eventId, userId);
      setNote(
        res.tokens_granted > 0
          ? `${name} checked in — ${res.tokens_granted} Jools Tokens granted.`
          : `${name} was already checked in. No further tokens granted.`,
      );
      await loadParticipants();
    } catch (err) {
      setError(friendlyError(err, "Check-in failed"));
    } finally {
      setBusyId(null);
    }
  };

  const togglePublished = async (published: boolean) => {
    setError("");
    try {
      await setEventPublished(eventId, published);
      setEvents(await getAdminEvents());
      setNote(published ? "Event published — it is now visible to users." : "Event unpublished.");
    } catch (err) {
      setError(friendlyError(err, "Couldn't change event status"));
    }
  };

  const selected = events.find((e) => e.id === eventId);
  const checkedIn = participants?.filter((p) => p.checkin_status === "checked_in").length ?? 0;

  return (
    <section>
      <h2 style={{ fontSize: "1.25rem", marginBottom: "16px" }}>Event Participants &amp; Check-in</h2>

      {events.length === 0 ? (
        <p style={{ color: "#6A675F" }}>No events yet. Create one from the Events tab first.</p>
      ) : (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              style={{
                padding: "10px 14px",
                borderRadius: "0",
                background: "#fff",
                border: "1.5px solid #141210",
                color: "#141210",
                minWidth: "260px",
              }}
            >
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name} ({event.status})
                </option>
              ))}
            </select>

            {selected && (
              <button
                type="button"
                onClick={() => void togglePublished(selected.status !== "published")}
                style={{
                  padding: "10px 18px",
                  borderRadius: "0",
                  background: selected.status === "published" ? "#141210" : "#F5B921",
                  color: selected.status === "published" ? "#fff" : "#141210",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {selected.status === "published" ? "Unpublish" : "Publish"}
              </button>
            )}

            <span style={{ color: "#6A675F", fontSize: "0.9rem" }}>
              {checkedIn} of {participants?.length ?? 0} checked in
            </span>
          </div>

          {note && <p style={{ color: "#0B6B44", fontWeight: 600, marginBottom: "12px" }}>{note}</p>}
          {error && (
            <p style={{ color: "#B42318", marginBottom: "12px" }} role="alert">
              {error}
            </p>
          )}

          {!participants && <p style={{ color: "#6A675F" }}>Loading participants…</p>}

          {participants?.length === 0 && (
            <p style={{ color: "#6A675F" }}>
              Nobody has registered for this event yet. Participants appear here once they open the event.
            </p>
          )}

          {participants && participants.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "760px" }}>
                <thead>
                  <tr style={{ textAlign: "left", color: "#6A675F", fontSize: "0.8rem" }}>
                    <th style={{ padding: "10px" }}>Name</th>
                    <th style={{ padding: "10px" }}>Phone</th>
                    <th style={{ padding: "10px" }}>Role</th>
                    <th style={{ padding: "10px" }}>Check-in</th>
                    <th style={{ padding: "10px" }}>Jools</th>
                    <th style={{ padding: "10px" }} />
                  </tr>
                </thead>
                <tbody>
                  {participants.map((p) => {
                    const name = `${p.first_name} ${p.last_name}`;
                    const isIn = p.checkin_status === "checked_in";
                    return (
                      <tr key={p.user_id} style={{ borderTop: "1px solid #F6EBDB" }}>
                        <td style={{ padding: "12px 10px", fontWeight: 600 }}>{name}</td>
                        <td style={{ padding: "12px 10px", color: "#6A675F" }}>{p.phone ?? "—"}</td>
                        <td style={{ padding: "12px 10px", color: "#6A675F", textTransform: "capitalize" }}>
                          {p.role}
                        </td>
                        <td style={{ padding: "12px 10px" }}>
                          <span
                            style={{
                              padding: "3px 10px",
                              borderRadius: "999px",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              background: isIn ? "rgba(72,187,120,.15)" : "rgba(148,163,184,.15)",
                              color: isIn ? "#0B6B44" : "#6A675F",
                            }}
                          >
                            {isIn ? "Checked in" : "Pending"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 10px", color: "#F5B921", fontWeight: 700 }}>
                          {p.jule_balance}
                        </td>
                        <td style={{ padding: "12px 10px", textAlign: "right" }}>
                          {!isIn && (
                            <button
                              type="button"
                              onClick={() => void checkIn(p.user_id, name)}
                              disabled={busyId === p.user_id}
                              style={{
                                padding: "8px 16px",
                                borderRadius: "0",
                                background: "#F5B921",
                                color: "#141210",
                                fontWeight: 700,
                                border: "none",
                                cursor: busyId === p.user_id ? "not-allowed" : "pointer",
                              }}
                            >
                              {busyId === p.user_id ? "…" : "Check in"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}
