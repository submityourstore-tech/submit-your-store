import { readFileSync, writeFileSync } from "fs";
import path from "path";
import type {
  ListingVerificationRecord,
  ListingVerificationsStore,
  ManageSessionRecord,
  NewListingPayload,
} from "@/types/listing";
import { generateManageToken, hashValue } from "@/lib/gbp";

const STORE_PATH = path.join(process.cwd(), "data", "listing-verifications.json");

function readStore(): ListingVerificationsStore {
  try {
    const raw = readFileSync(STORE_PATH, "utf-8");
    return JSON.parse(raw) as ListingVerificationsStore;
  } catch {
    return { verifications: [], manageSessions: [] };
  }
}

function writeStore(store: ListingVerificationsStore) {
  writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

export function saveVerification(record: ListingVerificationRecord) {
  const store = readStore();
  store.verifications = store.verifications.filter(
    (v) =>
      !(
        v.businessEmail === record.businessEmail &&
        v.gbpUrl === record.gbpUrl &&
        !v.verifiedAt
      ),
  );
  store.verifications.push(record);
  writeStore(store);
}

export function findPendingVerification(id: string): ListingVerificationRecord | undefined {
  const store = readStore();
  return store.verifications.find((v) => v.id === id && !v.verifiedAt);
}

export function updateVerificationCode(id: string, codeHash: string): ListingVerificationRecord | undefined {
  const store = readStore();
  const record = store.verifications.find((v) => v.id === id && !v.verifiedAt);
  if (!record) return undefined;
  record.codeHash = codeHash;
  record.expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  writeStore(store);
  return record;
}

export function markVerificationComplete(id: string): ListingVerificationRecord | undefined {
  const store = readStore();
  const record = store.verifications.find((v) => v.id === id);
  if (!record) return undefined;
  record.verifiedAt = new Date().toISOString();
  writeStore(store);
  return record;
}

export function createManageSession(
  businessId: string,
  email: string,
  daysValid = 7,
): { token: string; record: ManageSessionRecord } {
  const store = readStore();
  const token = generateManageToken();
  const record: ManageSessionRecord = {
    businessId,
    email: email.toLowerCase(),
    tokenHash: hashValue(token),
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + daysValid * 86400000).toISOString(),
  };
  store.manageSessions = store.manageSessions.filter((s) => s.businessId !== businessId);
  store.manageSessions.push(record);
  writeStore(store);
  return { token, record };
}

export function validateManageToken(
  businessId: string,
  token: string,
): ManageSessionRecord | null {
  const store = readStore();
  const hashed = hashValue(token);
  const session = store.manageSessions.find(
    (s) =>
      s.businessId === businessId &&
      s.tokenHash === hashed &&
      new Date(s.expiresAt).getTime() > Date.now(),
  );
  return session ?? null;
}

export function savePendingListing(payload: NewListingPayload) {
  const pendingPath = path.join(process.cwd(), "data", "pending-listings.json");
  let pending: unknown[] = [];
  try {
    pending = JSON.parse(readFileSync(pendingPath, "utf-8")) as unknown[];
  } catch {
    pending = [];
  }
  pending.push({
    ...payload,
    submittedAt: new Date().toISOString(),
    status: "pending_review",
  });
  writeFileSync(pendingPath, JSON.stringify(pending, null, 2), "utf-8");
}
