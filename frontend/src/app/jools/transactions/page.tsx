"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowDownRight, ArrowUpRight, Clock } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageTitle } from "@/components/student-pages";
import { getJoolsWallet, getJoolsTransactions, type JoolsWallet, type JoolsTransaction } from "@/lib/api";

export default function JoolsTransactionsPage() {
  const [wallet, setWallet] = useState<JoolsWallet | null>(null);
  const [transactions, setTransactions] = useState<JoolsTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getJoolsWallet(), getJoolsTransactions()])
      .then(([wData, tData]) => {
        setWallet(wData);
        setTransactions(tData);
      })
      .catch((err) => setError(err.message || "Failed to load transactions"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell active="/jools/transactions">
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "16px 0", color: "#141210" }}>
        {/* Page Header */}
        <PageTitle backHref="/dashboard">Jools Ledger</PageTitle>
        <p style={{ color: "#6A675F", margin: "-16px 0 24px", fontSize: "1rem", maxWidth: "60ch" }}>
          Complete history of your Jools allocations, mentorship requests, and refunds.
        </p>

        {/* Balance Overview Card */}
        <div
          style={{
            background: "#F6EBDB",
            borderRadius: "0",
            padding: "28px",
            border: "1.5px solid #141210",
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
            <span style={{ fontSize: "0.875rem", color: "#6A675F", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700 }}>
              Current Wallet Balance
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
              <Sparkles size={28} color="#F5B921" />
              <strong style={{ fontSize: "2.5rem", fontWeight: 800, color: "#0B6B44" }}>
                {wallet?.balance ?? 0} Jools
              </strong>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <Link href="/events" className="button button-primary">
              <Sparkles size={16} /> Check in to Event (+50 Jools)
            </Link>
          </div>
        </div>

        {/* Transactions Section */}
        <h2 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "16px", color: "#141210" }}>
          Transaction History ({transactions.length})
        </h2>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#6A675F" }}>Loading transaction history...</div>
        ) : error ? (
          <div style={{ padding: "20px", background: "rgba(239, 68, 68, 0.15)", borderRadius: "0", color: "#B42318", border: "1.5px solid #B42318" }}>
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
              border: "1.5px solid #141210",
            }}
          >
            <Clock size={36} color="#6A675F" style={{ marginBottom: "12px" }} />
            <p style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>No Jools transactions recorded yet.</p>
            <small style={{ color: "#6A675F" }}>Check in to live events to claim 50 Jools!</small>
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
                    background: "#FFFFFF",
                    borderRadius: "0",
                    padding: "18px 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    border: "1.5px solid #141210",
                    boxShadow: "2px 2px 0 #141210",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        background: isPositive ? "#DCFCE7" : "#FEE2E2",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: isPositive ? "#0B6B44" : "#B42318",
                        border: "1.5px solid #141210",
                      }}
                    >
                      {isPositive ? <ArrowDownRight size={22} /> : <ArrowUpRight size={22} />}
                    </div>
                    <div>
                      <strong style={{ fontSize: "1rem", display: "block", color: "#141210" }}>
                        {tx.notes || (isPositive ? "Jools Allocation" : "Mentorship Request")}
                      </strong>
                      <span style={{ fontSize: "0.85rem", color: "#6A675F" }}>
                        Type: <span style={{ textTransform: "capitalize", color: "#141210", fontWeight: 600 }}>{tx.transaction_type.replace(/_/g, " ")}</span> • {formattedDate}
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
                      {isPositive ? `+${tx.amount}` : tx.amount} Jools
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
