import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const session = request.cookies.get("session")?.value;

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const payload = await verifySession(session);
  if (!payload) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { pathname } = request.nextUrl;

  // Role-based authorization: Employees cannot access team management, analytics, or approvals pages
  if (payload.role === "EMPLOYEE") {
    if (
      pathname.startsWith("/employees") ||
      pathname.startsWith("/analytics") ||
      pathname.startsWith("/approvals")
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     * - register (register page)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|login|register).*)",
  ],
};
