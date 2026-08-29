import { NextRequest } from "next/server";
import { getTasksCollection } from "@/lib/mongodb";
import { calculateSmartScore } from "@/lib/priority-calculator";
import { Task } from "@/types/task";
import { ObjectId } from "mongodb";
import { getCurrentUser } from "@/lib/auth";

function docToTask(doc: Record<string, unknown>): Task {
  const { _id, ...rest } = doc;
  const task = { ...rest, id: String(_id) } as Task;
  task.smartScore = calculateSmartScore(task);
  return task;
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

    // Strip protected fields
    const { id: _id, createdAt: _c, smartScore: _s, ...updates } = body;

    const col = await getTasksCollection();
    const existingTask = await col.findOne({ _id: new ObjectId(id) });
    if (!existingTask) {
      return Response.json({ error: "Task not found" }, { status: 404 });
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
