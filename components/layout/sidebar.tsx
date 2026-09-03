"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ListTodo,
  Users,
  BarChart2,
  X,
  ShieldCheck,
  Check,
  LogOut,
  Activity,
} from "lucide-react";
import { clsx } from "clsx";
import { useAuthStore } from "@/store/auth-store";
import { useUIStore } from "@/store/ui-store";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { isSidebarOpen, setSidebarOpen } = useUIStore();

  const isAdmin = user?.role === "ADMIN";

  const navItems = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/tasks", icon: ListTodo, label: "Tasks" },
    {
      href: "/employees",
      icon: Users,
      label: isAdmin ? "Employees" : "Team",
      roles: ["ADMIN"],
    },
    { href: "/analytics", icon: BarChart2, label: "Analytics", roles: ["ADMIN"] },
    { href: "/approvals", icon: ShieldCheck, label: "Approvals", roles: ["ADMIN"] },
    { href: "/activity-logs", icon: Activity, label: "Activity Logs", roles: ["ADMIN"] },
  ];

  const filteredItems = navItems.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  async function handleLogout() {
    await logout();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className={clsx("sidebar", isSidebarOpen && "sidebar--open")}>
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-icon" style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "#ffffff", borderRadius: "8px", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Check size={20} strokeWidth={3} />
        </div>
        <span className="brand-name">TaskFlow</span>

        {/* Mobile Close Button */}
        <button
          className="icon-btn sidebar-close-btn"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <p className="nav-section-label">MENU</p>
        {filteredItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={clsx("nav-item", active && "nav-item--active")}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Controls */}
      <div className="sidebar-bottom-controls">
        {/* User profile section */}
        {user && (
          <div className="sidebar-user-box">
            <div className="sidebar-user-avatar">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name" title={user.fullName}>
                {user.fullName}
              </span>
              <span className="sidebar-user-role">
                {user.role === "ADMIN" ? "ADMIN" : "EMPLOYEE"}
              </span>
            </div>
          </div>
        )}

        {/* Logout */}
        <button className="sidebar-logout-btn" onClick={handleLogout}>
          <LogOut size={15} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}



