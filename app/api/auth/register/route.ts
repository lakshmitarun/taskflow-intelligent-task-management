import { NextRequest } from "next/server";
import { getDb } from "@/lib/mongodb";
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

    const doc = {
      fullName: fullName.trim(),
      email: emailClean,
      passwordHash,
      role: role === "ADMIN" ? "ADMIN" : "EMPLOYEE",
      createdAt: now,
      updatedAt: now,
    };

    const result = await col.insertOne(doc);
    const userPayload = {
      id: String(result.insertedId),
      fullName: doc.fullName,
      email: doc.email,
      role: doc.role as "ADMIN" | "EMPLOYEE",
    };

    const token = await signSession(userPayload);

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
