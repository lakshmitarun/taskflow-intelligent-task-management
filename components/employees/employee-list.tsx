"use client";

import { useState } from "react";
import { Employee, getWorkloadLevel } from "@/types/employee";
import { useEmployeeStore } from "@/store/employee-store";
import { useAuthStore } from "@/store/auth-store";
import { EmployeeForm } from "./employee-form";
import { Pencil, Trash2, Mail, Briefcase, Home, Users } from "lucide-react";

import { useUIStore } from "@/store/ui-store";

const workloadConfig = {
  LOW: { label: "Low Workload", color: "#10b981", bg: "rgba(16, 185, 129, 0.12)", border: "rgba(16, 185, 129, 0.25)" },
  MEDIUM: { label: "Medium Workload", color: "#eab308", bg: "rgba(234, 179, 8, 0.12)", border: "rgba(234, 179, 8, 0.25)" },
  HIGH: { label: "High Workload", color: "#ef4444", bg: "rgba(239, 68, 68, 0.12)", border: "rgba(239, 68, 68, 0.25)" },
};

export function EmployeeList() {
  const { employees, deleteEmployee } = useEmployeeStore();
  const { searchQuery } = useUIStore();
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const { user } = useAuthStore();

  const filteredEmployees = employees.filter((emp) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      emp.name.toLowerCase().includes(q) ||
      emp.email.toLowerCase().includes(q) ||
      emp.role.toLowerCase().includes(q) ||
      (emp.department ?? "").toLowerCase().includes(q)
    );
  });

  if (filteredEmployees.length === 0) {
    return (
      <div className="empty-state">
        <Users size={48} className="empty-state__icon" />
        <h3 className="empty-state__title">
          {employees.length === 0 ? "No team members yet" : "No matching team members"}
        </h3>
        <p className="empty-state__desc">
          {employees.length === 0
            ? "Add your first team member to start assigning tasks."
            : "Try adjusting your search terms."}
        </p>
        {editEmployee && (
          <EmployeeForm
            employee={editEmployee}
            onClose={() => setEditEmployee(null)}
          />
        )}
      </div>
    );
  }

  return (
    <>
      <div className="employee-grid">
        {filteredEmployees.map((emp) => {
          const count = emp.activeTaskCount ?? 0;
          const level = getWorkloadLevel(count);
          const wl = workloadConfig[level];
          const initial = emp.name.charAt(0).toUpperCase();

          return (
            <div
              key={emp._id}
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "22px 24px", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 4px 14px rgba(0, 0, 0, 0.12)" }}
            >
              <div>
                {/* Avatar */}
                <div style={{ width: "46px", height: "46px", borderRadius: "50%", background: "#2563eb", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 800, marginBottom: "16px", boxShadow: "0 4px 10px rgba(37, 99, 235, 0.3)" }}>
                  {initial}
                </div>

                {/* Name */}
                <h3 style={{ fontSize: "14.5px", fontWeight: 800, color: "#ffffff", letterSpacing: "0.02em", textTransform: "uppercase", marginBottom: "14px" }}>
                  {emp.name}
                </h3>

                {/* Info List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>
                    <Briefcase size={13} style={{ color: "var(--text-muted)" }} />
                    <span>{emp.role}</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>
                    <Home size={13} style={{ color: "var(--text-muted)" }} />
                    <span>{emp.department ? emp.department.toUpperCase() : "ENGINEERING"}</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11.5px", color: "var(--text-muted)", fontWeight: 500 }}>
                    <Mail size={13} style={{ color: "var(--text-muted)" }} />
                    <span style={{ textTransform: "none" }}>{emp.email}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: "14px", marginTop: "8px" }}>
                <span style={{ background: wl.bg, color: wl.color, border: `1px solid ${wl.border}`, fontSize: "11px", fontWeight: 700, borderRadius: "9999px", padding: "4px 12px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  {count} active task{count !== 1 ? "s" : ""} · {wl.label}
                </span>

                {user?.role === "ADMIN" && (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <button
                      className="icon-btn"
                      onClick={() => setEditEmployee(emp)}
                      aria-label="Edit employee"
                      title="Edit employee"
                      style={{ width: "30px", height: "30px" }}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      className="icon-btn icon-btn--danger"
                      onClick={() => deleteEmployee(emp._id)}
                      aria-label="Delete employee"
                      title="Delete employee"
                      style={{ width: "30px", height: "30px" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {editEmployee && (
        <EmployeeForm
          employee={editEmployee}
          onClose={() => setEditEmployee(null)}
        />
      )}
    </>
  );
}

