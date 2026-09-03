"use client";

import { Task } from "@/types/task";
import { isOverdue, getDeadlineLabel } from "@/lib/priority-calculator";
import { Bell, Clock, CheckCircle2 } from "lucide-react";
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
        label.includes("due in") ||
        label === "Expired"
      );
    })
    .sort((a, b) => (a.deadline < b.deadline ? -1 : 1))
    .slice(0, 3);

  const urgentCount = alertTasks.filter(
    (t) => isOverdue(t) || getDeadlineLabel(t) === "Due today"
  ).length;

  return (
    <div className="tf-alerts-card">
      {/* Header */}
      <div className="tf-alerts-header">
        <div className="tf-alerts-title">
          <Bell size={15} style={{ color: "#ef4444" }} />
          <span>DEADLINE ALERTS</span>
        </div>
        <span className="tf-alerts-urgent-badge">
          {urgentCount > 0 ? `${urgentCount} Urgent` : "On Track"}
        </span>
      </div>

      {/* Task List Items */}
      <div className="tf-alerts-list">
        {alertTasks.length === 0 ? (
          <div style={{ padding: "16px", color: "var(--text-secondary)", fontSize: "13px" }}>
            No pending deadline alerts right now!
          </div>
        ) : (
          alertTasks.map((task, idx) => {
            const label = getDeadlineLabel(task);
            const overdue = isOverdue(task);
            const isToday = label === "Due today";

            let borderClass = "tf-alert-item--blue";
            if (overdue || isToday) borderClass = "tf-alert-item--red";
            else if (label === "Due tomorrow") borderClass = "tf-alert-item--yellow";

            return (
              <div key={task.id || idx} className={`tf-alert-item ${borderClass}`}>
                <div className="tf-alert-item-body">
                  <div className="tf-alert-item-title">{task.title}</div>
                  <div className="tf-alert-item-meta">
                    <Clock size={12} />
                    <span>
                      {isToday
                        ? "Due Today (Urgent / High)"
                        : label === "Due tomorrow"
                        ? "Due Tomorrow"
                        : label}
                    </span>
                  </div>
                </div>

                <Link
                  href="/tasks"
                  className={idx === 0 ? "tf-alert-btn-submit" : "tf-alert-btn-open"}
                >
                  {idx === 0 ? "Submit" : "Open"}
                </Link>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom On-Track Banner */}
      <div className="tf-alerts-banner">
        <CheckCircle2 size={15} style={{ color: "#10b981" }} />
        <span>No overdue tasks across active sprint. Great pace!</span>
      </div>
    </div>
  );
}


