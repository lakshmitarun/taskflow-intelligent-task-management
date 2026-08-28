"use client";

import { Task } from "@/types/task";
import { getDeadlineLabel } from "@/lib/priority-calculator";
import { Flame, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

interface RecommendationProps {
  task: Task | null;
}

const priorityColors = {
  HIGH: "badge--high",
  MEDIUM: "badge--medium",
  LOW: "badge--low",
};

export function Recommendation({ task }: RecommendationProps) {
  if (!task) {
    return (
      <div className="recommendation recommendation--empty">
        <Flame size={32} className="empty-icon" />
        <p className="empty-text">All caught up! No active tasks.</p>
      </div>
    );
  }

  const deadlineLabel = getDeadlineLabel(task.deadline);
  const isUrgent = deadlineLabel.includes("overdue") || deadlineLabel === "Due today";

  return (
    <div className="recommendation">
      {/* Header */}
      <div className="recommendation__header">
        <div className="recommendation__badge">
          <Flame size={14} />
          Smart Recommendation
        </div>
        <span className="recommendation__score">Score: {task.smartScore}</span>
      </div>

      {/* Content */}
      <div className="recommendation__body">
        <h3 className="recommendation__title">{task.title}</h3>
        {task.description && (
          <p className="recommendation__desc">{task.description}</p>
        )}
        <div className="recommendation__meta">
          <span className={`badge ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
          <span className={`deadline-chip ${isUrgent ? "deadline-chip--urgent" : ""}`}>
            <Clock size={12} />
            {deadlineLabel}
          </span>
          <span className="hours-chip">
            ~{task.estimatedHours}h
          </span>
        </div>
      </div>

      {/* CTA */}
      <Link href="/tasks" className="recommendation__cta">
        Work on this next
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}
