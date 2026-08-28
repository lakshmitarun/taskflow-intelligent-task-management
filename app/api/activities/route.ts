import { NextRequest } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export interface Activity {
  _id?: string;
  action: "TASK_CREATED" | "TASK_UPDATED" | "TASK_DELETED" | "STATUS_CHANGED" | "TASK_ASSIGNED";
  description: string;
  taskId?: string;
  taskTitle?: string;
  employeeId?: string | null;
  employeeName?: string | null;
  createdAt: string;
}

// GET /api/activities?limit=20
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const col = db.collection("activities");
    const limit = parseInt(request.nextUrl.searchParams.get("limit") ?? "20");

    const docs = await col
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    const activities = docs.map((d) => ({
      ...d,
      _id: String(d._id),
    }));

    return Response.json(activities);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: message }, { status: 500 });
  }
}

// POST /api/activities
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDb();
    const col = db.collection("activities");

    const doc = {
      action: body.action,
      description: body.description,
      taskId: body.taskId ? new ObjectId(body.taskId) : null,
      taskTitle: body.taskTitle ?? null,
      employeeId: body.employeeId ?? null,
      employeeName: body.employeeName ?? null,
      createdAt: new Date().toISOString(),
    };

    const result = await col.insertOne(doc);
    return Response.json({ ...doc, _id: String(result.insertedId) }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: message }, { status: 500 });
  }
}
