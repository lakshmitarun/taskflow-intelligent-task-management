"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListTodo,
  Users,
  BarChart2,
  Zap,
} from "lucide-react";
import { clsx } from "clsx";
import { useAuthStore } from "@/store/auth-store";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/tasks", icon: ListTodo, label: "Tasks" },
  { href: "/employees", icon: Users, label: "Team", roles: ["ADMIN"] },
  { href: "/analytics", icon: BarChart2, label: "Analytics", roles: ["ADMIN"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const filteredItems = navItems.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Zap size={20} />
        </div>
        <span className="brand-name">TaskFlow</span>
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
