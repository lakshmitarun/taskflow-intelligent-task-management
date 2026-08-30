import { NextRequest } from "next/server";
import { getDb, getEmployeesCollection } from "@/lib/mongodb";
import { hashPassword, signSession } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, role } = await request.json();

    if (!email?.trim() || !password || !fullName?.trim()) {
      return Response.json(
        { error: "Email, password, and full name are required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const col = db.collection("users");

    const emailClean = email.trim().toLowerCase();
    const existing = await col.findOne({ email: emailClean });
    if (existing) {
      return Response.json(
        { error: "A user with this email already exists" },
        { status: 400 }
      );
    }

    const passwordHash = hashPassword(password);
    const now = new Date().toISOString();
    const isRequestingAdmin = role === "ADMIN";
    let employeeId: string | undefined = undefined;

    if (!isRequestingAdmin) {
      const empCol = await getEmployeesCollection();
      const empDoc = {
        name: fullName.trim(),
        email: emailClean,
        role: "Employee", // Default role
        department: "",
        createdAt: now,
        updatedAt: now,
      };
      const empResult = await empCol.insertOne(empDoc);
      employeeId = String(empResult.insertedId);
    }

    const doc = {
      fullName: fullName.trim(),
      email: emailClean,
      passwordHash,
      role: isRequestingAdmin ? "ADMIN" : "EMPLOYEE",
      employeeId,
      approvalStatus: isRequestingAdmin ? ("PENDING" as const) : ("APPROVED" as const),
      adminRequestStatus: isRequestingAdmin ? ("PENDING" as const) : undefined,
      adminRequestRequestedAt: isRequestingAdmin ? now : undefined,
      createdAt: now,
      updatedAt: now,
    };

    const result = await col.insertOne(doc);
    const userPayload = {
      id: String(result.insertedId),
      fullName: doc.fullName,
      email: doc.email,
      role: doc.role as "ADMIN" | "EMPLOYEE",
      employeeId: doc.employeeId,
      approvalStatus: doc.approvalStatus,
      adminRequestStatus: doc.adminRequestStatus,
    };

    if (isRequestingAdmin) {
      return Response.json(
        { user: userPayload, pendingApproval: true },
        { status: 201 }
      );
    }

    const token = await signSession({
      id: userPayload.id,
      fullName: userPayload.fullName,
      email: userPayload.email,
      role: userPayload.role,
    });

    // Set secure cookie
    const cookieStore = await cookies();
    cookieStore.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return Response.json({ user: userPayload }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/auth/register]", err);
    return Response.json({ error: "Registration failed" }, { status: 500 });
  }
}
