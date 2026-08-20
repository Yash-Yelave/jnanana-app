"use client";

import { useCallback, useEffect, useState } from "react";
import { getAdminRequests, overrideRequestStatus, type AdminRequest } from "@/lib/api";

const STATUSES = ["pending", "accepted", "rejected", "completed", "cancelled"] as const;

const STATUS_COLOR: Record<string, string> = {
  pending: "#EAB308",
  accepted: "#48BB78",
  rejected: "#EF4444",
  completed: "#6366F1",
  cancelled: "#94A3B8",
};

/** SRS §37 — full visibility of every request, with the ability to intervene. */
export function RequestsTab() {
  const [requests, setRequests] = useState<AdminRequest[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(
    () =>
      getAdminRequests()
        .then(setRequests)
        .catch((err: unknown) =>
          setError(err instanceof Error ? err.message : "Couldn't load mentorship requests"),
        ),
    [],
  );

  useEffect(() => {
    load();
  }, [load]);

  const override = async (id: string, status: string) => {
    setBusyId(id);
    setNote("");
    setError("");
    try {
      const res = await overrideRequestStatus(id, status);
      setNote(res.message);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't change the request status");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section>
      <h2 style={{ fontSize: "1.25rem", marginBottom: "16px" }}>Mentorship Requests</h2>
      <p style={{ color: "#94A3B8", marginBottom: "20px", fontSize: "0.9rem" }}>
        Moving a request to rejected or cancelled refunds the mentee&apos;s Jule Tokens automatically.
      </p>

      {note && <p style={{ color: "#48BB78", fontWeight: 600, marginBottom: "12px" }}>{note}</p>}
      {error && (
        <p style={{ color: "#EF4444", marginBottom: "12px" }} role="alert">
          {error}
        </p>
      )}

      {!requests && <p style={{ color: "#94A3B8" }}>Loading requests…</p>}
      {requests?.length === 0 && <p style={{ color: "#94A3B8" }}>No mentorship requests yet.</p>}

      {requests && requests.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "820px" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "#94A3B8", fontSize: "0.8rem" }}>
                <th style={{ padding: "10px" }}>Mentee</th>
                <th style={{ padding: "10px" }}>Mentor</th>
                <th style={{ padding: "10px" }}>Event</th>
                <th style={{ padding: "10px" }}>Jule</th>
                <th style={{ padding: "10px" }}>Date</th>
                <th style={{ padding: "10px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} style={{ borderTop: "1px solid #1E293B" }}>
                  <td style={{ padding: "12px 10px", fontWeight: 600 }}>{r.mentee_name}</td>
                  <td style={{ padding: "12px 10px" }}>{r.mentor_name}</td>
                  <td style={{ padding: "12px 10px", color: "#94A3B8" }}>{r.event_name ?? "—"}</td>
                  <td style={{ padding: "12px 10px", color: "#FFB800", fontWeight: 700 }}>{r.tokens_used}</td>
                  <td style={{ padding: "12px 10px", color: "#94A3B8", fontSize: "0.85rem" }}>
                    {new Date(r.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                  </td>
                  <td style={{ padding: "12px 10px" }}>
                    <select
                      value={r.status}
                      disabled={busyId === r.id}
                      onChange={(e) => void override(r.id, e.target.value)}
                      style={{
                        padding: "6px 10px",
                        borderRadius: "8px",
                        background: "#0F172A",
                        border: `1px solid ${STATUS_COLOR[r.status] ?? "#334155"}`,
                        color: STATUS_COLOR[r.status] ?? "#fff",
                        fontWeight: 700,
                        textTransform: "capitalize",
                      }}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
