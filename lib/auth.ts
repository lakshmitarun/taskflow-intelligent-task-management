import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const SECRET_KEY = process.env.AUTH_SECRET || "taskflow-fallback-jwt-secret-key-32-chars";
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
