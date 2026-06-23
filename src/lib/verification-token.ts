import { SignJWT, decodeJwt, errors, jwtVerify } from "jose";
import type { ListingVerificationType, NewListingPayload } from "@/types/listing";

const TOKEN_KIND = "listing-verification";
const TTL_SECONDS = 15 * 60;

export type VerificationMethod = "email" | "phone";

export type VerificationTokenPayload = {
  type: ListingVerificationType;
  method: VerificationMethod;
  businessEmail: string;
  gbpPhone: string | null;
  gbpUrl: string;
  businessId: string | null;
  payload: NewListingPayload | null;
  otpHash: string | null;
};

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret) {
    throw new Error("AUTH_SECRET is required for listing verification tokens.");
  }
  return new TextEncoder().encode(secret);
}

function toPayload(jwtPayload: Record<string, unknown>): VerificationTokenPayload | null {
  if (jwtPayload.v !== TOKEN_KIND) return null;
  if (jwtPayload.type !== "new" && jwtPayload.type !== "claim") return null;

  const method: VerificationMethod =
    jwtPayload.method === "phone" ? "phone" : "email";

  if (method === "email" && typeof jwtPayload.businessEmail !== "string") return null;
  if (typeof jwtPayload.gbpUrl !== "string") return null;

  const gbpUrl = jwtPayload.gbpUrl;

  const businessEmail =
    typeof jwtPayload.businessEmail === "string" ? jwtPayload.businessEmail : "";

  const gbpPhone =
    jwtPayload.gbpPhone === null || typeof jwtPayload.gbpPhone === "string"
      ? jwtPayload.gbpPhone
      : null;

  const businessId =
    jwtPayload.businessId === null || typeof jwtPayload.businessId === "string"
      ? jwtPayload.businessId
      : null;

  const payload =
    jwtPayload.payload === null || typeof jwtPayload.payload === "object"
      ? (jwtPayload.payload as NewListingPayload | null)
      : null;

  const otpHash =
    jwtPayload.otpHash === null || typeof jwtPayload.otpHash === "string"
      ? jwtPayload.otpHash
      : null;

  return {
    type: jwtPayload.type,
    method,
    businessEmail,
    gbpPhone,
    gbpUrl,
    businessId,
    payload,
    otpHash,
  };
}

export async function createVerificationToken(data: VerificationTokenPayload): Promise<string> {
  return new SignJWT({
    v: TOKEN_KIND,
    type: data.type,
    method: data.method,
    businessEmail: data.businessEmail,
    gbpPhone: data.gbpPhone,
    gbpUrl: data.gbpUrl,
    businessId: data.businessId,
    payload: data.payload,
    otpHash: data.otpHash,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${TTL_SECONDS}s`)
    .sign(getSecret());
}

export async function verifyVerificationToken(
  token: string,
): Promise<{ payload: VerificationTokenPayload; expired: boolean } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const parsed = toPayload(payload as Record<string, unknown>);
    if (!parsed) return null;
    return { payload: parsed, expired: false };
  } catch (err) {
    if (err instanceof errors.JWTExpired) {
      const parsed = toPayload(decodeJwt(token));
      if (!parsed) return null;
      return { payload: parsed, expired: true };
    }
    return null;
  }
}

/** Read token fields without signature check (for client UI routing). */
export function decodeVerificationToken(token: string): VerificationTokenPayload | null {
  try {
    return toPayload(decodeJwt(token));
  } catch {
    return null;
  }
}
