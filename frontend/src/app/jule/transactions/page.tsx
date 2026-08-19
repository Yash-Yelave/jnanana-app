"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, ArrowDownRight, ArrowUpRight, Clock, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { getJuleWallet, getJuleTransactions, type JuleWallet, type JuleTransaction } from "@/lib/api";

export default function JuleTransactionsPage() {
  const [wallet, setWallet] = useState<JuleWallet | null>(null);
  const [transactions, setTransactions] = useState<JuleTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getJuleWallet(), getJuleTransactions()])
      .then(([wData, tData]) => {
        setWallet(wData);
        setTransactions(tData);
      })
      .catch((err) => setError(err.message || "Failed to load transactions"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell active="/jule/transactions">
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px", color: "#fff" }}>
        {/* Header Title */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <Link
            href="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "#1E293B",
              color: "#fff",
              textDecoration: "none",
            }}
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0 }}>Jools Token Ledger</h1>
            <p style={{ color: "#94A3B8", margin: 0, fontSize: "0.9rem" }}>
              Complete history of your Jools Token allocations, mentorship requests, and refunds.
            </p>
          </div>
        </div>

        {/* Balance Overview Card */}
        <div
          style={{
            background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
            borderRadius: "20px",
            padding: "28px",
            border: "1px solid rgba(255, 184, 0, 0.3)",
            marginBottom: "32px",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          }}
        >
          <div>
            <span style={{ fontSize: "0.875rem", color: "#94A3B8", textTransform: "uppercase", letterSpacing: "1px" }}>
              Current Wallet Balance
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
              <Sparkles size={28} color="#FFB800" />
              <strong style={{ fontSize: "2.5rem", fontWeight: 800, color: "#FFB800" }}>
                {wallet?.balance ?? 50} Jools
              </strong>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <Link
              href="/events"
              style={{
                padding: "12px 20px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #FFB800 0%, #FF8A00 100%)",
                color: "#000",
                fontWeight: 700,
                textDecoration: "none",
                fontSize: "0.95rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              Check in to Event (+50 Jools)
            </Link>
          </div>
        </div>

        {/* Transactions Section */}
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "16px", color: "#F8FAFC" }}>
          Transaction History ({transactions.length})
        </h2>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#94A3B8" }}>Loading transaction history...</div>
        ) : error ? (
          <div style={{ padding: "20px", background: "rgba(239, 68, 68, 0.15)", borderRadius: "12px", color: "#EF4444" }}>
            {error}
          </div>
        ) : transactions.length === 0 ? (
          <div
            style={{
              padding: "40px",
              background: "#1E293B",
              borderRadius: "16px",
              textAlign: "center",
              color: "#94A3B8",
            }}
          >
            <Clock size={36} color="#64748B" style={{ marginBottom: "12px" }} />
            <p style={{ margin: 0, fontSize: "1rem" }}>No Jools transactions recorded yet.</p>
            <small style={{ color: "#64748B" }}>Check in to live events to claim 50 Jools!</small>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {transactions.map((tx) => {
              const isPositive = tx.amount > 0;
              const formattedDate = new Date(tx.created_at).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              });

              return (
                <div
                  key={tx.id}
                  style={{
                    background: "#1E293B",
                    borderRadius: "14px",
                    padding: "18px 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        background: isPositive ? "rgba(72, 187, 120, 0.15)" : "rgba(239, 68, 68, 0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: isPositive ? "#48BB78" : "#EF4444",
                      }}
                    >
                      {isPositive ? <ArrowDownRight size={22} /> : <ArrowUpRight size={22} />}
                    </div>
                    <div>
                      <strong style={{ fontSize: "1rem", display: "block", color: "#F8FAFC" }}>
                        {tx.notes || (isPositive ? "Jools Token Allocation" : "Mentorship Request")}
                      </strong>
                      <span style={{ fontSize: "0.85rem", color: "#94A3B8" }}>
                        Type: <span style={{ textTransform: "capitalize", color: "#CBD5E1" }}>{tx.transaction_type.replace(/_/g, " ")}</span> • {formattedDate}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: 800,
                        color: isPositive ? "#48BB78" : "#EF4444",
                      }}
                    >
                      {isPositive ? `+${tx.amount}` : tx.amount} Jools
                    </span>
                    <span style={{ display: "block", fontSize: "0.75rem", color: "#64748B" }}>
                      ID: {tx.id.slice(0, 8)}...
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
