import { SignJWT, jwtVerify } from "jose";

const TOKEN_KIND = "account-email-verify";
const TTL_SECONDS = 24 * 60 * 60;

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret) {
    throw new Error("AUTH_SECRET is required for account verification tokens.");
  }
  return new TextEncoder().encode(secret);
}

export async function createAccountVerificationToken(userId: string, email: string): Promise<string> {
  return new SignJWT({ v: TOKEN_KIND, userId, email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${TTL_SECONDS}s`)
    .sign(getSecret());
}

export async function verifyAccountVerificationToken(
  token: string,
): Promise<{ userId: string; email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.v !== TOKEN_KIND) return null;
    if (typeof payload.userId !== "string" || typeof payload.email !== "string") return null;
    return { userId: payload.userId, email: payload.email.toLowerCase() };
  } catch {
    return null;
  }
}
