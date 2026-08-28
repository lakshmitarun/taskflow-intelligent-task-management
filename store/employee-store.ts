import { create } from "zustand";
import { Employee } from "@/types/employee";

interface EmployeeStore {
  employees: Employee[];
  loading: boolean;
  error: string | null;
  fetchEmployees: () => Promise<void>;
  addEmployee: (emp: Omit<Employee, "_id" | "createdAt" | "updatedAt" | "activeTaskCount">) => Promise<void>;
  updateEmployee: (id: string, updates: Partial<Omit<Employee, "_id" | "createdAt">>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
}

export const useEmployeeStore = create<EmployeeStore>((set, get) => ({
  employees: [],
  loading: false,
  error: null,

  fetchEmployees: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/employees");
      if (!res.ok) throw new Error("Failed to fetch employees");
      const employees: Employee[] = await res.json();
      set({ employees, loading: false });
    } catch (err) {
      console.error(err);
      set({ loading: false, error: "Could not load employees." });
    }
  },

  addEmployee: async (emp) => {
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emp),
      });
      if (!res.ok) throw new Error("Failed to create employee");
      const newEmp: Employee = await res.json();
      set((state) => ({ employees: [newEmp, ...state.employees] }));
    } catch (err) {
      console.error(err);
      set({ error: "Could not create employee." });
    }
  },

  updateEmployee: async (id, updates) => {
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update employee");
      const updated: Employee = await res.json();
      set((state) => ({
        employees: state.employees.map((e) => (e._id === id ? updated : e)),
      }));
    } catch (err) {
      console.error(err);
      set({ error: "Could not update employee." });
    }
  },

  deleteEmployee: async (id) => {
    const prev = get().employees;
    set((state) => ({ employees: state.employees.filter((e) => e._id !== id) }));
    try {
      const res = await fetch(`/api/employees/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete employee");
    } catch (err) {
      console.error(err);
      set({ employees: prev, error: "Could not delete employee." });
    }
  },
}));
