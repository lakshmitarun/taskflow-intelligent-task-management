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
  AlertCircle
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
    <div className="approvals-container">
      {/* Header action bar */}
      <div className="page-action-bar">
        <div className="page-action-bar__left">
          <ShieldCheck size={18} style={{ color: "var(--primary)" }} />
          <span className="page-action-bar__label">Admin Registrations</span>
          {error && (
            <div className="error-chip" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <AlertCircle size={12} />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="approvals-tabs">
        <button
          className={`approvals-tab-btn ${
            activeTab === "PENDING" ? "approvals-tab-btn--active" : ""
          }`}
          onClick={() => setActiveTab("PENDING")}
        >
          Pending Requests ({pendingRequests.length})
        </button>
        <button
          className={`approvals-tab-btn ${
            activeTab === "HISTORY" ? "approvals-tab-btn--active" : ""
          }`}
          onClick={() => setActiveTab("HISTORY")}
        >
          History ({historyRequests.length})
        </button>
      </div>

      {/* Main content grid */}
      <div className="approvals-grid">
        {loading ? (
          <div className="empty-state" style={{ padding: "60px" }}>
            <Loader2 size={32} className="spin" style={{ color: "var(--primary)", marginBottom: "12px" }} />
            <p style={{ color: "var(--text-secondary)" }}>Loading registration requests...</p>
          </div>
        ) : displayedRequests.length === 0 ? (
          <div className="empty-state" style={{ padding: "60px", textAlign: "center" }}>
            {activeTab === "PENDING" ? (
              <>
                <ShieldCheck size={48} style={{ color: "var(--completed)", opacity: 0.7, marginBottom: "16px" }} />
                <h3>All Caught Up!</h3>
                <p style={{ color: "var(--text-secondary)", marginTop: "8px", maxWidth: "400px", margin: "8px auto 0" }}>
                  There are no pending administrator registration requests to review.
                </p>
              </>
            ) : (
              <>
                <ShieldAlert size={48} style={{ color: "var(--text-muted)", opacity: 0.5, marginBottom: "16px" }} />
                <h3>No History Yet</h3>
                <p style={{ color: "var(--text-secondary)", marginTop: "8px", maxWidth: "400px", margin: "8px auto 0" }}>
                  Admin approvals and rejections will be listed here after decisions are made.
                </p>
              </>
            )}
          </div>
        ) : (
          displayedRequests.map((req) => (
            <div key={req.id} className="approval-card">
              <div className="approval-card__info">
                <div className="approval-card__name">{req.fullName}</div>
                <div className="approval-card__meta">
                  <div className="approval-card__meta-item">
                    <Mail size={14} style={{ color: "var(--primary)" }} />
                    <span>{req.email}</span>
                  </div>
                  <div className="approval-card__meta-item">
                    <Calendar size={14} style={{ color: "var(--text-secondary)" }} />
                    <span>Requested: {formatDate(req.adminRequestRequestedAt)}</span>
                  </div>
                </div>
              </div>

              <div className="approval-card__actions">
                {activeTab === "PENDING" ? (
                  <>
                    <button
                      className="btn btn--ghost"
                      style={{ 
                        color: "var(--overdue)", 
                        border: "1px solid rgba(239, 68, 68, 0.2)",
                        background: "rgba(239, 68, 68, 0.03)"
                      }}
                      onClick={() => handleDecision(req.id, "REJECT")}
                      disabled={actioningId !== null}
                    >
                      {actioningId === req.id ? (
                        <Loader2 size={14} className="spin" />
                      ) : (
                        <X size={14} />
                      )}
                      Reject
                    </button>
                    <button
                      className="btn btn--primary"
                      style={{ background: "var(--completed)" }}
                      onClick={() => handleDecision(req.id, "ACCEPT")}
                      disabled={actioningId !== null}
                    >
                      {actioningId === req.id ? (
                        <Loader2 size={14} className="spin" />
                      ) : (
                        <Check size={14} />
                      )}
                      Approve
                    </button>
                  </>
                ) : req.adminRequestStatus === "APPROVED" ? (
                  <span className="approval-history-badge approval-history-badge--approved">
                    <CheckCircle size={12} />
                    Approved (ADMIN)
                  </span>
                ) : (
                  <span className="approval-history-badge approval-history-badge--rejected">
                    <XCircle size={12} />
                    Rejected (EMPLOYEE)
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
