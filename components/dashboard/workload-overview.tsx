"use client";

import { Employee } from "@/types/employee";
import { Users } from "lucide-react";
import Link from "next/link";

interface WorkloadOverviewProps {
  employees: Employee[];
}

const MAX_TASKS = 10;

export function WorkloadOverview({ employees }: WorkloadOverviewProps) {
  return (
    <div className="workload-card-container">
      <div className="section-heading">
        <Users size={16} />
        <span>TEAM WORKLOAD</span>
      </div>

      {employees.length === 0 ? (
        <div style={{ padding: "20px", textAlign: "center", color: "var(--text-secondary)", fontSize: "13px" }}>
          No team members yet. <Link href="/employees" style={{ color: "var(--primary)", fontWeight: 600 }}>Add members →</Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {employees.map((emp) => {
            const count = emp.activeTaskCount ?? 0;
            const pct = Math.round(Math.min((count / MAX_TASKS) * 100, 100));

            return (
              <div key={emp._id} className="workload-row">
                <div className="workload-avatar">
                  {emp.name.charAt(0).toUpperCase()}
                </div>
                <div className="workload-details">
                  <div className="workload-name-row">
                    <span className="workload-name">{emp.name}</span>
                    <span className="workload-meta">
                      {count} tasks &nbsp; {pct}%
                    </span>
                  </div>
                  <div className="workload-bar-track">
                    <div
                      className="workload-bar-fill"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

