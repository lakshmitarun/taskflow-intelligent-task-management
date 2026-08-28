import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");

    if (!sessionCookie?.value) {
      return Response.json({ user: null });
    }

    const user = await verifySession(sessionCookie.value);
    if (!user) {
      return Response.json({ user: null });
    }

    return Response.json({ user });
  } catch (err) {
    console.error("[GET /api/auth/me]", err);
    return Response.json({ user: null });
  }
}
