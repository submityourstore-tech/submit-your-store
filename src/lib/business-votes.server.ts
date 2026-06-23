import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export type VoteChoice = "up" | "down";

export type BusinessVoteRecord = {
  upvotes: number;
  downvotes: number;
  voters: Record<string, VoteChoice>;
};

type VotesStore = { votes: Record<string, BusinessVoteRecord> };

type VoteRow = {
  business_id: string;
  upvotes: number;
  downvotes: number;
  voters: Record<string, VoteChoice> | null;
};

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

async function fetchVotesFromSupabase(): Promise<VotesStore> {
  try {
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase.from("business_votes").select("business_id, upvotes, downvotes, voters");

    if (error) {
      if (error.message.includes("Could not find the table")) return { votes: {} };
      throw new Error(`Failed to load votes from Supabase: ${error.message}`);
    }

    const votes: Record<string, BusinessVoteRecord> = {};
    for (const row of (data ?? []) as VoteRow[]) {
      votes[row.business_id] = {
        upvotes: row.upvotes,
        downvotes: row.downvotes,
        voters: row.voters ?? {},
      };
    }
    return { votes };
  } catch (err) {
    console.error("fetchVotesFromSupabase failed:", err);
    return { votes: {} };
  }
}

const getCachedVotesStore = unstable_cache(fetchVotesFromSupabase, ["business-votes-store"], {
  revalidate: 120,
  tags: ["business-votes"],
});

export const getVotesStore = cache(async (): Promise<VotesStore> => getCachedVotesStore());

function ensureRecordInStore(store: VotesStore, businessId: string): BusinessVoteRecord {
  if (!store.votes[businessId]) {
    const seed = getSeedVoteCounts(businessId);
    store.votes[businessId] = { ...seed, voters: {} };
  }
  return store.votes[businessId];
}

export function voteScoreFromStore(store: VotesStore, businessId: string): number {
  const { upvotes, downvotes } = ensureRecordInStore(store, businessId);
  return upvotes - downvotes;
}

export async function getBusinessVoteStats(businessId: string): Promise<BusinessVoteRecord> {
  const store = await getVotesStore();
  return ensureRecordInStore(store, businessId);
}

export async function getBusinessVoteScore(businessId: string): Promise<number> {
  const store = await getVotesStore();
  return voteScoreFromStore(store, businessId);
}

export async function getUserVote(businessId: string, userId: string): Promise<VoteChoice | null> {
  const store = await getVotesStore();
  return store.votes[businessId]?.voters[userId] ?? null;
}

export async function getVoteStatsForBusinesses(
  businessIds: string[],
): Promise<Record<string, BusinessVoteRecord & { score: number }>> {
  const store = await getVotesStore();
  const out: Record<string, BusinessVoteRecord & { score: number }> = {};
  for (const id of businessIds) {
    const stats = ensureRecordInStore(store, id);
    out[id] = { ...stats, score: stats.upvotes - stats.downvotes };
  }
  return out;
}
