"use client";

import { useEffect } from "react";
import { useTaskStore } from "@/store/task-store";
import { useEmployeeStore } from "@/store/employee-store";
import { getRecommendedTask, isOverdue } from "@/lib/priority-calculator";
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
  Flame,
  ClipboardList,
  Users,
} from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";
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
    ? tasks.filter((t) => t.assignedTo === currentEmployee?._id)
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
        <StatsCard label="Total Tasks" value={total} icon={LayoutDashboard} variant="total" />
        <StatsCard label="To Do" value={todo} icon={ListTodo} variant="todo" />
        <StatsCard label="In Progress" value={inProgress} icon={Loader2} variant="progress" />
        <StatsCard label="Completed" value={completed} icon={CheckCircle2} variant="completed" />
        <StatsCard label="Overdue" value={overdue} icon={AlertTriangle} variant="overdue" />
      </div>

      {/* Main grid */}
      <div className="dashboard-grid">
        {/* Left: Recommendation + Deadline Alerts */}
        <div className="dashboard-col">
          <div className="section-heading">
            <Flame size={15} />
            Smart Recommendation
          </div>
          <Recommendation task={recommended} />

          <div className="section-heading" style={{ marginTop: "24px" }}>
            <AlertTriangle size={15} />
            Deadline Alerts
          </div>
          <DeadlineAlerts tasks={tasks} />
        </div>

        {/* Right: Top Priority Tasks + Workload */}
        <div className="dashboard-col">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <div className="section-heading" style={{ marginBottom: 0 }}>
              <ClipboardList size={15} />
              Top Priority Tasks
            </div>
            <Link href="/tasks" style={{ fontSize: "12px", color: "var(--grad-start)", fontWeight: 600 }}>
              View all →
            </Link>
          </div>
          <div className="recent-tasks">
            {loading && tasks.length === 0 ? (
              <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Loading tasks…</p>
            ) : recentTasks.length === 0 ? (
              <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>No tasks yet. Create your first task!</p>
            ) : (
              recentTasks.map((task) => (
                <div key={task.id} className="recent-task-item">
                  <span className={`badge ${priorityColors[task.priority]}`}>
                    {task.priority}
                  </span>
                  <span className="recent-task-item__title">{task.title}</span>
                  <span className="recent-task-item__score">
                    <Zap size={10} style={{ display: "inline", marginRight: 2 }} />
                    {task.smartScore}
                  </span>
                </div>
              ))
            )}
          </div>

          {!isEmployee ? (
            <>
              <div className="section-heading" style={{ marginTop: "24px" }}>
                <Users size={15} />
                Team Workload
              </div>
              <WorkloadOverview employees={employees} />
            </>
          ) : (
            <>
              <div className="section-heading" style={{ marginTop: "24px" }}>
                <CheckCircle2 size={15} />
                My Task Completion Summary
              </div>
              <div className="workload-panel" style={{ padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "14px" }}>
                  <span>Task Completion Rate</span>
                  <span style={{ fontWeight: 600 }}>{total === 0 ? 0 : Math.round((completed / total) * 100)}%</span>
                </div>
                <div style={{ height: "8px", background: "var(--border)", borderRadius: "4px", overflow: "hidden", marginBottom: "20px" }}>
                  <div style={{
                    width: `${total === 0 ? 0 : Math.round((completed / total) * 100)}%`,
                    height: "100%",
                    background: "var(--completed)",
                    borderRadius: "4px"
                  }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", textAlign: "center", fontSize: "13px" }}>
                  <div style={{ background: "rgba(99, 102, 241, 0.05)", padding: "10px", borderRadius: "8px" }}>
                    <div style={{ color: "var(--text-muted)", marginBottom: "4px" }}>To Do</div>
                    <div style={{ fontSize: "16px", fontWeight: 700 }}>{todo}</div>
                  </div>
                  <div style={{ background: "rgba(245, 158, 11, 0.05)", padding: "10px", borderRadius: "8px" }}>
                    <div style={{ color: "var(--text-muted)", marginBottom: "4px" }}>In Progress</div>
                    <div style={{ fontSize: "16px", fontWeight: 700 }}>{inProgress}</div>
                  </div>
                  <div style={{ background: "rgba(16, 185, 129, 0.05)", padding: "10px", borderRadius: "8px" }}>
                    <div style={{ color: "var(--text-muted)", marginBottom: "4px" }}>Completed</div>
                    <div style={{ fontSize: "16px", fontWeight: 700 }}>{completed}</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
