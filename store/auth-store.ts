import { create } from "zustand";
import { User } from "@/types/user";

interface AuthStore {
  user: User | null;
  authenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, fullName: string, role: "ADMIN" | "EMPLOYEE") => Promise<{ success: boolean; pendingApproval?: boolean }>;
  logout: () => Promise<void>;
  init: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  authenticated: false,
  loading: false,
  error: null,

  init: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          set({ user: data.user, authenticated: true });
        } else {
          set({ user: null, authenticated: false });
        }
      }
    } catch (err) {
      console.error("Auth init failed:", err);
    } finally {
      set({ loading: false });
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        set({ error: data.error || "Login failed", loading: false });
        return false;
      }

      set({ user: data.user, authenticated: true, loading: false });
      return true;
    } catch (err) {
      console.error(err);
      set({ error: "An unexpected error occurred", loading: false });
      return false;
    }
  },

  register: async (email, password, fullName, role) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        set({ error: data.error || "Registration failed", loading: false });
        return { success: false };
      }

      if (data.pendingApproval) {
        set({ user: null, authenticated: false, loading: false });
        return { success: true, pendingApproval: true };
      }

      set({ user: data.user, authenticated: true, loading: false });
      return { success: true, pendingApproval: false };
    } catch (err) {
      console.error(err);
      set({ error: "An unexpected error occurred", loading: false });
      return { success: false };
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      set({ user: null, authenticated: false, loading: false });
    }
  },
}));
