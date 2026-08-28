"use client";

import { useEffect } from "react";
import { useTaskStore } from "@/store/task-store";
import { useEmployeeStore } from "@/store/employee-store";
import { isOverdue } from "@/lib/priority-calculator";
import { differenceInDays, parseISO, startOfDay, startOfWeek, endOfWeek } from "date-fns";
import {
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Users,
  Zap,
  BarChart2,
} from "lucide-react";

function ProgressBar({ value, max, cls }: { value: number; max: number; cls: string }) {
  const pct = max === 0 ? 0 : Math.min((value / max) * 100, 100);
  return (
    <div className="analytics-bar-track">
      <div className={`analytics-bar-fill ${cls}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function AnalyticsPage() {
  const { tasks, fetchTasks, loading } = useTaskStore();
  const { employees, fetchEmployees } = useEmployeeStore();

  useEffect(() => {
    fetchTasks();
    fetchEmployees();
  }, [fetchTasks, fetchEmployees]);

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "COMPLETED").length;
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const todo = tasks.filter((t) => t.status === "TODO").length;
  const overdueCount = tasks.filter((t) => isOverdue(t)).length;
  const highPriorityPending = tasks.filter(
    (t) => t.priority === "HIGH" && t.status !== "COMPLETED"
  ).length;

  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

  const today = startOfDay(new Date());
  const weekEnd = endOfWeek(today);
  const dueThisWeek = tasks.filter((t) => {
    if (t.status === "COMPLETED") return false;
    const dl = startOfDay(parseISO(t.deadline));
    const diff = differenceInDays(dl, today);
    return diff >= 0 && diff <= 7;
  }).length;

  const avgTasksPerEmployee =
    employees.length === 0
      ? 0
      : (tasks.filter((t) => t.status !== "COMPLETED").length / employees.length).toFixed(1);

  return (
    <>
      {/* Top KPI cards */}
      <div className="analytics-kpi-grid">
        <div className="analytics-kpi-card">
          <div className="analytics-kpi-icon analytics-kpi-icon--green">
            <TrendingUp size={22} />
          </div>
          <div>
            <p className="analytics-kpi-value">{completionRate}%</p>
            <p className="analytics-kpi-label">Completion Rate</p>
          </div>
        </div>
        <div className="analytics-kpi-card">
          <div className="analytics-kpi-icon analytics-kpi-icon--red">
            <AlertTriangle size={22} />
          </div>
          <div>
            <p className="analytics-kpi-value">{overdueCount}</p>
            <p className="analytics-kpi-label">Overdue Tasks</p>
          </div>
        </div>
        <div className="analytics-kpi-card">
          <div className="analytics-kpi-icon analytics-kpi-icon--orange">
            <Zap size={22} />
          </div>
          <div>
            <p className="analytics-kpi-value">{highPriorityPending}</p>
            <p className="analytics-kpi-label">High Priority Pending</p>
          </div>
        </div>
        <div className="analytics-kpi-card">
          <div className="analytics-kpi-icon analytics-kpi-icon--blue">
            <Clock size={22} />
          </div>
          <div>
            <p className="analytics-kpi-value">{dueThisWeek}</p>
            <p className="analytics-kpi-label">Due This Week</p>
          </div>
        </div>
        <div className="analytics-kpi-card">
          <div className="analytics-kpi-icon analytics-kpi-icon--purple">
            <Users size={22} />
          </div>
          <div>
            <p className="analytics-kpi-value">{avgTasksPerEmployee}</p>
            <p className="analytics-kpi-label">Avg Tasks / Member</p>
          </div>
        </div>
      </div>

      {/* Completion Rate */}
      <div className="analytics-section">
        <div className="analytics-section-header">
          <BarChart2 size={16} />
          <h2 className="analytics-section-title">Team Performance</h2>
        </div>
        <div className="analytics-completion">
          <div className="analytics-completion-header">
            <span className="analytics-completion-label">Completion Rate</span>
            <span className="analytics-completion-pct">{completionRate}%</span>
          </div>
          <ProgressBar value={completed} max={total} cls="analytics-bar-fill--green" />
        </div>

        {/* Status breakdown */}
        <div className="analytics-breakdown">
          {[
            { label: "Completed", value: completed, max: total, cls: "analytics-bar-fill--green", dot: "dot--green" },
            { label: "In Progress", value: inProgress, max: total, cls: "analytics-bar-fill--blue", dot: "dot--blue" },
            { label: "To Do", value: todo, max: total, cls: "analytics-bar-fill--gray", dot: "dot--gray" },
            { label: "Overdue", value: overdueCount, max: total, cls: "analytics-bar-fill--red", dot: "dot--red" },
          ].map(({ label, value, max, cls, dot }) => (
            <div key={label} className="analytics-breakdown-row">
              <div className="analytics-breakdown-label">
                <span className={`analytics-dot ${dot}`} />
                <span>{label}</span>
              </div>
              <ProgressBar value={value} max={max} cls={cls} />
              <span className="analytics-breakdown-count">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Breakdown */}
      <div className="analytics-section">
        <div className="analytics-section-header">
          <Zap size={16} />
          <h2 className="analytics-section-title">Priority Distribution</h2>
        </div>
        <div className="analytics-breakdown">
          {(["HIGH", "MEDIUM", "LOW"] as const).map((priority) => {
            const count = tasks.filter((t) => t.priority === priority).length;
            const dotMap = { HIGH: "dot--red", MEDIUM: "dot--orange", LOW: "dot--green" };
            const barMap = {
              HIGH: "analytics-bar-fill--red",
              MEDIUM: "analytics-bar-fill--orange",
              LOW: "analytics-bar-fill--green",
            };
            return (
              <div key={priority} className="analytics-breakdown-row">
                <div className="analytics-breakdown-label">
                  <span className={`analytics-dot ${dotMap[priority]}`} />
                  <span>{priority.charAt(0) + priority.slice(1).toLowerCase()} Priority</span>
                </div>
                <ProgressBar value={count} max={total} cls={barMap[priority]} />
                <span className="analytics-breakdown-count">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {loading && tasks.length === 0 && (
        <p style={{ textAlign: "center", color: "var(--text-muted)", marginTop: "40px" }}>
          Loading analytics…
        </p>
      )}
    </>
  );
}
