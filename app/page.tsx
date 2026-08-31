"use client";

import { useEffect } from "react";
import { useTaskStore } from "@/store/task-store";
import { useEmployeeStore } from "@/store/employee-store";
import { getRecommendedTask, isOverdue } from "@/lib/priority-calculator";
import { normalizeAssignedTo } from "@/types/task";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Recommendation } from "@/components/dashboard/recommendation";
import { DeadlineAlerts } from "@/components/dashboard/deadline-alerts";
import { WorkloadOverview } from "@/components/dashboard/workload-overview";
import {
  LayoutDashboard,
  ListTodo,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Flag,
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";

const priorityColors = {
  HIGH: "badge--high",
  MEDIUM: "badge--medium",
  LOW: "badge--low",
};

export default function DashboardPage() {
  const { tasks, fetchTasks, loading } = useTaskStore();
  const { employees, fetchEmployees } = useEmployeeStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchTasks();
    fetchEmployees();
  }, [fetchTasks, fetchEmployees]);

  const isEmployee = user?.role === "EMPLOYEE";
  const currentEmployee = employees.find(e => e.email.toLowerCase() === user?.email?.toLowerCase());

  const displayedTasks = isEmployee
    ? tasks.filter((t) => normalizeAssignedTo(t.assignedTo).includes(currentEmployee?._id ?? ""))
    : tasks;

  const total = displayedTasks.length;
  const todo = displayedTasks.filter((t) => t.status === "TODO").length;
  const inProgress = displayedTasks.filter((t) => t.status === "IN_PROGRESS").length;
  const completed = displayedTasks.filter((t) => t.status === "COMPLETED").length;
  const overdue = displayedTasks.filter((t) => isOverdue(t)).length;
  const recommended = getRecommendedTask(displayedTasks);

  const recentTasks = [...displayedTasks]
    .sort((a, b) => (b.smartScore ?? 0) - (a.smartScore ?? 0))
    .slice(0, 5);

  return (
    <>
      {/* Stats row */}
      <div className="stats-row">
        <StatsCard
          label="Total Tasks"
          value={total}
          sublabel="All tasks in the system"
          icon={LayoutDashboard}
          variant="total"
        />
        <StatsCard
          label="To Do"
          value={todo}
          sublabel="Tasks to be started"
          icon={ListTodo}
          variant="todo"
        />
        <StatsCard
          label="In Progress"
          value={inProgress}
          sublabel="Tasks in progress"
          icon={Loader2}
          variant="progress"
        />
        <StatsCard
          label="Completed"
          value={completed}
          sublabel="Tasks completed"
          icon={CheckCircle2}
          variant="completed"
        />
        <StatsCard
          label="Overdue"
          value={overdue}
          sublabel="Tasks past due date"
          icon={AlertTriangle}
          variant="overdue"
        />
      </div>

      {/* Main grid */}
      <div className="dashboard-grid">
        {/* Left: Recommendation + Deadline Alerts */}
        <div className="dashboard-col" style={{ gap: "24px" }}>
          <Recommendation task={recommended} />
          <DeadlineAlerts tasks={tasks} />
        </div>

        {/* Right: Top Priority Tasks + Workload */}
        <div className="dashboard-col" style={{ gap: "24px" }}>
          <div className="alert-card-container">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <div className="section-heading" style={{ marginBottom: 0 }}>
                <Flag size={16} />
                <span>TOP PRIORITY TASKS</span>
              </div>
              <Link href="/tasks" style={{ fontSize: "12px", color: "var(--primary)", fontWeight: 700 }}>
                View all →
              </Link>
            </div>
            <div className="recent-tasks">
              {loading && tasks.length === 0 ? (
                <p style={{ fontSize: "13px", color: "var(--text-muted)", padding: "10px" }}>Loading tasks…</p>
              ) : recentTasks.length === 0 ? (
                <p style={{ fontSize: "13px", color: "var(--text-muted)", padding: "10px" }}>No tasks yet. Create your first task!</p>
              ) : (
                recentTasks.map((task) => (
                  <div key={task.id} className="recent-task-item">
                    <span className={`badge ${priorityColors[task.priority]}`}>
                      {task.priority}
                    </span>
                    <span className="recent-task-item__title">{task.title}</span>
                    <span className="recent-task-item__score">
                      <Zap size={11} />
                      {task.smartScore}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {!isEmployee ? (
            <WorkloadOverview employees={employees} />
          ) : (
            <div className="workload-card-container">
              <div className="section-heading">
                <CheckCircle2 size={16} />
                <span>MY TASK SUMMARY</span>
              </div>
              <div style={{ padding: "10px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "13px", color: "var(--text-secondary)" }}>
                  <span>Task Completion Rate</span>
                  <span style={{ fontWeight: 700, color: "var(--primary)" }}>{total === 0 ? 0 : Math.round((completed / total) * 100)}%</span>
                </div>
                <div style={{ height: "8px", background: "var(--border)", borderRadius: "4px", overflow: "hidden", marginBottom: "20px" }}>
                  <div style={{
                    width: `${total === 0 ? 0 : Math.round((completed / total) * 100)}%`,
                    height: "100%",
                    background: "var(--primary)",
                    borderRadius: "4px"
                  }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", textAlign: "center", fontSize: "13px" }}>
                  <div style={{ background: "var(--todo-bg)", padding: "12px", borderRadius: "8px" }}>
                    <div style={{ color: "var(--todo)", marginBottom: "4px", fontSize: "11px", fontWeight: 700 }}>TO DO</div>
                    <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>{todo}</div>
                  </div>
                  <div style={{ background: "var(--progress-bg)", padding: "12px", borderRadius: "8px" }}>
                    <div style={{ color: "var(--progress)", marginBottom: "4px", fontSize: "11px", fontWeight: 700 }}>IN PROGRESS</div>
                    <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>{inProgress}</div>
                  </div>
                  <div style={{ background: "var(--completed-bg)", padding: "12px", borderRadius: "8px" }}>
                    <div style={{ color: "var(--completed)", marginBottom: "4px", fontSize: "11px", fontWeight: 700 }}>COMPLETED</div>
                    <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>{completed}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="app-footer">
        © 2026 TaskFlow. All rights reserved.
      </footer>
    </>
  );
}

