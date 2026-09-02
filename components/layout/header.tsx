"use client";

import { usePathname } from "next/navigation";
import { Moon, Sun, Menu, Clock, Bell } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useSyncExternalStore } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useUIStore } from "@/store/ui-store";
import { useTaskStore } from "@/store/task-store";
import { isOverdue, getDeadlineLabel } from "@/lib/priority-calculator";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Dashboard", subtitle: "Overview of your work" },
  "/tasks": { title: "Tasks", subtitle: "Manage and prioritize your tasks" },
  "/employees": { title: "Team", subtitle: "Manage team members and workload" },
  "/analytics": { title: "Analytics", subtitle: "Performance insights and metrics" },
  "/approvals": { title: "Admin Approvals", subtitle: "Review requested administrator permissions" },
  "/login": { title: "Login", subtitle: "Access your dashboard" },
  "/register": { title: "Register", subtitle: "Create an account" },
};

const emptySubscribe = () => () => {};

export function Header() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const { user, init } = useAuthStore();
  const { toggleSidebar } = useUIStore();
  const { tasks } = useTaskStore();

  useEffect(() => {
    init();
  }, [init]);

  const page = pageTitles[pathname] ?? { title: "TaskFlow", subtitle: "" };

  // Calculate real notification count (overdue tasks or tasks due today/tomorrow)
  const notificationCount = tasks.filter((t) => {
    if (t.status === "COMPLETED") return false;
    const label = getDeadlineLabel(t);
    return (
      isOverdue(t) ||
      label === "Due today" ||
      label === "Due tomorrow" ||
      label.includes("overdue") ||
      label === "Expired"
    );
  }).length;

  // Do not render full header on login/register pages
  const isAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <>
      <header className="app-header">
        <div className="header-left">
          {!isAuthPage && (
            <button
              className="icon-btn mobile-menu-btn"
              onClick={toggleSidebar}
              aria-label="Open menu"
              title="Open Menu"
            >
              <Menu size={18} />
            </button>
          )}
          <div className="header-title-group">
            <h1 className="header-title">{page.title}</h1>
            <p className="header-subtitle">{page.subtitle}</p>
          </div>
        </div>

        <div className="header-right">
          {mounted && !isAuthPage && (
            <>
              {/* Notification icon with dynamic count */}
              <button
                className="icon-btn header-notification-btn"
                aria-label="Notifications"
                title="Notifications"
              >
                <Bell size={18} />
                {notificationCount > 0 && (
                  <span className="notification-badge">{notificationCount}</span>
                )}
              </button>

              {/* Theme Toggle Button */}
              <button
                className="icon-btn"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Toggle dark mode"
                title="Toggle Theme"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* User Profile */}
              {user && (
                <div className="header-user-profile">
                  <div className="header-avatar">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <span className="header-user-name">{user.fullName}</span>
                  <span className="header-user-role">
                    {user.role === "ADMIN" ? "Admin" : "Employee"}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </header>

      {user && user.role === "EMPLOYEE" && user.adminRequestStatus === "PENDING" && !isAuthPage && (
        <div className="pending-admin-banner">
          <span className="pending-admin-banner__badge">PENDING REVIEW</span>
          <div className="pending-admin-banner__content">
            <Clock size={14} style={{ color: "var(--todo)" }} />
            <span>Your request for Administrator access is pending approval. You are currently browsing with Employee permissions.</span>
          </div>
        </div>
      )}
    </>
  );
}



