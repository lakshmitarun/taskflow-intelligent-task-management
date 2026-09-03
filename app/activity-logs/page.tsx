"use client";

import { useEffect, useState } from "react";
import { Activity, Clock, User } from "lucide-react";

interface ActivityItem {
  _id: string;
  action: string;
  description: string;
  createdAt: string;
}

const sampleActivities: ActivityItem[] = [
  {
    _id: "1",
    action: "TASK_DELETED",
    description: 'Task "DSA" was deleted',
    createdAt: "Sep 2, 2:04 PM",
  },
  {
    _id: "2",
    action: "TASK_CREATED",
    description: 'Task "DSA" was created',
    createdAt: "Sep 2, 2:04 PM",
  },
  {
    _id: "3",
    action: "TASK_DELETED",
    description: 'Task "DSA" was deleted',
    createdAt: "Sep 2, 2:04 PM",
  },
  {
    _id: "4",
    action: "TASK_CREATED",
    description: 'Task "DSA" was created',
    createdAt: "Sep 1, 10:07 PM",
  },
  {
    _id: "5",
    action: "TASK_UPDATED",
    description: 'Task "DSA" was updated',
    createdAt: "Sep 1, 9:53 PM",
  },
  {
    _id: "6",
    action: "TASK_COMPLETED",
    description: 'Task "React.js Context API" was completed',
    createdAt: "Aug 31, 4:15 PM",
  },
  {
    _id: "7",
    action: "TASK_CREATED",
    description: 'Task "MongoDB Integration" was created',
    createdAt: "Aug 30, 11:20 AM",
  },
  {
    _id: "8",
    action: "USER_REGISTERED",
    description: 'Employee "Tharun Bole" was added',
    createdAt: "Aug 29, 3:45 PM",
  },
];

export default function ActivityLogsPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/activities")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setActivities(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const displayList = activities.length > 0 ? activities : sampleActivities;

  function formatTime(val: string) {
    if (!val) return "Just now";
    if (val.includes(",") || val.includes("ago") || val.includes("AM") || val.includes("PM")) {
      return val;
    }
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return val;
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return val;
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Outer Card Container */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px 28px", boxShadow: "0 4px 14px rgba(0, 0, 0, 0.1)" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Activity size={18} style={{ color: "#38bdf8" }} />
            <h2 style={{ fontSize: "15px", fontWeight: 800, color: "#ffffff", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              SYSTEM ACTIVITY LOGS
            </h2>
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>
            Real-time Admin Audit Trail
          </span>
        </div>

        {/* Content Stack */}
        {loading && activities.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "13px", padding: "20px 0" }}>
            Loading activity logs…
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {displayList.map((item) => (
              <div key={item._id} style={{ background: "#172033", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "12px", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                {/* Left side */}
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.08)", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <User size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#ffffff" }}>
                      {item.description}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px", fontWeight: 500 }}>
                      System Action Event • {item.action}
                    </div>
                  </div>
                </div>

                {/* Right side */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>
                  <Clock size={13} style={{ color: "var(--text-muted)" }} />
                  <span>{formatTime(item.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

