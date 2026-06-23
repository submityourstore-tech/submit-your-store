import path from "path";
import { generateManageToken, hashValue } from "@/lib/gbp";
import { createJsonStore } from "@/lib/json-store-cache.server";
import type {
  ListingVerificationRecord,
  ListingVerificationsStore,
  ManageSessionRecord,
  NewListingPayload,
} from "@/types/listing";

const STORE_PATH = path.join(process.cwd(), "data", "listing-verifications.json");
const PENDING_PATH = path.join(process.cwd(), "data", "pending-listings.json");

const listingStore = createJsonStore<ListingVerificationsStore>({
  path: STORE_PATH,
  cacheKey: "listing-verifications",
  tag: "listing-verifications",
  revalidate: 60,
  pretty: true,
  fallback: () => ({ verifications: [], manageSessions: [] }),
});

const pendingStore = createJsonStore<unknown[]>({
  path: PENDING_PATH,
  cacheKey: "pending-listings",
  tag: "pending-listings",
  revalidate: 60,
  pretty: true,
  fallback: () => [],
});

export async function saveVerification(record: ListingVerificationRecord) {
  const store = listingStore.readForWrite();
  store.verifications = store.verifications.filter(
    (v) =>
      !(
        v.businessEmail === record.businessEmail &&
        v.gbpUrl === record.gbpUrl &&
        !v.verifiedAt
      ),
  );
  store.verifications.push(record);
  listingStore.write(store);
}

export async function findPendingVerification(id: string): Promise<ListingVerificationRecord | undefined> {
  const store = await listingStore.read();
  return store.verifications.find((v) => v.id === id && !v.verifiedAt);
}

export async function updateVerificationCode(
  id: string,
  codeHash: string,
): Promise<ListingVerificationRecord | undefined> {
  const store = listingStore.readForWrite();
  const record = store.verifications.find((v) => v.id === id && !v.verifiedAt);
  if (!record) return undefined;
  record.codeHash = codeHash;
  record.expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  listingStore.write(store);
  return record;
}

export async function markVerificationComplete(id: string): Promise<ListingVerificationRecord | undefined> {
  const store = listingStore.readForWrite();
  const record = store.verifications.find((v) => v.id === id);
  if (!record) return undefined;
  record.verifiedAt = new Date().toISOString();
  listingStore.write(store);
  return record;
}

export function createManageSession(
  businessId: string,
  email: string,
  daysValid = 7,
): { token: string; record: ManageSessionRecord } {
  const store = listingStore.readForWrite();
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
  listingStore.write(store);
  return { token, record };
}

export async function validateManageToken(
  businessId: string,
  token: string,
): Promise<ManageSessionRecord | null> {
  const store = await listingStore.read();
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
  const pending = pendingStore.readForWrite();
  pending.push({
    ...payload,
    submittedAt: new Date().toISOString(),
    status: "pending_review",
  });
  pendingStore.write(pending);
}
