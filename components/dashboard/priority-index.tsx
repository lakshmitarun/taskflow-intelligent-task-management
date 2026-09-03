"use client";

import { Sliders, Sparkles } from "lucide-react";

interface PriorityIndexProps {
  urgent?: number;
  high?: number;
  medium?: number;
  low?: number;
}

export function PriorityIndex({
  urgent = 18,
  high = 42,
  medium = 64,
  low = 24,
}: PriorityIndexProps) {
  const total = urgent + high + medium + low;

  const categories = [
    {
      label: "URGENT",
      count: urgent,
      pct: Math.round((urgent / total) * 100),
      color: "#ef4444",
      bg: "rgba(239, 68, 68, 0.15)",
    },
    {
      label: "HIGH",
      count: high,
      pct: Math.round((high / total) * 100),
      color: "#f97316",
      bg: "rgba(249, 115, 22, 0.15)",
    },
    {
      label: "MEDIUM",
      count: medium,
      pct: Math.round((medium / total) * 100),
      color: "#eab308",
      bg: "rgba(234, 179, 8, 0.15)",
    },
    {
      label: "LOW",
      count: low,
      pct: Math.round((low / total) * 100),
      color: "#38bdf8",
      bg: "rgba(56, 189, 248, 0.15)",
    },
  ];

  return (
    <div className="tf-priority-card">
      <div className="tf-priority-header">
        <div className="tf-priority-title">
          <Sliders size={16} style={{ color: "#a855f7" }} />
          <span>PRIORITY INDEX</span>
        </div>
        <span style={{ fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 600 }}>
          System AI Weights
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px", margin: "4px 0 14px 0" }}>
        {categories.map((cat) => (
          <div key={cat.label} style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    fontSize: "9.5px",
                    fontWeight: 800,
                    padding: "2px 7px",
                    borderRadius: "4px",
                    background: cat.bg,
                    color: cat.color,
                    letterSpacing: "0.04em",
                  }}
                >
                  {cat.label}
                </span>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>
                  {cat.count} tasks
                </span>
              </div>
              <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{cat.pct}%</span>
            </div>

            <div
              style={{
                height: "6px",
                background: "rgba(255, 255, 255, 0.08)",
                borderRadius: "3px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${cat.pct}%`,
                  height: "100%",
                  background: cat.color,
                  borderRadius: "3px",
                  transition: "width 0.4s ease",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          paddingTop: "12px",
          borderTop: "1px solid var(--border)",
          fontSize: "11.5px",
          color: "var(--text-muted)",
        }}
      >
        <Sparkles size={13} style={{ color: "#a855f7" }} />
        <span>AI priority distribution</span>
      </div>
    </div>
  );
}
