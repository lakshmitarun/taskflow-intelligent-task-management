"use client";

import { Task } from "@/types/task";
import { Sparkles, ArrowRight, Clock, Layers } from "lucide-react";
import Link from "next/link";

interface RecommendationProps {
  task: Task | null;
}

export function Recommendation({ task }: RecommendationProps) {
  if (!task) {
    return (
      <div className="tf-rec-card">
        <div className="tf-rec-header">
          <div className="tf-rec-badge">
            <Sparkles size={14} />
            <span>SMART RECOMMENDATION</span>
          </div>
          <span className="tf-rec-impact-badge" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981" }}>
            ALL CLEAR
          </span>
        </div>
        <div className="tf-rec-body" style={{ textAlign: "center", padding: "24px 16px" }}>
          <h3 className="tf-rec-title">No Active Tasks Pending</h3>
          <p className="tf-rec-desc">Great job! All your high priority tasks are completed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tf-rec-card">
      {/* Top Bar */}
      <div className="tf-rec-header">
        <div className="tf-rec-badge">
          <Sparkles size={14} />
          <span>SMART RECOMMENDATION</span>
        </div>
        <span className="tf-rec-impact-badge">CRITICAL IMPACT</span>
      </div>

      {/* Hero Recommendation Headline */}
      <div className="tf-rec-content">
        <h3 className="tf-rec-headline">
          Focus on your highest priority task{" "}
          <span className="tf-priority-pill-high">{task.priority}</span>
        </h3>
        <p className="tf-rec-desc">
          Complete the <strong style={{ color: "var(--text-primary)" }}>{task.title.toLowerCase()}</strong> task before moving to lower-priority work. It is currently blocking dependent frontend authorization flows and team sprints.
        </p>

        {/* Task Inner Glass Card */}
        <div className="tf-rec-task-box">
          <div className="tf-rec-task-left">
            <div className="tf-rec-icon-box">
              <Layers size={18} />
            </div>
            <div>
              <div className="tf-rec-task-title">{task.title}</div>
              <div className="tf-rec-task-meta">
                <span><Clock size={12} /> Today, 05:00 PM</span>
                <span>•</span>
                <span>❖ Backend Core</span>
              </div>
            </div>
          </div>

          <div className="tf-rec-task-right">
            <span className="tf-rec-est-label">EST. LEFT</span>
            <span className="tf-rec-est-value">{task.estimatedHours || 4}h 00m</span>
          </div>
        </div>

        {/* Bottom Metrics Bar */}
        <div className="tf-rec-footer">
          <div className="tf-rec-smartscore-group">
            <div className="tf-rec-score-circle">{task.smartScore || 92}</div>
            <div>
              <div className="tf-rec-score-label">SMARTSCORE</div>
              <div className="tf-rec-score-value">{task.smartScore || 92} / 100</div>
            </div>
          </div>

          <div className="tf-rec-blocked-group">
            <div className="tf-rec-blocked-label">BLOCKED BY</div>
            <div className="tf-rec-blocked-value">None (Unblocked)</div>
          </div>

          <Link href="/tasks" className="tf-rec-view-btn">
            View Task <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}


