import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.set("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // delete cookie
      path: "/",
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("[POST /api/auth/logout]", err);
    return Response.json({ error: "Logout failed" }, { status: 500 });
  }
}
