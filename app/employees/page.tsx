"use client";

import { useEffect, useState } from "react";
import { useEmployeeStore } from "@/store/employee-store";
import { useTaskStore } from "@/store/task-store";
import { EmployeeList } from "@/components/employees/employee-list";
import { EmployeeForm } from "@/components/employees/employee-form";
import { UserPlus, Users, RefreshCw } from "lucide-react";

export default function EmployeesPage() {
  const { fetchEmployees, loading, error } = useEmployeeStore();
  const { fetchTasks } = useTaskStore();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchEmployees();
    fetchTasks(); // needed for workload counts on task cards
  }, [fetchEmployees, fetchTasks]);

  return (
    <>
      {/* Page header row */}
      <div className="page-action-bar">
        <div className="page-action-bar__left">
          <Users size={18} style={{ color: "var(--grad-start)" }} />
          <span className="page-action-bar__label">Team Members</span>
          {error && <span className="error-chip">{error}</span>}
        </div>
        <div className="page-action-bar__right">
          <button
            className="btn btn--ghost"
            onClick={fetchEmployees}
            disabled={loading}
            aria-label="Refresh"
          >
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            Refresh
          </button>
          <button
            className="btn btn--primary"
            onClick={() => setShowForm(true)}
            id="add-employee-btn"
          >
            <UserPlus size={16} />
            Add Member
          </button>
        </div>
      </div>

      {/* Employee list */}
      <EmployeeList />

      {/* Add modal */}
      {showForm && <EmployeeForm onClose={() => setShowForm(false)} />}
    </>
  );
}
