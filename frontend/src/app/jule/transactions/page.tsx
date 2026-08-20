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
              borderRadius: "0",
              background: "#F6EBDB",
              color: "#fff",
              textDecoration: "none",
            }}
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0 }}>Jule Token Ledger</h1>
            <p style={{ color: "#6A675F", margin: 0, fontSize: "0.9rem" }}>
              Complete history of your Jule Token allocations, mentorship requests, and refunds.
            </p>
          </div>
        </div>

        {/* Balance Overview Card */}
        <div
          style={{
            background: "linear-gradient(135deg, #F6EBDB 0%, #141210 100%)",
            borderRadius: "0",
            padding: "28px",
            border: "1px solid rgba(255, 184, 0, 0.3)",
            marginBottom: "32px",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            boxShadow: "4px 4px 0 #141210",
          }}
        >
          <div>
            <span style={{ fontSize: "0.875rem", color: "#6A675F", textTransform: "uppercase", letterSpacing: "1px" }}>
              Current Wallet Balance
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
              <Sparkles size={28} color="#F5B921" />
              <strong style={{ fontSize: "2.5rem", fontWeight: 800, color: "#F5B921" }}>
                {wallet?.balance ?? 0} Jule Tokens
              </strong>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <Link
              href="/events"
              style={{
                padding: "12px 20px",
                borderRadius: "0",
                background: "#F5B921",
                color: "#141210",
                fontWeight: 700,
                textDecoration: "none",
                fontSize: "0.95rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              Check in to Event (+50 Jule Tokens)
            </Link>
          </div>
        </div>

        {/* Transactions Section */}
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "16px", color: "#FBF3E7" }}>
          Transaction History ({transactions.length})
        </h2>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6A675F" }}>Loading transaction history...</div>
        ) : error ? (
          <div style={{ padding: "20px", background: "rgba(239, 68, 68, 0.15)", borderRadius: "0", color: "#B42318" }}>
            {error}
          </div>
        ) : transactions.length === 0 ? (
          <div
            style={{
              padding: "40px",
              background: "#F6EBDB",
              borderRadius: "0",
              textAlign: "center",
              color: "#6A675F",
            }}
          >
            <Clock size={36} color="#6A675F" style={{ marginBottom: "12px" }} />
            <p style={{ margin: 0, fontSize: "1rem" }}>No Jule Token transactions recorded yet.</p>
            <small style={{ color: "#6A675F" }}>Check in to live events to claim 50 Jule Tokens!</small>
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
                    background: "#F6EBDB",
                    borderRadius: "0",
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
                        borderRadius: "0",
                        background: isPositive ? "rgba(72, 187, 120, 0.15)" : "rgba(239, 68, 68, 0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: isPositive ? "#0B6B44" : "#B42318",
                      }}
                    >
                      {isPositive ? <ArrowDownRight size={22} /> : <ArrowUpRight size={22} />}
                    </div>
                    <div>
                      <strong style={{ fontSize: "1rem", display: "block", color: "#FBF3E7" }}>
                        {tx.notes || (isPositive ? "Jule Token Allocation" : "Mentorship Request")}
                      </strong>
                      <span style={{ fontSize: "0.85rem", color: "#6A675F" }}>
                        Type: <span style={{ textTransform: "capitalize", color: "#6A675F" }}>{tx.transaction_type.replace(/_/g, " ")}</span> • {formattedDate}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: 800,
                        color: isPositive ? "#0B6B44" : "#B42318",
                      }}
                    >
                      {isPositive ? `+${tx.amount}` : tx.amount} Jule Tokens
                    </span>
                    <span style={{ display: "block", fontSize: "0.75rem", color: "#6A675F" }}>
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
