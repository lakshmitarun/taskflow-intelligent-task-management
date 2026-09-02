import { NextRequest } from "next/server";
import { getTasksCollection, getEmployeesCollection } from "@/lib/mongodb";
import { calculateSmartScore } from "@/lib/priority-calculator";
import { Task, normalizeAssignedTo } from "@/types/task";
import { ObjectId } from "mongodb";
import { getCurrentUser } from "@/lib/auth";

function docToTask(doc: Record<string, unknown>): Task {
  const { _id, ...rest } = doc;
  const task = {
    ...rest,
    id: String(_id),
    assignedTo: normalizeAssignedTo(doc.assignedTo),
  } as Task;
  task.smartScore = calculateSmartScore(task);
  return task;
}

async function isUserAssignedToTaskDoc(
  user: { id: string; email: string },
  taskDoc: Record<string, unknown>
): Promise<boolean> {
  const assignees = normalizeAssignedTo(taskDoc.assignedTo);
  if (assignees.length === 0) return false;

  const userEmailLower = user.email.toLowerCase();

  const empCol = await getEmployeesCollection();
  const empDoc = await empCol.findOne({ email: userEmailLower });
  const empIdStr = empDoc ? String(empDoc._id) : null;

  const candidateIds = [user.id, userEmailLower];
  if (empIdStr) candidateIds.push(empIdStr);

  return assignees.some(
    (assigneeId) =>
      candidateIds.includes(assigneeId) ||
      candidateIds.includes(assigneeId.toLowerCase())
  );
}

// GET /api/tasks/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const col = await getTasksCollection();
    const doc = await col.findOne({ _id: new ObjectId(id) });
    if (!doc) {
      return Response.json({ error: "Task not found" }, { status: 404 });
    }
    return Response.json(docToTask(doc as Record<string, unknown>));
  } catch (err) {
    console.error("[GET /api/tasks/[id]]", err);
    return Response.json({ error: "Failed to fetch task" }, { status: 500 });
  }
}

// PATCH /api/tasks/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const updates = { ...body };
    delete updates.id;
    delete updates._id;
    delete updates.createdAt;
    delete updates.smartScore;

    const col = await getTasksCollection();
    const existingTask = await col.findOne({ _id: new ObjectId(id) });
    if (!existingTask) {
      return Response.json({ error: "Task not found" }, { status: 404 });
    }

    const isAdmin = user.role === "ADMIN";
    const isAssigned = await isUserAssignedToTaskDoc(
      user,
      existingTask as Record<string, unknown>
    );

    // Rule 1: Non-admin and non-assigned employee cannot edit task -> 403
    if (!isAdmin && !isAssigned) {
      return Response.json(
        { error: "Forbidden: You are not assigned to this task" },
        { status: 403 }
      );
    }

    if (updates.assignedTo !== undefined) {
      updates.assignedTo = normalizeAssignedTo(updates.assignedTo);
    }

    const patch = { ...updates, updatedAt: new Date().toISOString() };
    const result = await col.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: patch },
      { returnDocument: "after" }
    );

    if (!result) {
      return Response.json({ error: "Task not found" }, { status: 404 });
    }

    return Response.json(docToTask(result as Record<string, unknown>));
  } catch (err) {
    console.error("[PATCH /api/tasks/[id]]", err);
    return Response.json({ error: "Failed to update task" }, { status: 500 });
  }
}

// DELETE /api/tasks/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return Response.json(
        { error: "Forbidden: Only administrators can delete tasks" },
        { status: 403 }
      );
    }
    const { id } = await params;
    const col = await getTasksCollection();
    const result = await col.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return Response.json({ error: "Task not found" }, { status: 404 });
    }
    return Response.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/tasks/[id]]", err);
    return Response.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
