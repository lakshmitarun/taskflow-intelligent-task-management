"use client";

import { clsx } from "clsx";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  variant: "total" | "todo" | "progress" | "completed" | "overdue";
  sublabel?: string;
}

const sparklinePaths: Record<string, { d: string; color: string }> = {
  total: {
    d: "M0,25 Q15,15 30,20 T60,5 T90,18",
    color: "#2563eb",
  },
  todo: {
    d: "M0,18 Q15,25 30,10 T60,20 T90,8",
    color: "#f59e0b",
  },
  progress: {
    d: "M0,22 Q15,8 30,18 T60,12 T90,5",
    color: "#6366f1",
  },
  completed: {
    d: "M0,28 Q15,20 30,22 T60,10 T90,4",
    color: "#10b981",
  },
  overdue: {
    d: "M0,15 Q15,25 30,10 T60,22 T90,12",
    color: "#ef4444",
  },
};

export function StatsCard({ label, value, icon: Icon, variant, sublabel }: StatsCardProps) {
  const sparkline = sparklinePaths[variant];

  return (
    <div className={clsx("stats-card", `stats-card--${variant}`)} style={{ position: "relative" }}>
      <div className="stats-card__top">
        <div className="stats-card__icon">
          <Icon size={20} />
        </div>
        <div className="stats-card__value-wrapper">
          <span className="stats-card__value">{value}</span>
          <span className="stats-card__label">{label}</span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "4px" }}>
        {sublabel && <span className="stats-card__sublabel">{sublabel}</span>}
        <svg width="60" height="24" viewBox="0 0 90 30" fill="none" style={{ overflow: "visible", marginLeft: "auto" }}>
          <path
            d={sparkline.d}
            stroke={sparkline.color}
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>
    </div>
  );
}


