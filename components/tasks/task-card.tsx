"use client";

import { Task, TaskStatus, normalizeAssignedTo } from "@/types/task";
import { useTaskStore } from "@/store/task-store";
import { useEmployeeStore } from "@/store/employee-store";
import { useAuthStore } from "@/store/auth-store";
import { getDeadlineLabel, isOverdue } from "@/lib/priority-calculator";
import { Pencil, Trash2, Clock, Zap, ChevronRight, User } from "lucide-react";
import { clsx } from "clsx";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

const nextStatusMap: Record<TaskStatus, TaskStatus | null> = {
  TODO: "IN_PROGRESS",
  IN_PROGRESS: "COMPLETED",
  COMPLETED: null,
};

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const { deleteTask, updateStatus } = useTaskStore();
  const { employees } = useEmployeeStore();
  const { user } = useAuthStore();

  const deadlineLabel = getDeadlineLabel(task);
  const overdue = isOverdue(task);
  const next = nextStatusMap[task.status];

  const assignedIds = normalizeAssignedTo(task.assignedTo);
  const assignedEmployees = employees.filter((e) => assignedIds.includes(e._id));

  const isAdmin = user?.role === "ADMIN";
  const currentEmp = employees.find(
    (e) => e.email.toLowerCase() === user?.email?.toLowerCase()
  );
  const currentEmpId = currentEmp?._id;

  const isAssigned = Boolean(
    (currentEmpId && assignedIds.includes(currentEmpId)) ||
      (user?.id && assignedIds.includes(user.id)) ||
      (user?.email &&
        assignedIds.some((id) => id.toLowerCase() === user.email.toLowerCase()))
  );

  const canEdit = isAdmin || isAssigned;
  const canDelete = isAdmin;

  // Priority color config matching exact screenshot theme
  let priorityBg = "#b45309"; // Medium (Amber)
  let priorityColor = "#ffedd5";

  if (task.priority === "HIGH") {
    priorityBg = "#991b1b";
    priorityColor = "#fecaca";
  } else if (task.priority === "LOW") {
    priorityBg = "#047857";
    priorityColor = "#a7f3d0";
  }

  // Status color config matching screenshot
  let statusText = "To Do";
  let statusBg = "rgba(234, 179, 8, 0.15)";
  let statusColor = "#eab308";

  if (task.status === "IN_PROGRESS") {
    statusText = "In Progress";
    statusBg = "rgba(168, 85, 247, 0.15)";
    statusColor = "#c084fc";
  } else if (task.status === "COMPLETED") {
    statusText = "Completed";
    statusBg = "rgba(16, 185, 129, 0.15)";
    statusColor = "#34d399";
  }

  return (
    <div
      className={clsx("task-card-v2", task.status === "COMPLETED" && "task-card-v2--completed")}
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "18px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 4px 14px rgba(0, 0, 0, 0.12)", position: "relative" }}
    >
      <div>
        {/* Top Badges Row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                background: priorityBg,
                color: priorityColor,
                fontSize: "10px",
                fontWeight: 800,
                padding: "2px 9px",
                borderRadius: "6px",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              {task.priority}
            </span>

            <span
              style={{
                background: statusBg,
                color: statusColor,
                fontSize: "10.5px",
                fontWeight: 700,
                padding: "2px 9px",
                borderRadius: "6px",
              }}
            >
              {statusText}
            </span>
          </div>

          <div
            style={{
              background: "rgba(37, 99, 235, 0.2)",
              color: "#3b82f6",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              fontSize: "11px",
              fontWeight: 800,
              padding: "2px 8px",
              borderRadius: "9999px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <Zap size={11} fill="#3b82f6" />
            <span>{task.smartScore ?? 75}</span>
          </div>
        </div>

        {/* Title */}
        <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px", lineHeight: 1.3 }}>
          {task.title}
        </h3>

        {/* Description */}
        {task.description && (
          <p style={{ fontSize: "12.5px", color: "var(--text-muted)", marginBottom: "14px", lineHeight: 1.45 }}>
            {task.description}
          </p>
        )}

        {/* Meta Chips Row */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", margin: "12px 0 14px 0" }}>
          <span
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              padding: "3px 9px",
              fontSize: "11.5px",
              color: overdue ? "#ef4444" : "var(--text-muted)",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <Clock size={12} />
            <span>{deadlineLabel}</span>
          </span>

          <span
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              padding: "3px 9px",
              fontSize: "11.5px",
              color: "var(--text-muted)",
            }}
          >
            ~{task.estimatedHours}h
          </span>

          {assignedEmployees.map((emp) => (
            <span
              key={emp._id}
              style={{
                background: "rgba(37, 99, 235, 0.2)",
                color: "#60a5fa",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                borderRadius: "6px",
                padding: "3px 9px",
                fontSize: "10.5px",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                textTransform: "uppercase",
              }}
            >
              <User size={11} />
              <span>{emp.name}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Footer Row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: "12px", marginTop: "6px" }}>
        <div>
          {canEdit && next ? (
            <button
              className="btn btn--advance"
              onClick={() => updateStatus(task.id, next)}
              style={{
                background: "rgba(99, 102, 241, 0.12)",
                color: "#818cf8",
                border: "1px solid rgba(99, 102, 241, 0.25)",
                borderRadius: "8px",
                padding: "4px 10px",
                fontSize: "11.5px",
                fontWeight: 700,
              }}
            >
              <ChevronRight size={13} />
              Move to {next === "IN_PROGRESS" ? "In Progress" : "Completed"}
            </button>
          ) : (
            <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>
              {statusText}
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {canEdit && (
            <button
              className="icon-btn"
              onClick={() => onEdit(task)}
              aria-label="Edit task"
              title="Edit task"
              style={{ width: "30px", height: "30px" }}
            >
              <Pencil size={14} />
            </button>
          )}
          {canDelete && (
            <button
              className="icon-btn icon-btn--danger"
              onClick={() => deleteTask(task.id)}
              aria-label="Delete task"
              title="Delete task"
              style={{ width: "30px", height: "30px" }}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

