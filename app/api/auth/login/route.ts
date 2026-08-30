import { NextRequest } from "next/server";
import { getDb } from "@/lib/mongodb";
import { comparePassword, signSession } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email?.trim() || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const col = db.collection("users");

    const userDoc = await col.findOne({ email: email.trim().toLowerCase() });
    if (!userDoc) {
      return Response.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const match = comparePassword(password, userDoc.passwordHash);
    if (!match) {
      return Response.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const approvalStatus = userDoc.approvalStatus || (userDoc.adminRequestStatus === "PENDING" ? "PENDING" : userDoc.adminRequestStatus === "REJECTED" ? "REJECTED" : "APPROVED");
    if (approvalStatus === "PENDING") {
      return Response.json(
        { error: "Your admin registration request is pending. Please wait for approval from an administrator." },
        { status: 403 }
      );
    }
    if (approvalStatus === "REJECTED") {
      return Response.json(
        { error: "Your admin registration request was not approved. Please contact an administrator." },
        { status: 403 }
      );
    }

    const userPayload = {
      id: String(userDoc._id),
      fullName: userDoc.fullName,
      email: userDoc.email,
      role: userDoc.role as "ADMIN" | "EMPLOYEE",
      approvalStatus,
      adminRequestStatus: userDoc.adminRequestStatus,
    };

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

    return Response.json({ user: userPayload });
  } catch (err) {
    console.error("[POST /api/auth/login]", err);
    return Response.json({ error: "Authentication failed" }, { status: 500 });
  }
}
