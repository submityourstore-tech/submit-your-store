import { readFileSync } from "fs";
import path from "path";

export type VoteChoice = "up" | "down";

export type BusinessVoteRecord = {
  upvotes: number;
  downvotes: number;
  voters: Record<string, VoteChoice>;
};

type VotesStore = { votes: Record<string, BusinessVoteRecord> };

const JSON_PATH = path.join(process.cwd(), "data", "business-votes.json");

function hashBusinessId(businessId: string): number {
  let h = 2166136261;
  for (let i = 0; i < businessId.length; i++) {
    h ^= businessId.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** Baseline counts so rankings look established before real user votes. */
export function getSeedVoteCounts(businessId: string): { upvotes: number; downvotes: number } {
  const h = hashBusinessId(businessId);
  return {
    upvotes: 260 + (h % 180),
    downvotes: 12 + ((h >> 8) % 48),
  };
}

function readStore(): VotesStore {
  return JSON.parse(readFileSync(JSON_PATH, "utf-8")) as VotesStore;
}

function ensureRecord(store: VotesStore, businessId: string): BusinessVoteRecord {
  if (!store.votes[businessId]) {
    const seed = getSeedVoteCounts(businessId);
    store.votes[businessId] = { ...seed, voters: {} };
  }
  return store.votes[businessId];
}

export function getBusinessVoteStats(businessId: string): BusinessVoteRecord {
  const store = readStore();
  return ensureRecord(store, businessId);
}

export function getBusinessVoteScore(businessId: string): number {
  const { upvotes, downvotes } = getBusinessVoteStats(businessId);
  return upvotes - downvotes;
}

export function getUserVote(businessId: string, userId: string): VoteChoice | null {
  const store = readStore();
  const record = store.votes[businessId];
  return record?.voters[userId] ?? null;
}

export function getVoteStatsForBusinesses(
  businessIds: string[],
): Record<string, BusinessVoteRecord & { score: number }> {
  const out: Record<string, BusinessVoteRecord & { score: number }> = {};
  for (const id of businessIds) {
    const stats = getBusinessVoteStats(id);
    out[id] = { ...stats, score: stats.upvotes - stats.downvotes };
  }
  return out;
}
