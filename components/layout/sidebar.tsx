"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListTodo,
  Users,
  BarChart2,
  Zap,
  X,
  ShieldCheck,
} from "lucide-react";
import { clsx } from "clsx";
import { useAuthStore } from "@/store/auth-store";
import { useUIStore } from "@/store/ui-store";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/tasks", icon: ListTodo, label: "Tasks" },
  { href: "/employees", icon: Users, label: "Team", roles: ["ADMIN"] },
  { href: "/analytics", icon: BarChart2, label: "Analytics", roles: ["ADMIN"] },
  { href: "/approvals", icon: ShieldCheck, label: "Approvals", roles: ["ADMIN"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { isSidebarOpen, setSidebarOpen } = useUIStore();

  const filteredItems = navItems.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <aside className={clsx("sidebar", isSidebarOpen && "sidebar--open")}>
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Zap size={20} />
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
        <p className="nav-section-label">Menu</p>
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

      {/* Footer tagline */}
      <div className="sidebar-footer">
        <p className="tagline">Work Smarter.</p>
        <p className="tagline">Prioritize Better.</p>
      </div>
    </aside>
  );
}
