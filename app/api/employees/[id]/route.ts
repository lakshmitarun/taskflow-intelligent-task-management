import { NextRequest } from "next/server";
import { getEmployeesCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { Employee } from "@/types/employee";

function docToEmployee(doc: Record<string, unknown>): Employee {
  const { _id, ...rest } = doc;
  return { ...rest, _id: String(_id) } as Employee;
}

// PATCH /api/employees/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { _id: _, createdAt: _c, ...updates } = body;
    const patch = { ...updates, updatedAt: new Date().toISOString() };

    const col = await getEmployeesCollection();
    const result = await col.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: patch },
      { returnDocument: "after" }
    );

    if (!result) {
      return Response.json({ error: "Employee not found" }, { status: 404 });
    }

    return Response.json(docToEmployee(result as Record<string, unknown>));
  } catch (err) {
    console.error("[PATCH /api/employees/[id]]", err);
    return Response.json(
      { error: "Failed to update employee" },
      { status: 500 }
    );
  }
}

// DELETE /api/employees/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const col = await getEmployeesCollection();
    const result = await col.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return Response.json({ error: "Employee not found" }, { status: 404 });
    }
    return Response.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/employees/[id]]", err);
    return Response.json(
      { error: "Failed to delete employee" },
      { status: 500 }
    );
  }
}
