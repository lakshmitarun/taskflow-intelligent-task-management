"use client";

import { Task } from "@/types/task";
import { getDeadlineLabel } from "@/lib/priority-calculator";
import { Star, Award, Clock, ArrowRight } from "lucide-react";
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
      <div className="recommendation-card">
        <div className="section-heading">
          <Star size={16} />
          <span>SMART RECOMMENDATION</span>
        </div>
        <div className="recommendation-panel">
          <div className="recommendation-circle-icon">
            <Award size={36} />
          </div>
          <h3 className="recommendation-heading">All caught up!</h3>
          <p className="recommendation-text">
            Great job! You have no active tasks right now. Enjoy your free time or pick up a completed task to keep the momentum going.
          </p>
          <Link href="/tasks" className="btn btn--primary">
            Browse Completed Tasks
          </Link>
        </div>
      </div>
    );
  }

  const deadlineLabel = getDeadlineLabel(task);
  const isUrgent = deadlineLabel.includes("overdue") || deadlineLabel === "Due today";

  return (
    <div className="recommendation-card">
      <div className="section-heading" style={{ justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Star size={16} />
          <span>SMART RECOMMENDATION</span>
        </div>
        <span style={{ fontSize: "12px", color: "var(--primary)", fontWeight: 700 }}>
          Score: {task.smartScore}
        </span>
      </div>

      <div className="recommendation-panel">
        <div className="recommendation-circle-icon">
          <Award size={36} />
        </div>
        <h3 className="recommendation-heading">{task.title}</h3>
        <p className="recommendation-text">
          {task.description || "This task is your highest priority item based on deadline and impact."}
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
          <span className={`badge ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
          <span className={`deadline-chip ${isUrgent ? "deadline-chip--urgent" : ""}`}>
            <Clock size={12} />
            {deadlineLabel}
          </span>
          <span className="hours-chip">~{task.estimatedHours}h</span>
        </div>

        <Link href="/tasks" className="btn btn--primary">
          Work on this next
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}

