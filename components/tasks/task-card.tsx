"use client";

import { Task, TaskStatus, normalizeAssignedTo } from "@/types/task";
import { useTaskStore } from "@/store/task-store";
import { useEmployeeStore } from "@/store/employee-store";
import { useAuthStore } from "@/store/auth-store";
import { getDeadlineLabel, isOverdue } from "@/lib/priority-calculator";
import { Pencil, Trash2, Clock, Zap, ChevronRight, UserCircle } from "lucide-react";
import { clsx } from "clsx";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

const priorityConfig = {
  HIGH: { label: "High", cls: "badge--high" },
  MEDIUM: { label: "Medium", cls: "badge--medium" },
  LOW: { label: "Low", cls: "badge--low" },
};

const statusConfig = {
  TODO: { label: "To Do", cls: "status--todo" },
  IN_PROGRESS: { label: "In Progress", cls: "status--progress" },
  COMPLETED: { label: "Completed", cls: "status--completed" },
};

const nextStatus: Record<TaskStatus, TaskStatus | null> = {
  TODO: "IN_PROGRESS",
  IN_PROGRESS: "COMPLETED",
  COMPLETED: null,
};

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const { deleteTask, updateStatus } = useTaskStore();
  const { employees } = useEmployeeStore();
  const { user } = useAuthStore();

  const priority = priorityConfig[task.priority];
  const status = statusConfig[task.status];
  const deadlineLabel = getDeadlineLabel(task);
  const overdue = isOverdue(task);
  const next = nextStatus[task.status];

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

  return (
    <div className={clsx("task-card", task.status === "COMPLETED" && "task-card--completed")}>
      {/* Top row */}
      <div className="task-card__top">
        <div className="task-card__badges">
          <span className={`badge ${priority.cls}`}>{priority.label}</span>
          <span className={`status-badge ${status.cls}`}>{status.label}</span>
        </div>
        <div className="task-card__score">
          <Zap size={12} />
          {task.smartScore}
        </div>
      </div>

      {/* Title + description */}
      <h3 className="task-card__title">{task.title}</h3>
      {task.description && (
        <p className="task-card__desc">{task.description}</p>
      )}

      {/* Meta */}
      <div className="task-card__meta">
        <span className={clsx("deadline-chip", overdue && "deadline-chip--urgent")}>
          <Clock size={12} />
          {deadlineLabel}
        </span>
        <span className="hours-chip">~{task.estimatedHours}h</span>
        {assignedEmployees.length > 0 && (
          <span className="assigned-chip" title={assignedEmployees.map((e) => e.name).join(", ")}>
            <UserCircle size={12} />
            {assignedEmployees.map((e) => e.name).join(", ")}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="task-card__actions">
        {canEdit && next ? (
          <button
            className="btn btn--advance"
            onClick={() => updateStatus(task.id, next)}
            title={`Move to ${statusConfig[next].label}`}
          >
            <ChevronRight size={14} />
            {statusConfig[next].label}
          </button>
        ) : (
          <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500 }}>
            {canEdit ? (task.status === "COMPLETED" ? "Completed" : "") : "Read only"}
          </span>
        )}
        <div className="task-card__icon-actions">
          {canEdit && (
            <button className="icon-btn" onClick={() => onEdit(task)} aria-label="Edit task">
              <Pencil size={15} />
            </button>
          )}
          {canDelete && (
            <button
              className="icon-btn icon-btn--danger"
              onClick={() => deleteTask(task.id)}
              aria-label="Delete task"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
