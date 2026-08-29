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

// GET /api/tasks
export async function GET() {
  try {
    const col = await getTasksCollection();
    const docs = await col.find({}).sort({ createdAt: -1 }).toArray();
    const tasks = docs.map((d) => docToTask(d as Record<string, unknown>));
    return Response.json(tasks);
  } catch (err) {
    console.error("[GET /api/tasks]", err);
    return Response.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

// POST /api/tasks
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (!body.title?.trim()) {
      return Response.json({ error: "Title is required" }, { status: 400 });
    }
    if (!body.deadline) {
      return Response.json({ error: "Deadline is required" }, { status: 400 });
    }
    if (!body.estimatedHours || body.estimatedHours <= 0) {
      return Response.json(
        { error: "Estimated hours must be > 0" },
        { status: 400 }
      );
    }


    const now = new Date().toISOString();
    const doc = {
      title: body.title.trim(),
      description: body.description ?? "",
      priority: body.priority ?? "MEDIUM",
      status: body.status ?? "TODO",
      deadline: body.deadline,
      estimatedHours: Number(body.estimatedHours),
      assignedTo: body.assignedTo ?? null,
      createdAt: now,
      updatedAt: now,
    };

    const col = await getTasksCollection();
    const result = await col.insertOne(doc);

    const task = docToTask({
      ...doc,
      _id: result.insertedId,
    } as Record<string, unknown>);

    return Response.json(task, { status: 201 });
  } catch (err) {
    console.error("[POST /api/tasks]", err);
    return Response.json({ error: "Failed to create task" }, { status: 500 });
  }
}
