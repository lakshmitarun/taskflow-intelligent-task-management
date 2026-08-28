"use client";

import { clsx } from "clsx";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  variant: "total" | "todo" | "progress" | "completed" | "overdue";
}

export function StatsCard({ label, value, icon: Icon, variant }: StatsCardProps) {
  return (
    <div className={clsx("stats-card", `stats-card--${variant}`)}>
      <div className="stats-card__icon">
        <Icon size={20} />
      </div>
      <div className="stats-card__body">
        <span className="stats-card__value">{value}</span>
        <span className="stats-card__label">{label}</span>
      </div>
    </div>
  );
}
