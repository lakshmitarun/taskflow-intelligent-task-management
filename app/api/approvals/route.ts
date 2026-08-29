import { NextRequest } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import { ObjectId } from "mongodb";

// GET /api/approvals - List all users who have an admin request status
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return Response.json(
        { error: "Forbidden: Only administrators can view admin requests" },
        { status: 403 }
      );
    }

    const db = await getDb();
    const col = db.collection("users");

    const requests = await col
      .find({ adminRequestStatus: { $exists: true } })
      .sort({ adminRequestRequestedAt: -1 })
      .toArray();

    // Map database documents to clean user objects
    const result = requests.map((doc) => ({
      id: String(doc._id),
      fullName: doc.fullName,
      email: doc.email,
      role: doc.role,
      adminRequestStatus: doc.adminRequestStatus,
      adminRequestRequestedAt: doc.adminRequestRequestedAt,
    }));

    return Response.json(result);
  } catch (err) {
    console.error("[GET /api/approvals]", err);
    return Response.json(
      { error: "Failed to fetch approvals" },
      { status: 500 }
    );
  }
}

// POST /api/approvals - Process an approval action (ACCEPT or REJECT)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return Response.json(
        { error: "Forbidden: Only administrators can process admin requests" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, action } = body;

    if (!userId?.trim()) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    if (action !== "ACCEPT" && action !== "REJECT") {
      return Response.json(
        { error: "Invalid action. Must be ACCEPT or REJECT" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const col = db.collection("users");

    // Fetch the target user first
    const targetUser = await col.findOne({ _id: new ObjectId(userId) });
    if (!targetUser) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    if (targetUser.adminRequestStatus !== "PENDING") {
      return Response.json(
        { error: "This request has already been processed" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const updates: Record<string, unknown> = {
      updatedAt: now,
    };

    if (action === "ACCEPT") {
      updates.role = "ADMIN";
      updates.adminRequestStatus = "APPROVED";
    } else {
      updates.role = "EMPLOYEE";
      updates.adminRequestStatus = "REJECTED";
    }

    await col.updateOne({ _id: new ObjectId(userId) }, { $set: updates });

    return Response.json({
      success: true,
      message: `User ${targetUser.fullName} registration request was ${
        action === "ACCEPT" ? "APPROVED" : "REJECTED"
      }`,
      user: {
        id: userId,
        fullName: targetUser.fullName,
        email: targetUser.email,
        role: updates.role,
        adminRequestStatus: updates.adminRequestStatus,
      },
    });
  } catch (err) {
    console.error("[POST /api/approvals]", err);
    return Response.json(
      { error: "Failed to process approval" },
      { status: 500 }
    );
  }
}
