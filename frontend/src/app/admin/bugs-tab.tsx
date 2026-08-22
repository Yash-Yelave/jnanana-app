"use client";

import { useEffect, useState } from "react";
import { Bug, CheckCircle } from "lucide-react";
import { getAdminBugReports, updateAdminBugReport, friendlyError, type BugReportItem } from "@/lib/api";

export function BugsTab() {
  const [reports, setReports] = useState<BugReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "in_progress" | "resolved" | "closed">("all");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [statusDrafts, setStatusDrafts] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState("");

  async function refreshReports() {
    try {
      const data = await getAdminBugReports();
      setReports(data);
      const initialNotes: Record<string, string> = {};
      const initialStatuses: Record<string, string> = {};
      data.forEach((item) => {
        initialNotes[item.id] = item.admin_notes || "";
        initialStatuses[item.id] = item.status;
      });
      setNoteDrafts(initialNotes);
      setStatusDrafts(initialStatuses);
    } catch (err: unknown) {
      setError(friendlyError(err, "Failed to load bug reports"));
    }
  }

  useEffect(() => {
    let ignore = false;
    getAdminBugReports()
      .then((data) => {
        if (ignore) return;
        setReports(data);
        const initialNotes: Record<string, string> = {};
        const initialStatuses: Record<string, string> = {};
        data.forEach((item) => {
          initialNotes[item.id] = item.admin_notes || "";
          initialStatuses[item.id] = item.status;
        });
        setNoteDrafts(initialNotes);
        setStatusDrafts(initialStatuses);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (ignore) return;
        setError(friendlyError(err, "Failed to load bug reports"));
        setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  async function handleSaveStatus(reportId: string) {
    const targetStatus = statusDrafts[reportId];
    const targetNote = noteDrafts[reportId];
    setSavingId(reportId);
    setFeedback("");
    try {
      const res = await updateAdminBugReport(reportId, targetStatus, targetNote);
      setFeedback(`✓ ${res.message}`);
      await refreshReports();
    } catch (err: unknown) {
      setError(friendlyError(err, "Failed to update bug report"));
    } finally {
      setSavingId(null);
    }
  }

  const filteredReports = reports.filter((r) => {
    if (statusFilter === "all") return true;
    return r.status === statusFilter;
  });

  return (
    <section>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, margin: 0, color: "#141210", display: "flex", alignItems: "center", gap: "8px" }}>
            <Bug size={20} color="#D6206A" /> Reported Bugs &amp; Platform Issues ({reports.length})
          </h2>
          <p style={{ margin: "4px 0 0", color: "#6A675F", fontSize: "0.9rem" }}>
            Review issues submitted by mentees and mentors, update resolution status, and save internal notes.
          </p>
        </div>

        {/* Status Filter Pills */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {(["all", "open", "in_progress", "resolved", "closed"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              style={{
                padding: "6px 12px",
                border: "1.5px solid #141210",
                background: statusFilter === st ? "#141210" : "#FFFFFF",
                color: statusFilter === st ? "#FFFFFF" : "#141210",
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                cursor: "pointer",
                boxShadow: statusFilter === st ? "none" : "2px 2px 0 #141210",
              }}
            >
              {st.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {feedback && (
        <div style={{ padding: "10px 16px", background: "#DCFCE7", color: "#0B6B44", border: "1.5px solid #141210", marginBottom: "16px", fontWeight: 700, fontSize: "0.9rem" }}>
          {feedback}
        </div>
      )}

      {error && (
        <div style={{ padding: "10px 16px", background: "#FEE2E2", color: "#B42318", border: "1.5px solid #141210", marginBottom: "16px", fontWeight: 700, fontSize: "0.9rem" }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#6A675F", fontWeight: 600 }}>Loading bug reports...</div>
      ) : filteredReports.length === 0 ? (
        <div style={{ padding: "40px", background: "#F6EBDB", border: "1.5px solid #141210", textAlign: "center", color: "#6A675F" }}>
          <CheckCircle size={32} color="#0B6B44" style={{ marginBottom: "8px" }} />
          <p style={{ margin: 0, fontWeight: 700, fontSize: "1rem" }}>No bug reports match the selected filter ({statusFilter}).</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filteredReports.map((report) => {
            const formattedDate = new Date(report.created_at).toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
            });

            const statusColors: Record<string, { bg: string; text: string; border: string }> = {
              open: { bg: "#D6206A", text: "#FFFFFF", border: "#141210" },
              in_progress: { bg: "#F5B921", text: "#141210", border: "#141210" },
              resolved: { bg: "#0B6B44", text: "#FFFFFF", border: "#141210" },
              closed: { bg: "#F6EBDB", text: "#6A675F", border: "#141210" },
            };

            const styleColor = statusColors[report.status] || statusColors.open;

            return (
              <article
                key={report.id}
                style={{
                  background: "#FFFFFF",
                  border: "1.5px solid #141210",
                  boxShadow: "3px 3px 0 #141210",
                  padding: "20px 24px",
                }}
              >
                {/* Header Row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <h3 style={{ fontSize: "1.15rem", fontWeight: 800, margin: "0 0 6px", color: "#141210" }}>
                      {report.title}
                    </h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", fontSize: "0.85rem", color: "#6A675F" }}>
                      <span style={{ fontWeight: 700, color: "#141210" }}>
                        Reported by: {report.reporter_name || "User"}
                      </span>
                      <span
                        style={{
                          padding: "2px 8px",
                          background: report.reporter_role === "mentor" ? "#F5B921" : "#F6EBDB",
                          border: "1px solid #141210",
                          color: "#141210",
                          fontSize: "0.75rem",
                          fontWeight: 800,
                          textTransform: "uppercase",
                        }}
                      >
                        {report.reporter_role || "User"}
                      </span>
                      <span>• {formattedDate}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    style={{
                      padding: "4px 12px",
                      background: styleColor.bg,
                      color: styleColor.text,
                      border: `1.5px solid ${styleColor.border}`,
                      fontWeight: 800,
                      fontSize: "0.8rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {report.status.replace("_", " ")}
                  </span>
                </div>

                {/* Description Body */}
                <div style={{ background: "#F6EBDB", padding: "14px 16px", border: "1px solid #141210", marginBottom: "16px", whiteSpace: "pre-wrap", fontSize: "0.95rem", color: "#141210", lineHeight: 1.5 }}>
                  {report.description}
                </div>

                {/* Action Controls Row */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", background: "#F6EBDB", padding: "12px 16px", border: "1px solid #141210" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "#141210" }}>Status:</label>
                    <select
                      value={statusDrafts[report.id] || report.status}
                      onChange={(e) => setStatusDrafts({ ...statusDrafts, [report.id]: e.target.value })}
                      style={{
                        padding: "6px 10px",
                        border: "1.5px solid #141210",
                        background: "#FFFFFF",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        color: "#141210",
                      }}
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <div style={{ flex: 1, minWidth: "220px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "#141210" }}>Notes:</label>
                    <input
                      type="text"
                      placeholder="Add admin resolution notes..."
                      value={noteDrafts[report.id] || ""}
                      onChange={(e) => setNoteDrafts({ ...noteDrafts, [report.id]: e.target.value })}
                      style={{
                        flex: 1,
                        padding: "6px 12px",
                        border: "1.5px solid #141210",
                        background: "#FFFFFF",
                        fontSize: "0.85rem",
                        color: "#141210",
                        fontWeight: 500,
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    disabled={savingId === report.id}
                    onClick={() => handleSaveStatus(report.id)}
                    style={{
                      padding: "6px 16px",
                      background: "#F5B921",
                      color: "#141210",
                      border: "1.5px solid #141210",
                      fontWeight: 800,
                      fontSize: "0.85rem",
                      boxShadow: "2px 2px 0 #141210",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {savingId === report.id ? "Saving..." : "Save Update"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
