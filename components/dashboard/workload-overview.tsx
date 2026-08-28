"use client";

import { Employee, getWorkloadLevel } from "@/types/employee";
import { Users } from "lucide-react";
import { clsx } from "clsx";
import Link from "next/link";

interface WorkloadOverviewProps {
  employees: Employee[];
}

const levelConfig = {
  LOW: { cls: "workload--low", bar: "workload-bar--low" },
  MEDIUM: { cls: "workload--medium", bar: "workload-bar--medium" },
  HIGH: { cls: "workload--high", bar: "workload-bar--high" },
};

const MAX_TASKS = 10; // used to scale the bar

export function WorkloadOverview({ employees }: WorkloadOverviewProps) {
  if (employees.length === 0) {
    return (
      <div className="alert-panel alert-panel--empty">
        <Users size={18} />
        <span>No team members yet. <Link href="/employees" style={{ color: "var(--grad-start)" }}>Add members →</Link></span>
      </div>
    );
  }

  return (
    <div className="workload-panel">
      {employees.map((emp) => {
        const count = emp.activeTaskCount ?? 0;
        const level = getWorkloadLevel(count);
        const cfg = levelConfig[level];
        const pct = Math.min((count / MAX_TASKS) * 100, 100);

        return (
          <div key={emp._id} className="workload-row">
            <div className="workload-avatar">
              {emp.name.charAt(0).toUpperCase()}
            </div>
            <div className="workload-details">
              <div className="workload-name-row">
                <span className="workload-name">{emp.name}</span>
                <span className={clsx("workload-badge", cfg.cls)}>
                  {count} task{count !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="workload-bar-track">
                <div
                  className={clsx("workload-bar-fill", cfg.bar)}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
