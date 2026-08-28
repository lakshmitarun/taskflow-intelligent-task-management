export interface User {
  id: string;
  fullName: string;
  employeeId?: string;
  email: string;
  role: "ADMIN" | "EMPLOYEE";
}
