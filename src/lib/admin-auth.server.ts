import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "sys_admin";

function adminSecret(): string | null {
  return process.env.ADMIN_SECRET?.trim() || null;
}

function signToken(): string {
  const secret = adminSecret();
  if (!secret) return "";
  return createHmac("sha256", secret).update("admin-session").digest("hex");
}

export function verifyAdminPassword(password: string): boolean {
  const secret = adminSecret();
  if (!secret) return false;

  const a = Buffer.from(password.trim());
  const b = Buffer.from(secret);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function setAdminSessionCookie(): Promise<void> {
  const token = signToken();
  if (!token) return;

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 86400,
    path: "/",
  });
}

export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAdminSession(): Promise<boolean> {
  const secret = adminSecret();
  if (!secret) return false;

  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;
  if (!value) return false;

  const expected = signToken();
  if (!expected) return false;

  const a = Buffer.from(value);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
