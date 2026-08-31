"use client";

import { Task } from "@/types/task";
import { isOverdue, getDeadlineLabel } from "@/lib/priority-calculator";
import { AlertTriangle, Calendar, Check } from "lucide-react";
import { clsx } from "clsx";
import Link from "next/link";

interface DeadlineAlertsProps {
  tasks: Task[];
}

export function DeadlineAlerts({ tasks }: DeadlineAlertsProps) {
  const alertTasks = tasks
    .filter((t) => t.status !== "COMPLETED")
    .filter((t) => {
      const label = getDeadlineLabel(t);
      return (
        isOverdue(t) ||
        label === "Due today" ||
        label === "Due tomorrow" ||
        label.includes("overdue") ||
        label === "Expired"
      );
    })
    .sort((a, b) => (a.deadline < b.deadline ? -1 : 1));

  return (
    <div className="alert-card-container">
      <div className="section-heading">
        <Calendar size={16} style={{ color: "#f43f5e" }} />
        <span>DEADLINE ALERTS</span>
      </div>

      {alertTasks.length === 0 ? (
        <div className="alert-panel--on-track" style={{ background: "#fdf2f8", borderColor: "#fbcfe8" }}>
          <div className="alert-icon-check" style={{ background: "#f43f5e" }}>
            <Check size={20} />
          </div>
          <div>
            <h4 className="alert-on-track-title" style={{ color: "#e11d48" }}>All tasks are on track!</h4>
            <p className="alert-on-track-desc" style={{ color: "#9f1239" }}>You have no upcoming deadlines.</p>
          </div>
        </div>
      ) : (
        <div className="alert-panel">
          <div className="alert-panel__header">
            <AlertTriangle size={16} />
            <span>{alertTasks.length} Task{alertTasks.length !== 1 ? "s" : ""} Require Attention</span>
          </div>
          <div className="alert-panel__list">
            {alertTasks.map((task) => {
              const overdue = isOverdue(task);
              const label = getDeadlineLabel(task);
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
      )}
    </div>
  );
}

