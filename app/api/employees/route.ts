import { NextRequest } from "next/server";
import { getEmployeesCollection, getTasksCollection } from "@/lib/mongodb";
import { Employee } from "@/types/employee";
import { normalizeAssignedTo } from "@/types/task";
import { getCurrentUser } from "@/lib/auth";

function docToEmployee(
  doc: Record<string, unknown>,
  activeTaskCount = 0
): Employee {
  const { _id, ...rest } = doc;
  return { ...rest, _id: String(_id), activeTaskCount } as Employee;
}

// GET /api/employees
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [empCol, taskCol] = await Promise.all([
      getEmployeesCollection(),
      getTasksCollection(),
    ]);

    const employees = await empCol.find({}).sort({ createdAt: -1 }).toArray();

    // Count active tasks per employee
    const activeTasks = await taskCol
      .find({ status: { $ne: "COMPLETED" } })
      .toArray();

    const taskCountMap: Record<string, number> = {};
    for (const t of activeTasks) {
      const assignees = normalizeAssignedTo(t.assignedTo);
      for (const empId of assignees) {
        taskCountMap[empId] = (taskCountMap[empId] ?? 0) + 1;
      }
    }

    const result = employees.map((doc) => {
      const id = String(doc._id);
      return docToEmployee(doc as Record<string, unknown>, taskCountMap[id] ?? 0);
    });

    return Response.json(result);
  } catch (err) {
    console.error("[GET /api/employees]", err);
    return Response.json(
      { error: "Failed to fetch employees" },
      { status: 500 }
    );
  }
}

// POST /api/employees
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return Response.json(
        { error: "Forbidden: Only administrators can manage employees" },
        { status: 403 }
      );
    }

    const body = await request.json();

    if (!body.name?.trim()) {
      return Response.json({ error: "Name is required" }, { status: 400 });
    }
    if (!body.email?.trim()) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }
    if (!body.role?.trim()) {
      return Response.json({ error: "Role is required" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const doc = {
      name: body.name.trim(),
      email: body.email.trim(),
      role: body.role.trim(),
      department: body.department?.trim() ?? "",
      createdAt: now,
      updatedAt: now,
    };

    const col = await getEmployeesCollection();
    const result = await col.insertOne(doc);
    const employee = docToEmployee(
      { ...doc, _id: result.insertedId } as Record<string, unknown>,
      0
    );

    return Response.json(employee, { status: 201 });
  } catch (err) {
    console.error("[POST /api/employees]", err);
    return Response.json(
      { error: "Failed to create employee" },
      { status: 500 }
    );
  }
}
