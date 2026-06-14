import { randomUUID } from "crypto";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { hashValue } from "@/lib/gbp";

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

function readStore(): ReviewAuthStore {
  try {
    return JSON.parse(readFileSync(STORE_PATH, "utf-8")) as ReviewAuthStore;
  } catch {
    return { verifications: [] };
  }
}

function writeStore(store: ReviewAuthStore) {
  writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

export function saveReviewAuth(record: ReviewAuthRecord) {
  const store = readStore();
  store.verifications = store.verifications.filter(
    (v) => !(v.email === record.email && !v.verifiedAt),
  );
  store.verifications.push(record);
  writeStore(store);
}

export function findPendingReviewAuth(id: string): ReviewAuthRecord | undefined {
  return readStore().verifications.find((v) => v.id === id && !v.verifiedAt);
}

export function markReviewAuthVerified(id: string): ReviewAuthRecord | undefined {
  const store = readStore();
  const record = store.verifications.find((v) => v.id === id);
  if (!record) return undefined;
  record.verifiedAt = new Date().toISOString();
  writeStore(store);
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
