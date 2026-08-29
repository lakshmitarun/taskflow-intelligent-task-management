"use client";

import { usePathname, useRouter } from "next/navigation";
import { Moon, Sun, User, LogOut, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useUIStore } from "@/store/ui-store";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Dashboard", subtitle: "Overview of your work" },
  "/tasks": { title: "Tasks", subtitle: "Manage and prioritize your tasks" },
  "/employees": { title: "Team", subtitle: "Manage team members and workload" },
  "/analytics": { title: "Analytics", subtitle: "Performance insights and metrics" },
  "/login": { title: "Login", subtitle: "Access your dashboard" },
  "/register": { title: "Register", subtitle: "Create an account" },
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user, init, logout } = useAuthStore();
  const { toggleSidebar } = useUIStore();

  useEffect(() => {
    setMounted(true);
    init();
  }, [init]);

  const page = pageTitles[pathname] ?? { title: "TaskFlow", subtitle: "" };

  async function handleLogout() {
    await logout();
    router.push("/login");
    router.refresh();
  }

  // Do not render full header on login/register pages
  const isAuthPage = pathname === "/login" || pathname === "/register";

  return (
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
            <button
              className="icon-btn"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user && (
              <div className="user-profile-header">
                <span className="user-name-label">{user.fullName}</span>
                <span className="user-role-badge">{user.role}</span>
                <div className="avatar" title={`${user.fullName} (${user.role})`}>
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
              </div>
            )}

            <button
              className="icon-btn icon-btn--danger"
              onClick={handleLogout}
              aria-label="Logout"
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </>
        )}
      </div>
    </header>
  );
}
