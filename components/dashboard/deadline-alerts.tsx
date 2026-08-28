"use client";

import { Task } from "@/types/task";
import { isOverdue, getDeadlineLabel } from "@/lib/priority-calculator";
import { AlertTriangle, Clock } from "lucide-react";
import { clsx } from "clsx";
import Link from "next/link";

interface DeadlineAlertsProps {
  tasks: Task[];
}

export function DeadlineAlerts({ tasks }: DeadlineAlertsProps) {
  const alertTasks = tasks
    .filter((t) => t.status !== "COMPLETED")
    .filter((t) => {
      const label = getDeadlineLabel(t.deadline);
      return (
        isOverdue(t) ||
        label === "Due today" ||
        label === "Due tomorrow" ||
        label.includes("overdue")
      );
    })
    .sort((a, b) => (a.deadline < b.deadline ? -1 : 1));

  if (alertTasks.length === 0) {
    return (
      <div className="alert-panel alert-panel--empty">
        <Clock size={18} />
        <span>All tasks are on track!</span>
      </div>
    );
  }

  return (
    <div className="alert-panel">
      <div className="alert-panel__header">
        <AlertTriangle size={16} />
        <span>{alertTasks.length} Task{alertTasks.length !== 1 ? "s" : ""} Require Attention</span>
      </div>
      <div className="alert-panel__list">
        {alertTasks.map((task) => {
          const overdue = isOverdue(task);
          const label = getDeadlineLabel(task.deadline);
          return (
            <div
              key={task.id}
              className={clsx(
                "alert-item",
                overdue ? "alert-item--red" : "alert-item--orange"
              )}
            >
              <span className="alert-dot" />
              <div className="alert-item__body">
                <span className="alert-item__title">{task.title}</span>
                <span className="alert-item__label">{label}</span>
              </div>
            </div>
          );
        })}
      </div>
      <Link href="/tasks" className="alert-panel__cta">
        View all tasks →
      </Link>
    </div>
  );
}
