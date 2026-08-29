import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const SECRET_KEY = process.env.AUTH_SECRET;
if (!SECRET_KEY) {
  throw new Error("AUTH_SECRET environment variable is not set. Add it to your .env file.");
}
const key = new TextEncoder().encode(SECRET_KEY);


export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export async function signSession(payload: {
  id: string;
  fullName: string;
  email: string;
  role: "ADMIN" | "EMPLOYEE";
}) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key);
}

export async function verifySession(token: string) {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });
    return payload as {
      id: string;
      fullName: string;
      email: string;
      role: "ADMIN" | "EMPLOYEE";
    };
  } catch (err) {
    console.error("JWT Verification failed:", err);
    return null;
  }
}

import { cookies } from "next/headers";

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return null;
    return await verifySession(token);
  } catch (err) {
    console.error("Failed to get current user session:", err);
    return null;
  }
}

