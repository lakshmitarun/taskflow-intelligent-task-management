"use client";

import { useEffect, useState } from "react";
import { Activity, Clock, CheckCircle2, User, Zap, ShieldCheck } from "lucide-react";

interface ActivityRecord {
  _id: string;
  action: string;
  description: string;
  employeeName?: string | null;
  createdAt: string;
}

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/activities?limit=5")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setActivities(data);
        }
      })
      .catch((err) => console.error("Failed to load recent activities:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="tf-priority-card">
      <div className="tf-priority-header">
        <div className="tf-priority-title">
          <Activity size={16} style={{ color: "#38bdf8" }} />
          <span>RECENT ACTIVITY</span>
        </div>
        <span style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 600 }}>
          Live Audit Log
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", margin: "4px 0" }}>
        {loading ? (
          <p style={{ fontSize: "12px", color: "var(--text-muted)", padding: "8px 0" }}>Loading activity logs…</p>
        ) : activities.length === 0 ? (
          <p style={{ fontSize: "12.5px", color: "var(--text-muted)", padding: "8px 0" }}>
            No recent system activities recorded yet.
          </p>
        ) : (
          activities.map((item) => {
            let Icon = User;
            let iconColor = "#38bdf8";

            if (item.action === "TASK_COMPLETED") {
              Icon = CheckCircle2;
              iconColor = "#10b981";
            } else if (item.action === "PRIORITY_UPDATED" || item.action === "STATUS_CHANGED") {
              Icon = Zap;
              iconColor = "#eab308";
            } else if (item.action === "ADMIN_APPROVED" || item.action === "ADMIN_REJECTED") {
              Icon = ShieldCheck;
              iconColor = "#818cf8";
            }

            const formattedTime =
              typeof item.createdAt === "string" && item.createdAt.includes("T")
                ? new Date(item.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : item.createdAt;

            return (
              <div key={item._id} className="tf-priority-item" style={{ padding: "9px 12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: "rgba(255, 255, 255, 0.05)",
                      color: iconColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "11px",
                      fontWeight: 800,
                    }}
                  >
                    <Icon size={12} />
                  </div>
                  <div style={{ fontSize: "12.5px", color: "var(--text-primary)" }}>
                    {item.description}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "var(--text-muted)", flexShrink: 0 }}>
                  <Clock size={11} />
                  <span>{formattedTime}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

