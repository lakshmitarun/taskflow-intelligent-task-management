export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface User {
  id: string;
  fullName: string;
  employeeId?: string;
  email: string;
  role: "ADMIN" | "EMPLOYEE";
  approvalStatus?: ApprovalStatus;
  adminRequestStatus?: "PENDING" | "APPROVED" | "REJECTED";
  adminRequestRequestedAt?: string;
}
