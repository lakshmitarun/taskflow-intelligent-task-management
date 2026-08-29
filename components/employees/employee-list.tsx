"use client";

import { useState } from "react";
import { Employee, getWorkloadLevel } from "@/types/employee";
import { useEmployeeStore } from "@/store/employee-store";
import { useAuthStore } from "@/store/auth-store";
import { EmployeeForm } from "./employee-form";
import { Pencil, Trash2, Mail, Briefcase, Building2, Users } from "lucide-react";
import { clsx } from "clsx";

const workloadConfig = {
  LOW: { label: "Low Workload", cls: "workload--low" },
  MEDIUM: { label: "Medium Workload", cls: "workload--medium" },
  HIGH: { label: "High Workload", cls: "workload--high" },
};

export function EmployeeList() {
  const { employees, deleteEmployee } = useEmployeeStore();
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const { user } = useAuthStore();

  if (employees.length === 0) {
    return (
      <div className="empty-state">
        <Users size={48} className="empty-state__icon" />
        <h3 className="empty-state__title">No team members yet</h3>
        <p className="empty-state__desc">
          Add your first team member to start assigning tasks.
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
        {employees.map((emp) => {
          const level = getWorkloadLevel(emp.activeTaskCount ?? 0);
          const wl = workloadConfig[level];
          return (
            <div key={emp._id} className="employee-card">
              {/* Avatar */}
              <div className="employee-avatar">
                {emp.name.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div className="employee-info">
                <h3 className="employee-name">{emp.name}</h3>
                <div className="employee-meta">
                  <span className="employee-meta-item">
                    <Briefcase size={12} />
                    {emp.role}
                  </span>
                  {emp.department && (
                    <span className="employee-meta-item">
                      <Building2 size={12} />
                      {emp.department}
                    </span>
                  )}
                  <span className="employee-meta-item">
                    <Mail size={12} />
                    {emp.email}
                  </span>
                </div>
              </div>

              {/* Workload */}
              <div className="employee-footer">
                <span className={clsx("workload-badge", wl.cls)}>
                  {emp.activeTaskCount ?? 0} active task{emp.activeTaskCount !== 1 ? "s" : ""} · {wl.label}
                </span>
                {user?.role === "ADMIN" && (
                  <div className="task-card__icon-actions">
                    <button
                      className="icon-btn"
                      onClick={() => setEditEmployee(emp)}
                      aria-label="Edit employee"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className="icon-btn icon-btn--danger"
                      onClick={() => deleteEmployee(emp._id)}
                      aria-label="Delete employee"
                    >
                      <Trash2 size={15} />
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
