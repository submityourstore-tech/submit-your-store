import { randomUUID } from "crypto";
import path from "path";
import { hashValue } from "@/lib/gbp";
import { createJsonStore } from "@/lib/json-store-cache.server";

const STORE_PATH = path.join(process.cwd(), "data", "claim-otp-verifications.json");

export type ClaimOtpRecord = {
  id: string;
  businessId: string;
  businessName: string;
  email: string;
  codeHash: string;
  expiresAt: string;
  verifiedAt?: string;
};

type ClaimOtpStore = {
  verifications: ClaimOtpRecord[];
};

const claimOtpStore = createJsonStore<ClaimOtpStore>({
  path: STORE_PATH,
  cacheKey: "claim-otp-verifications",
  tag: "claim-otp-verifications",
  revalidate: 60,
  pretty: true,
  fallback: () => ({ verifications: [] }),
});

export function saveClaimOtp(record: ClaimOtpRecord) {
  const store = claimOtpStore.readForWrite();
  store.verifications = store.verifications.filter(
    (v) => !(v.businessId === record.businessId && !v.verifiedAt),
  );
  store.verifications.push(record);
  claimOtpStore.write(store);
}

export async function findPendingClaimOtp(id: string): Promise<ClaimOtpRecord | undefined> {
  const store = await claimOtpStore.read();
  return store.verifications.find((v) => v.id === id && !v.verifiedAt);
}

export function markClaimOtpVerified(id: string): ClaimOtpRecord | undefined {
  const store = claimOtpStore.readForWrite();
  const record = store.verifications.find((v) => v.id === id);
  if (!record) return undefined;
  record.verifiedAt = new Date().toISOString();
  claimOtpStore.write(store);
  return record;
}

export function createClaimOtpCode(): { id: string; code: string; codeHash: string } {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  return {
    id: randomUUID(),
    code,
    codeHash: hashValue(code),
  };
}
