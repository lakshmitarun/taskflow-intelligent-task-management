"use client";

import { PieChart } from "lucide-react";

interface TaskStatusOverviewProps {
  total: number;
  todo: number;
  inProgress: number;
  completed: number;
  overdue: number;
}

export function TaskStatusOverview({
  total = 148,
  todo = 38,
  inProgress = 56,
  completed = 48,
  overdue = 6,
}: TaskStatusOverviewProps) {
  const displayTotal = total || 148;
  const displayInProgress = inProgress || 56;
  const displayCompleted = completed || 48;
  const displayTodo = todo || 38;
  const displayOverdue = overdue || 6;

  // Donut chart stroke math
  const radius = 42;
  const circumference = 2 * Math.PI * radius; // ~263.89

  const pctInProgress = displayInProgress / displayTotal;
  const pctCompleted = displayCompleted / displayTotal;
  const pctTodo = displayTodo / displayTotal;
  const pctOverdue = displayOverdue / displayTotal;

  const dashInProgress = pctInProgress * circumference;
  const dashCompleted = pctCompleted * circumference;
  const dashTodo = pctTodo * circumference;
  const dashOverdue = pctOverdue * circumference;

  const offsetInProgress = 0;
  const offsetCompleted = -dashInProgress;
  const offsetTodo = -(dashInProgress + dashCompleted);
  const offsetOverdue = -(dashInProgress + dashCompleted + dashTodo);

  return (
    <div className="tf-priority-card">
      <div className="tf-priority-header">
        <div className="tf-priority-title">
          <PieChart size={16} style={{ color: "#38bdf8" }} />
          <span>TASK STATUS OVERVIEW</span>
        </div>
        <span style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 600 }}>
          System Breakdown
        </span>
      </div>

      {/* Donut Chart Display */}
      <div className="tf-donut-wrapper" style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "relative", margin: "12px 0 16px 0" }}>
        <svg width="150" height="150" viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
          {/* Base track */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="14"
            fill="none"
          />
          {/* In Progress - Purple */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="#a855f7"
            strokeWidth="14"
            strokeDasharray={`${dashInProgress} ${circumference}`}
            strokeDashoffset={offsetInProgress}
            fill="none"
            strokeLinecap="round"
          />
          {/* Completed - Green */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="#10b981"
            strokeWidth="14"
            strokeDasharray={`${dashCompleted} ${circumference}`}
            strokeDashoffset={offsetCompleted}
            fill="none"
            strokeLinecap="round"
          />
          {/* To Do - Yellow */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="#eab308"
            strokeWidth="14"
            strokeDasharray={`${dashTodo} ${circumference}`}
            strokeDashoffset={offsetTodo}
            fill="none"
            strokeLinecap="round"
          />
          {/* Overdue - Red */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="#ef4444"
            strokeWidth="14"
            strokeDasharray={`${dashOverdue} ${circumference}`}
            strokeDashoffset={offsetOverdue}
            fill="none"
            strokeLinecap="round"
          />
        </svg>

        {/* Center Total Text */}
        <div
          style={{
            position: "absolute",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>
            {displayTotal}
          </span>
          <span style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 700, marginTop: "2px" }}>
            TOTAL
          </span>
        </div>
      </div>

      {/* Legend below Chart */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px 14px",
          paddingTop: "14px",
          borderTop: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#a855f7" }} />
            <span style={{ color: "var(--text-secondary)" }}>In Progress</span>
          </div>
          <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{displayInProgress}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }} />
            <span style={{ color: "var(--text-secondary)" }}>Completed</span>
          </div>
          <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{displayCompleted}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#eab308" }} />
            <span style={{ color: "var(--text-secondary)" }}>To Do</span>
          </div>
          <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{displayTodo}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444" }} />
            <span style={{ color: "var(--text-secondary)" }}>Overdue</span>
          </div>
          <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{displayOverdue}</span>
        </div>
      </div>
    </div>
  );
}
