import { create } from "zustand";
import { Task, TaskStatus } from "@/types/task";
import { calculateSmartScore } from "@/lib/priority-calculator";
import { useEmployeeStore } from "./employee-store";

interface TaskStore {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt" | "smartScore">) => Promise<void>;
  updateTask: (id: string, updates: Partial<Omit<Task, "id" | "createdAt">>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  updateStatus: (id: string, status: TaskStatus) => Promise<void>;
}

function withScore(task: Task): Task {
  return { ...task, smartScore: calculateSmartScore(task) };
}

// Helper: log an activity to MongoDB (fire-and-forget)
async function logActivity(payload: {
  action: string;
  description: string;
  taskId?: string;
  taskTitle?: string;
  assignedTo?: string[];
}) {
  try {
    let employeeId: string | null = null;
    let employeeName: string | null = null;

    if (payload.assignedTo && payload.assignedTo.length > 0) {
      const { employees } = useEmployeeStore.getState();
      const assignedEmps = employees.filter((e) => payload.assignedTo?.includes(e._id));
      if (assignedEmps.length > 0) {
        employeeId = assignedEmps.map((e) => e.email).join(", ");
        employeeName = assignedEmps.map((e) => e.name).join(", ");
      }
    }

    await fetch("/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: payload.action,
        description: payload.description,
        taskId: payload.taskId,
        taskTitle: payload.taskTitle,
        employeeId,
        employeeName,
      }),
    });
  } catch {
    // Non-critical — don't block UI if activity logging fails
  }
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchTasks: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/tasks");
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const tasks: Task[] = await res.json();
      set({ tasks: tasks.map(withScore), loading: false });
    } catch (err) {
      console.error(err);
      set({ loading: false, error: "Could not load tasks. Check your MongoDB connection." });
    }
  },

  addTask: async (task) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
      });
      if (!res.ok) throw new Error("Failed to create task");
      const newTask: Task = await res.json();
      set((state) => ({ tasks: [withScore(newTask), ...state.tasks] }));
      // Log activity
      logActivity({
        action: "TASK_CREATED",
        description: `Task "${newTask.title}" was created`,
        taskId: newTask.id,
        taskTitle: newTask.title,
        assignedTo: newTask.assignedTo,
      });
    } catch (err) {
      console.error(err);
      set({ error: "Could not create task." });
    }
  },

  updateTask: async (id, updates) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update task");
      const updated: Task = await res.json();
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? withScore(updated) : t)),
      }));
      // Log activity
      logActivity({
        action: "TASK_UPDATED",
        description: `Task "${updated.title}" was updated`,
        taskId: updated.id,
        taskTitle: updated.title,
        assignedTo: updated.assignedTo,
      });
    } catch (err) {
      console.error(err);
      set({ error: "Could not update task." });
    }
  },

  deleteTask: async (id) => {
    const prev = get().tasks;
    const task = prev.find((t) => t.id === id);
    // Optimistic update
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete task");
      // Log activity
      logActivity({
        action: "TASK_DELETED",
        description: `Task "${task?.title ?? id}" was deleted`,
        taskId: id,
        taskTitle: task?.title,
        assignedTo: task?.assignedTo,
      });
    } catch (err) {
      console.error(err);
      set({ tasks: prev, error: "Could not delete task." });
    }
  },

  updateStatus: async (id, status) => {
    const task = get().tasks.find((t) => t.id === id);
    await get().updateTask(id, { status });
    // Log status change specifically
    const statusLabel: Record<string, string> = {
      TODO: "To Do",
      IN_PROGRESS: "In Progress",
      COMPLETED: "Completed",
    };
    logActivity({
      action: "STATUS_CHANGED",
      description: `"${task?.title}" moved to ${statusLabel[status] ?? status}`,
      taskId: id,
      taskTitle: task?.title,
      assignedTo: task?.assignedTo,
    });
  },
}));
