"use client";

import { clsx } from "clsx";
import { Folder, ClipboardList, Timer, CheckCircle2, AlertTriangle, Activity } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: number;
  variant: "total" | "todo" | "progress" | "completed" | "overdue";
  sublabel: string;
  badgeText: string;
}

export function StatsCard({ label, value, variant, sublabel, badgeText }: StatsCardProps) {
  return (
    <div className={clsx("stats-card-v2", `stats-card-v2--${variant}`)}>
      <div className="stats-card-v2__header">
        <span className="stats-card-v2__label">{label.toUpperCase()}</span>
        <div className="stats-card-v2__icon-box">
          {variant === "total" && <Folder size={16} />}
          {variant === "todo" && <ClipboardList size={16} />}
          {variant === "progress" && <Timer size={16} />}
          {variant === "completed" && <CheckCircle2 size={16} />}
          {variant === "overdue" && <AlertTriangle size={16} />}
        </div>
      </div>

      <div className="stats-card-v2__value-row">
        <span className="stats-card-v2__value">{value}</span>
        <span className={clsx("stats-card-v2__badge", `stats-badge--${variant}`)}>
          {variant === "total" && <Activity size={11} style={{ marginRight: 3 }} />}
          {badgeText}
        </span>
      </div>

      <div className="stats-card-v2__sublabel">{sublabel}</div>
    </div>
  );
}



