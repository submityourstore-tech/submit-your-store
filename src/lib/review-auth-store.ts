import { randomUUID } from "crypto";
import path from "path";
import { hashValue } from "@/lib/gbp";
import { createJsonStore } from "@/lib/json-store-cache.server";

const STORE_PATH = path.join(process.cwd(), "data", "review-auth-verifications.json");

export type ReviewAuthRecord = {
  id: string;
  email: string;
  name: string;
  phone: string;
  codeHash: string;
  expiresAt: string;
  verifiedAt?: string;
};

type ReviewAuthStore = {
  verifications: ReviewAuthRecord[];
};

const reviewAuthStore = createJsonStore<ReviewAuthStore>({
  path: STORE_PATH,
  cacheKey: "review-auth-verifications",
  tag: "review-auth-verifications",
  revalidate: 60,
  pretty: true,
  fallback: () => ({ verifications: [] }),
});

export function saveReviewAuth(record: ReviewAuthRecord) {
  const store = reviewAuthStore.readForWrite();
  store.verifications = store.verifications.filter(
    (v) => !(v.email === record.email && !v.verifiedAt),
  );
  store.verifications.push(record);
  reviewAuthStore.write(store);
}

export async function findPendingReviewAuth(id: string): Promise<ReviewAuthRecord | undefined> {
  const store = await reviewAuthStore.read();
  return store.verifications.find((v) => v.id === id && !v.verifiedAt);
}

export function markReviewAuthVerified(id: string): ReviewAuthRecord | undefined {
  const store = reviewAuthStore.readForWrite();
  const record = store.verifications.find((v) => v.id === id);
  if (!record) return undefined;
  record.verifiedAt = new Date().toISOString();
  reviewAuthStore.write(store);
  return record;
}

export function createReviewAuthCode(): { id: string; code: string; codeHash: string } {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  return {
    id: randomUUID(),
    code,
    codeHash: hashValue(code),
  };
}
