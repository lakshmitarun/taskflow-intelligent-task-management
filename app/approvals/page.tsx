"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Mail,
  Calendar,
  Check,
  X,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";

interface ApprovalRequest {
  id: string;
  fullName: string;
  email: string;
  role: string;
  adminRequestStatus: "PENDING" | "APPROVED" | "REJECTED";
  adminRequestRequestedAt?: string;
}

export default function ApprovalsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"PENDING" | "HISTORY">("PENDING");

  // Redirect non-admins
  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.push("/");
    }
  }, [user, router]);

  async function fetchRequests() {
    try {
      const res = await fetch("/api/approvals");
      if (!res.ok) {
        throw new Error("Failed to fetch approvals list");
      }
      const data = await res.json();
      setRequests(data);
    } catch (err: unknown) {
      console.error(err);
      setError("Failed to load approval requests.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch("/api/approvals");
        if (!res.ok) throw new Error("Failed to fetch approvals list");
        const data = await res.json();
        if (!ignore) setRequests(data);
      } catch (err: unknown) {
        console.error(err);
        if (!ignore) setError("Failed to load approval requests.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  async function handleDecision(userId: string, action: "ACCEPT" | "REJECT") {
    setActioningId(userId);
    setError(null);
    try {
      const res = await fetch("/api/approvals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, action }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit decision");
      }

      // Refresh list
      await fetchRequests();
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to process request.");
    } finally {
      setActioningId(null);
    }
  }

  const pendingRequests = requests.filter(
    (r) => r.adminRequestStatus === "PENDING"
  );

  const historyRequests = requests.filter(
    (r) => r.adminRequestStatus === "APPROVED" || r.adminRequestStatus === "REJECTED"
  );

  const displayedRequests = activeTab === "PENDING" ? pendingRequests : historyRequests;

  function formatDate(isoString?: string) {
    if (!isoString) return "Unknown date";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Section Header Title */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <ShieldCheck size={20} style={{ color: "#38bdf8" }} />
        <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.01em" }}>
          Admin Registrations
        </h2>
        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#ef4444", fontSize: "12px", background: "rgba(239, 68, 68, 0.12)", padding: "4px 10px", borderRadius: "6px" }}>
            <AlertCircle size={13} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "10px",
          padding: "4px",
          width: "fit-content",
        }}
      >
        <button
          onClick={() => setActiveTab("PENDING")}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "12.5px",
            fontWeight: 700,
            color: activeTab === "PENDING" ? "#ffffff" : "var(--text-muted)",
            background: activeTab === "PENDING" ? "#2563eb" : "transparent",
            boxShadow: activeTab === "PENDING" ? "0 2px 8px rgba(37, 99, 235, 0.3)" : "none",
            transition: "all 0.15s ease",
            cursor: "pointer",
          }}
        >
          Pending Requests ({pendingRequests.length})
        </button>
        <button
          onClick={() => setActiveTab("HISTORY")}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "12.5px",
            fontWeight: 700,
            color: activeTab === "HISTORY" ? "#ffffff" : "var(--text-muted)",
            background: activeTab === "HISTORY" ? "#2563eb" : "transparent",
            boxShadow: activeTab === "HISTORY" ? "0 2px 8px rgba(37, 99, 235, 0.3)" : "none",
            transition: "all 0.15s ease",
            cursor: "pointer",
          }}
        >
          History ({historyRequests.length})
        </button>
      </div>

      {/* Content Container */}
      {loading ? (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "80px 40px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", color: "var(--text-muted)" }}>
          <Loader2 size={32} className="spin" style={{ color: "#2563eb" }} />
          <p style={{ fontSize: "13px" }}>Loading registration requests...</p>
        </div>
      ) : displayedRequests.length === 0 ? (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "90px 40px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", boxShadow: "0 4px 14px rgba(0, 0, 0, 0.1)", minHeight: "420px" }}>
          {activeTab === "PENDING" ? (
            <>
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.12)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <ShieldCheck size={32} />
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#ffffff", marginBottom: "8px" }}>
                All Caught Up!
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "13px", maxWidth: "420px", lineHeight: 1.5 }}>
                There are no pending administrator registration requests to review.
              </p>
            </>
          ) : (
            <>
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(255, 255, 255, 0.05)", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <ShieldAlert size={32} />
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#ffffff", marginBottom: "8px" }}>
                No History Yet
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "13px", maxWidth: "420px", lineHeight: 1.5 }}>
                Admin approvals and rejections will be listed here after decisions are made.
              </p>
            </>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {displayedRequests.map((req) => (
            <div key={req.id} className="approval-card-item">
              <div className="approval-item-info">
                <div className="approval-item-title">{req.fullName}</div>
                <div className="approval-item-meta">
                  <div className="approval-meta-pill">
                    <Mail size={13} style={{ color: "#38bdf8" }} />
                    <span>{req.email}</span>
                  </div>
                  <div className="approval-meta-pill">
                    <Calendar size={13} style={{ color: "var(--text-muted)" }} />
                    <span>Requested: {formatDate(req.adminRequestRequestedAt)}</span>
                  </div>
                </div>
              </div>

              <div className="approval-actions-group">
                {activeTab === "PENDING" ? (
                  <>
                    <button
                      className="btn-reject"
                      onClick={() => handleDecision(req.id, "REJECT")}
                      disabled={actioningId !== null}
                    >
                      {actioningId === req.id ? (
                        <Loader2 size={13} className="spin" />
                      ) : (
                        <X size={13} />
                      )}
                      Reject
                    </button>
                    <button
                      className="btn-approve"
                      onClick={() => handleDecision(req.id, "ACCEPT")}
                      disabled={actioningId !== null}
                    >
                      {actioningId === req.id ? (
                        <Loader2 size={13} className="spin" />
                      ) : (
                        <Check size={13} />
                      )}
                      Approve
                    </button>
                  </>
                ) : req.adminRequestStatus === "APPROVED" ? (
                  <span style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399", border: "1px solid rgba(16, 185, 129, 0.3)", fontSize: "11px", fontWeight: 700, padding: "4px 12px", borderRadius: "9999px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <CheckCircle size={12} />
                    Approved (ADMIN)
                  </span>
                ) : (
                  <span style={{ background: "rgba(239, 68, 68, 0.15)", color: "#f87171", border: "1px solid rgba(239, 68, 68, 0.3)", fontSize: "11px", fontWeight: 700, padding: "4px 12px", borderRadius: "9999px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <XCircle size={12} />
                    Rejected (EMPLOYEE)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


