"use client";

import { useEffect } from "react";
import { useTaskStore } from "@/store/task-store";
import { useEmployeeStore } from "@/store/employee-store";
import { isOverdue } from "@/lib/priority-calculator";
import { normalizeAssignedTo } from "@/types/task";
import { StatsCard } from "@/components/dashboard/stats-card";
import { TaskStatusOverview } from "@/components/dashboard/task-status-overview";
import { DeadlineAlerts } from "@/components/dashboard/deadline-alerts";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { PriorityIndex } from "@/components/dashboard/priority-index";
import { WorkloadOverview } from "@/components/dashboard/workload-overview";
import { Zap, Flag } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";

export default function DashboardPage() {
  const { tasks, fetchTasks, loading } = useTaskStore();
  const { employees, fetchEmployees } = useEmployeeStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchTasks();
    fetchEmployees();
  }, [fetchTasks, fetchEmployees]);

  const isEmployee = user?.role === "EMPLOYEE";
  const currentEmployee = employees.find(
    (e) => e.email.toLowerCase() === user?.email?.toLowerCase()
  );

  const displayedTasks = isEmployee
    ? tasks.filter((t) =>
        normalizeAssignedTo(t.assignedTo).includes(currentEmployee?._id ?? "")
      )
    : tasks;

  // 100% Real Dynamic Stats computed from Database
  const total = displayedTasks.length;
  const todo = displayedTasks.filter((t) => t.status === "TODO").length;
  const inProgress = displayedTasks.filter((t) => t.status === "IN_PROGRESS").length;
  const completed = displayedTasks.filter((t) => t.status === "COMPLETED").length;
  const overdue = displayedTasks.filter((t) => isOverdue(t)).length;

  const urgentCount = displayedTasks.filter((t) => t.priority === "HIGH" && isOverdue(t)).length;
  const highCount = displayedTasks.filter((t) => t.priority === "HIGH").length;
  const mediumCount = displayedTasks.filter((t) => t.priority === "MEDIUM").length;
  const lowCount = displayedTasks.filter((t) => t.priority === "LOW").length;

  const topPriorityList = [...displayedTasks]
    .sort((a, b) => (b.smartScore ?? 0) - (a.smartScore ?? 0))
    .slice(0, 5);

  return (
    <div className="admin-dashboard-wrapper">
      {/* 5 Admin Summary Cards */}
      <div className="stats-row">
        <StatsCard
          label="Total Tasks"
          value={total}
          sublabel="All tasks in the system"
          variant="total"
          badgeText={`${total} System`}
        />
        <StatsCard
          label="To Do"
          value={todo}
          sublabel="Tasks waiting to start"
          variant="todo"
          badgeText={`${todo} Queued`}
        />
        <StatsCard
          label="In Progress"
          value={inProgress}
          sublabel="Tasks currently active"
          variant="progress"
          badgeText={`${inProgress} Active`}
        />
        <StatsCard
          label="Completed"
          value={completed}
          sublabel="Tasks completed"
          variant="completed"
          badgeText={`${completed} Done`}
        />
        <StatsCard
          label="Overdue"
          value={overdue}
          sublabel="Tasks past due date"
          variant="overdue"
          badgeText={`${overdue} Urgent`}
        />
      </div>

      {/* Main Two-Column Grid */}
      <div className="dashboard-grid">
        {/* Left Column */}
        <div className="dashboard-col" style={{ gap: "20px" }}>
          <TaskStatusOverview
            total={total}
            todo={todo}
            inProgress={inProgress}
            completed={completed}
            overdue={overdue}
          />
          <DeadlineAlerts tasks={displayedTasks} />
          <RecentActivity />
        </div>

        {/* Right Column */}
        <div className="dashboard-col" style={{ gap: "20px" }}>
          <PriorityIndex
            urgent={urgentCount}
            high={highCount}
            medium={mediumCount}
            low={lowCount}
          />

          {/* Top Priority Tasks Card */}
          <div className="tf-priority-card">
            <div className="tf-priority-header">
              <div className="tf-priority-title">
                <Flag size={15} style={{ color: "#ef4444" }} />
                <span>TOP PRIORITY TASKS</span>
              </div>
              <Link href="/tasks" className="tf-priority-view-link">
                View all →
              </Link>
            </div>

            <div className="tf-priority-list">
              {loading && tasks.length === 0 ? (
                <p style={{ fontSize: "13px", color: "var(--text-muted)", padding: "12px" }}>Loading tasks…</p>
              ) : topPriorityList.length === 0 ? (
                <p style={{ fontSize: "13px", color: "var(--text-muted)", padding: "12px" }}>No tasks in system.</p>
              ) : (
                topPriorityList.map((task) => (
                  <div key={task.id} className="tf-priority-item">
                    <span className={`tf-priority-badge tf-priority-badge--${task.priority.toLowerCase()}`}>
                      {task.priority === "HIGH" ? "HIGH" : task.priority === "MEDIUM" ? "MED" : "LOW"}
                    </span>
                    <span className="tf-priority-task-title">{task.title}</span>
                    <span className="tf-priority-score-tag">
                      Score <span style={{ color: "var(--text-primary)", fontWeight: 700 }}>{task.smartScore ?? 50}</span>
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="tf-priority-footer">
              <div className="tf-priority-ai-tag">
                <Zap size={13} style={{ color: "#818cf8" }} />
                <span>AI priority sorting active</span>
              </div>
              <span className="tf-priority-count-tag">{topPriorityList.length} of {total} shown</span>
            </div>
          </div>

          <WorkloadOverview employees={employees} />
        </div>
      </div>

      <footer className="app-footer">
        © 2026 TaskFlow Admin Panel. Organization overview mode.
      </footer>
    </div>
  );
}



