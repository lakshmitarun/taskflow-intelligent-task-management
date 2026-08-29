"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { useUIStore } from "@/store/ui-store";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const { isSidebarOpen, setSidebarOpen } = useUIStore();

  if (isAuthPage) {
    return <main className="auth-shell">{children}</main>;
  }

  return (
    <div className="app-shell">
      {/* Mobile Sidebar Overlay Backdrop */}
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar />
      <div className="app-main">
        <Header />
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
