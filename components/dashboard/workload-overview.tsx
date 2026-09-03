"use client";

import { Employee } from "@/types/employee";
import { Users, ArrowRight } from "lucide-react";
import Link from "next/link";

interface WorkloadOverviewProps {
  employees: Employee[];
}

const defaultAdminEmployees = [
  { _id: "1", name: "PALIVELA LAKSHMI TARUN", activeTaskCount: 2, status: "Balanced", color: "#10b981", bg: "rgba(16, 185, 129, 0.15)", pct: 40 },
  { _id: "2", name: "THARUN BOLE", activeTaskCount: 4, status: "High", color: "#f97316", bg: "rgba(249, 115, 22, 0.15)", pct: 65 },
  { _id: "3", name: "Y. ROOPA SRI", activeTaskCount: 1, status: "Optimal", color: "#38bdf8", bg: "rgba(56, 189, 248, 0.15)", pct: 20 },
  { _id: "4", name: "SURENDRA CHENNAMALLI", activeTaskCount: 5, status: "High", color: "#ef4444", bg: "rgba(239, 68, 68, 0.15)", pct: 80 },
  { _id: "5", name: "M. HARSHA VARDHAN NAIDU", activeTaskCount: 3, status: "Available", color: "#818cf8", bg: "rgba(129, 140, 248, 0.15)", pct: 50 },
];

const avatarBgs = ["#0284c7", "#7c3aed", "#d97706", "#4f46e5", "#059669"];

export function WorkloadOverview({ employees }: WorkloadOverviewProps) {
  const displayEmployees = employees.length > 0
    ? employees.map((e) => {
        const count = e.activeTaskCount ?? 0;
        const pct = Math.round(Math.min((count / 6) * 100, 100));
        let status = "Balanced";
        let color = "#10b981";
        let bg = "rgba(16, 185, 129, 0.15)";
        if (pct > 70) {
          status = "High"; color = "#ef4444"; bg = "rgba(239, 68, 68, 0.15)";
        } else if (pct > 50) {
          status = "High"; color = "#f97316"; bg = "rgba(249, 115, 22, 0.15)";
        } else if (pct < 30) {
          status = "Optimal"; color = "#38bdf8"; bg = "rgba(56, 189, 248, 0.15)";
        }
        return {
          _id: e._id,
          name: e.name.toUpperCase(),
          activeTaskCount: count,
          status,
          color,
          bg,
          pct,
        };
      })
    : defaultAdminEmployees;

  return (
    <div className="tf-workload-card">
      {/* Header */}
      <div className="tf-workload-header">
        <div className="tf-workload-title">
          <Users size={15} style={{ color: "#818cf8" }} />
          <span>TEAM CAPACITY & WORKLOAD</span>
        </div>
        <Link href="/employees" className="tf-priority-view-link">
          Manage employees <ArrowRight size={13} />
        </Link>
      </div>

      {/* Member Rows */}
      <div className="tf-workload-list">
        {displayEmployees.map((emp, idx) => {
          const nameParts = emp.name.trim().split(" ");
          const initials = nameParts.length >= 2
            ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
            : emp.name.slice(0, 2).toUpperCase();

          return (
            <div key={emp._id || idx} className="tf-workload-row">
              <div
                className="tf-workload-avatar"
                style={{ background: avatarBgs[idx % avatarBgs.length] }}
              >
                {initials}
              </div>

              <div className="tf-workload-body">
                <div className="tf-workload-meta">
                  <span className="tf-workload-name">{emp.name}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className="tf-workload-count">
                      {emp.activeTaskCount} {emp.activeTaskCount === 1 ? "task" : "tasks"} ({emp.pct}%)
                    </span>
                    <span
                      style={{
                        fontSize: "9.5px",
                        fontWeight: 800,
                        padding: "1px 6px",
                        borderRadius: "4px",
                        background: emp.bg,
                        color: emp.color,
                      }}
                    >
                      {emp.status}
                    </span>
                  </div>
                </div>

                <div className="tf-workload-track">
                  <div
                    className="tf-workload-fill"
                    style={{
                      width: `${emp.pct}%`,
                      background: emp.color,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="tf-workload-footer">
        <div className="tf-workload-capacity">
          <span className="tf-workload-dot" />
          <span>Optimal capacity (Avg 32% load)</span>
        </div>

        <Link href="/employees" className="tf-workload-rebalance-link">
          Rebalance suggestions
        </Link>
      </div>
    </div>
  );
}



