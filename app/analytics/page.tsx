"use client";

import { useEffect, useState } from "react";
import { useTaskStore } from "@/store/task-store";
import { useEmployeeStore } from "@/store/employee-store";
import { isOverdue } from "@/lib/priority-calculator";
import { differenceInDays, parseISO, startOfDay } from "date-fns";
import {
  TrendingUp,
  AlertTriangle,
  Clock,
  Users,
  Zap,
  BarChart2,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";

interface TeamMemberPerformance {
  employeeId: string;
  employeeName: string;
  totalAssigned: number;
  completed: number;
  inProgress: number;
  todo: number;
  completionRate: number;
}

export default function AnalyticsPage() {
  const { tasks, fetchTasks, loading } = useTaskStore();
  const { employees, fetchEmployees } = useEmployeeStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const [teamStats, setTeamStats] = useState<TeamMemberPerformance[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  // Redirect non-admins
  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.push("/");
    }
  }, [user, router]);

  useEffect(() => {
    fetchTasks();
    fetchEmployees();
  }, [fetchTasks, fetchEmployees]);

  useEffect(() => {
    async function fetchTeamPerformance() {
      try {
        const res = await fetch("/api/analytics");
        if (res.ok) {
          const data = await res.json();
          setTeamStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch team performance stats:", err);
      } finally {
        setStatsLoading(false);
      }
    }

    if (user?.role === "ADMIN") {
      fetchTeamPerformance();
    }
  }, [user]);

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
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Top 5 KPI Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "14px" }}>
        {/* KPI Card 1 - Completion Rate */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px", padding: "16px 18px", display: "flex", alignItems: "center", gap: "14px", boxShadow: "0 4px 14px rgba(0, 0, 0, 0.1)" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.15)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <TrendingUp size={18} />
          </div>
          <div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#ffffff", lineHeight: 1 }}>
              {completionRate}%
            </div>
            <div style={{ fontSize: "9.5px", fontWeight: 800, color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginTop: "4px" }}>
              COMPLETION RATE
            </div>
          </div>
        </div>

        {/* KPI Card 2 - Overdue Tasks */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px", padding: "16px 18px", display: "flex", alignItems: "center", gap: "14px", boxShadow: "0 4px 14px rgba(0, 0, 0, 0.1)" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <AlertTriangle size={18} />
          </div>
          <div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#ffffff", lineHeight: 1 }}>
              {overdueCount}
            </div>
            <div style={{ fontSize: "9.5px", fontWeight: 800, color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginTop: "4px" }}>
              OVERDUE TASKS
            </div>
          </div>
        </div>

        {/* KPI Card 3 - High Priority Pending */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px", padding: "16px 18px", display: "flex", alignItems: "center", gap: "14px", boxShadow: "0 4px 14px rgba(0, 0, 0, 0.1)" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(217, 119, 6, 0.15)", color: "#eab308", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Zap size={18} />
          </div>
          <div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#ffffff", lineHeight: 1 }}>
              {highPriorityPending}
            </div>
            <div style={{ fontSize: "9.5px", fontWeight: 800, color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginTop: "4px" }}>
              HIGH PRIORITY PENDING
            </div>
          </div>
        </div>

        {/* KPI Card 4 - Due This Week */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px", padding: "16px 18px", display: "flex", alignItems: "center", gap: "14px", boxShadow: "0 4px 14px rgba(0, 0, 0, 0.1)" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(168, 85, 247, 0.15)", color: "#a855f7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Clock size={18} />
          </div>
          <div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#ffffff", lineHeight: 1 }}>
              {dueThisWeek}
            </div>
            <div style={{ fontSize: "9.5px", fontWeight: 800, color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginTop: "4px" }}>
              DUE THIS WEEK
            </div>
          </div>
        </div>

        {/* KPI Card 5 - Avg Tasks / Member */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px", padding: "16px 18px", display: "flex", alignItems: "center", gap: "14px", boxShadow: "0 4px 14px rgba(0, 0, 0, 0.1)" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(37, 99, 235, 0.15)", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Users size={18} />
          </div>
          <div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#ffffff", lineHeight: 1 }}>
              {avgTasksPerEmployee}
            </div>
            <div style={{ fontSize: "9.5px", fontWeight: 800, color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginTop: "4px" }}>
              AVG TASKS / MEMBER
            </div>
          </div>
        </div>
      </div>

      {/* Team Performance Section */}
      <div className="tf-priority-card">
        <div className="tf-priority-header">
          <div className="tf-priority-title">
            <BarChart2 size={16} style={{ color: "#38bdf8" }} />
            <span>Team Performance</span>
          </div>
        </div>

        <div style={{ margin: "4px 0 16px 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12.5px", color: "var(--text-secondary)", marginBottom: "8px" }}>
            <span>Completion Rate</span>
            <span style={{ fontWeight: 800, color: "#38bdf8" }}>{completionRate}%</span>
          </div>
          <div style={{ height: "7px", background: "rgba(255, 255, 255, 0.08)", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ width: `${completionRate}%`, height: "100%", background: "#10b981", borderRadius: "4px" }} />
          </div>
        </div>

        {/* Status Breakdown list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", borderTop: "1px solid var(--border)", paddingTop: "14px" }}>
          {[
            { label: "Completed", value: completed, color: "#10b981" },
            { label: "In Progress", value: inProgress, color: "#a855f7" },
            { label: "To Do", value: todo, color: "#64748b" },
            { label: "Overdue", value: overdueCount, color: "#ef4444" },
          ].map((item) => {
            const pct = total === 0 ? 0 : Math.min((item.value / total) * 100, 100);
            return (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "110px", fontSize: "12.5px", color: "var(--text-secondary)" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: item.color }} />
                  <span>{item.label}</span>
                </div>

                <div style={{ flex: 1, height: "6px", background: "rgba(255, 255, 255, 0.06)", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: item.color, borderRadius: "3px" }} />
                </div>

                <span style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--text-primary)", width: "24px", textAlign: "right" }}>
                  {item.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Priority Distribution Section */}
      <div className="tf-priority-card">
        <div className="tf-priority-header">
          <div className="tf-priority-title">
            <Zap size={16} style={{ color: "#38bdf8" }} />
            <span>Priority Distribution</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "4px" }}>
          {[
            { priority: "HIGH", label: "High Priority", color: "#ef4444" },
            { priority: "MEDIUM", label: "Medium Priority", color: "#f97316" },
            { priority: "LOW", label: "Low Priority", color: "#10b981" },
          ].map((item) => {
            const count = tasks.filter((t) => t.priority === item.priority).length;
            const pct = total === 0 ? 0 : Math.min((count / total) * 100, 100);
            return (
              <div key={item.priority} style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "120px", fontSize: "12.5px", color: "var(--text-secondary)" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: item.color }} />
                  <span>{item.label}</span>
                </div>

                <div style={{ flex: 1, height: "6px", background: "rgba(255, 255, 255, 0.06)", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: item.color, borderRadius: "3px" }} />
                </div>

                <span style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--text-primary)", width: "24px", textAlign: "right" }}>
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Team Member Performance Section */}
      <div className="tf-priority-card">
        <div className="tf-priority-header">
          <div className="tf-priority-title">
            <Users size={16} style={{ color: "#818cf8" }} />
            <span>Team Member Performance</span>
          </div>
        </div>

        {statsLoading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "30px", color: "var(--text-muted)", gap: "8px" }}>
            <Loader2 size={18} className="spin" />
            <span>Loading team statistics...</span>
          </div>
        ) : teamStats.length === 0 ? (
          <p style={{ padding: "20px", color: "var(--text-muted)", textAlign: "center" }}>No team members found.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", marginTop: "8px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  <th style={{ padding: "10px 12px", textAlign: "left" }}>Team Member</th>
                  <th style={{ padding: "10px 12px", textAlign: "center" }}>Total Tasks</th>
                  <th style={{ padding: "10px 12px", textAlign: "center" }}>Completed</th>
                  <th style={{ padding: "10px 12px", textAlign: "center" }}>In Progress</th>
                  <th style={{ padding: "10px 12px", textAlign: "center" }}>To Do</th>
                  <th style={{ padding: "10px 12px", textAlign: "right" }}>Completion Rate</th>
                </tr>
              </thead>
              <tbody>
                {teamStats.map((member) => {
                  const initial = member.employeeName.charAt(0).toUpperCase();
                  const rate = member.completionRate;
                  return (
                    <tr key={member.employeeId} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "#2563eb", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 800 }}>
                          {initial}
                        </div>
                        <span style={{ fontWeight: 700, color: "var(--text-primary)", textTransform: "uppercase", fontSize: "12.5px" }}>
                          {member.employeeName}
                        </span>
                      </td>

                      <td style={{ padding: "12px", textAlign: "center", color: "var(--text-secondary)", fontWeight: 600 }}>
                        {member.totalAssigned}
                      </td>

                      <td style={{ padding: "12px", textAlign: "center", color: member.completed > 0 ? "#10b981" : "var(--text-secondary)", fontWeight: 700 }}>
                        {member.completed}
                      </td>

                      <td style={{ padding: "12px", textAlign: "center", color: "var(--text-secondary)", fontWeight: 600 }}>
                        {member.inProgress}
                      </td>

                      <td style={{ padding: "12px", textAlign: "center", color: "var(--text-secondary)", fontWeight: 600 }}>
                        {member.todo}
                      </td>

                      <td style={{ padding: "12px", textAlign: "right" }}>
                        {rate === 100 ? (
                          <span style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399", fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "9999px" }}>
                            100%
                          </span>
                        ) : (
                          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
                            {rate}%
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {loading && tasks.length === 0 && (
        <p style={{ textAlign: "center", color: "var(--text-muted)", marginTop: "20px" }}>
          Loading analytics…
        </p>
      )}
    </div>
  );
}
