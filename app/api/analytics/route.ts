import { getEmployeesCollection, getTasksCollection } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import { normalizeAssignedTo } from "@/types/task";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return Response.json(
        { error: "Forbidden: Only administrators can view team performance analytics" },
        { status: 403 }
      );
    }

    const [empCol, taskCol] = await Promise.all([
      getEmployeesCollection(),
      getTasksCollection(),
    ]);

    const [employees, tasks] = await Promise.all([
      empCol.find({}).toArray(),
      taskCol.find({}).toArray(),
    ]);

    // Calculate metrics per employee
    const teamPerformance = employees.map((emp) => {
      const empIdStr = String(emp._id);
      const empTasks = tasks.filter((t) =>
        normalizeAssignedTo(t.assignedTo).includes(empIdStr)
      );

      const totalAssigned = empTasks.length;
      const completed = empTasks.filter((t) => t.status === "COMPLETED").length;
      const inProgress = empTasks.filter((t) => t.status === "IN_PROGRESS").length;
      const todo = empTasks.filter((t) => t.status === "TODO").length;
      const completionRate = totalAssigned === 0 ? 0 : Math.round((completed / totalAssigned) * 100);

      return {
        employeeId: empIdStr,
        employeeName: emp.name,
        totalAssigned,
        completed,
        inProgress,
        todo,
        completionRate,
      };
    });

    return Response.json(teamPerformance);
  } catch (err) {
    console.error("[GET /api/analytics]", err);
    return Response.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
