import { jwtVerify } from "jose";

const SECRET_KEY = process.env.AUTH_SECRET;
if (!SECRET_KEY) {
  throw new Error("AUTH_SECRET environment variable is not set.");
}
const key = new TextEncoder().encode(SECRET_KEY);

export interface SessionPayload {
  id: string;
  fullName: string;
  email: string;
  role: "ADMIN" | "EMPLOYEE";
}

export async function verifyEdgeSession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
