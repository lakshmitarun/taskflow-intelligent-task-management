export interface Employee {
  _id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  createdAt: string; // ISO timestamp
  updatedAt?: string; // ISO timestamp
  // Computed on fetch
  activeTaskCount?: number;
}

export type WorkloadLevel = "LOW" | "MEDIUM" | "HIGH";

export function getWorkloadLevel(activeTaskCount: number): WorkloadLevel {
  if (activeTaskCount <= 3) return "LOW";
  if (activeTaskCount <= 6) return "MEDIUM";
  return "HIGH";
}
