import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifySession, signSession } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");

    if (!sessionCookie?.value) {
      return Response.json({ user: null });
    }

    const sessionUser = await verifySession(sessionCookie.value);
    if (!sessionUser) {
      return Response.json({ user: null });
    }

    // Fetch latest user document from DB to check for updates (e.g. admin approval)
    const db = await getDb();
    const userDoc = await db.collection("users").findOne({ _id: new ObjectId(sessionUser.id) });
    
    if (!userDoc) {
      return Response.json({ user: null });
    }

    const dbRole = userDoc.role as "ADMIN" | "EMPLOYEE";
    const dbStatus = userDoc.adminRequestStatus;

    const latestUserPayload = {
      id: sessionUser.id,
      fullName: userDoc.fullName,
      email: userDoc.email,
      role: dbRole,
      adminRequestStatus: dbStatus,
    };

    // If the database role has changed from the session, re-sign and update the session cookie
    if (dbRole !== sessionUser.role) {
      const newToken = await signSession({
        id: latestUserPayload.id,
        fullName: latestUserPayload.fullName,
        email: latestUserPayload.email,
        role: latestUserPayload.role,
      });

      cookieStore.set("session", newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
      });
    }

    return Response.json({ user: latestUserPayload });
  } catch (err) {
    console.error("[GET /api/auth/me]", err);
    return Response.json({ user: null });
  }
}
