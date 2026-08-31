export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED";
export type Priority = "LOW" | "MEDIUM" | "HIGH";

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  deadline: string; // ISO date string YYYY-MM-DD
  estimatedHours: number;
  assignedTo?: string[]; // Array of Employee _id references
  createdAt: string; // ISO timestamp
  updatedAt?: string; // ISO timestamp
  smartScore?: number;
}

export function normalizeAssignedTo(assignedTo: unknown): string[] {
  if (Array.isArray(assignedTo)) {
    return (assignedTo as string[]).filter((id) => typeof id === "string" && id.trim().length > 0);
  }
  if (typeof assignedTo === "string" && assignedTo.trim().length > 0) {
    return [assignedTo.trim()];
  }
  return [];
}

