import { getVotesStore, voteScoreFromStore } from "@/lib/business-votes.server";
import { isUnclaimedListing } from "@/lib/claim-status";
import type { Business } from "@/types/business";

export const OUTREACH_QUEUE_LIMIT = 50;

export type MarketRankInfo = {
  rank: number;
  total: number;
  voteScore: number;
  competitorsAbove: {
    id: string;
    name: string;
    score: number;
    rank: number;
  }[];
};

function marketPeers(business: Business, all: Business[]): Business[] {
  return all.filter(
    (b) =>
      b.status !== "hidden" &&
      b.id !== business.id &&
      b.city.toLowerCase() === business.city.toLowerCase() &&
      b.categorySlug === business.categorySlug,
  );
}

export async function getMarketRank(
  business: Business,
  all: Business[],
): Promise<MarketRankInfo> {
  const store = await getVotesStore();
  const peers = [business, ...marketPeers(business, all)];
  const scored = peers
    .map((b) => ({
      id: b.id,
      name: b.name,
      score: voteScoreFromStore(store, b.id),
    }))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  const rankIndex = scored.findIndex((s) => s.id === business.id);
  const rank = rankIndex >= 0 ? rankIndex + 1 : scored.length;
  const voteScore = scored[rankIndex]?.score ?? voteScoreFromStore(store, business.id);

  const competitorsAbove = scored.slice(0, rankIndex).slice(0, 3).map((c, i) => ({
    id: c.id,
    name: c.name,
    score: c.score,
    rank: i + 1,
  }));

  return {
    rank,
    total: scored.length,
    voteScore,
    competitorsAbove,
  };
}

export type OutreachCandidateRanked = Business & {
  voteScore: number;
  marketRank: number;
  marketTotal: number;
  competitorsAbove: MarketRankInfo["competitorsAbove"];
};

/** Unclaimed + email, lowest vote rank first, prefer those with better-ranked competitors above. */
export async function rankOutreachCandidates(
  businesses: Business[],
  options?: { skipContacted?: boolean; contactedIds?: Set<string>; limit?: number },
): Promise<OutreachCandidateRanked[]> {
  const store = await getVotesStore();
  const limit = options?.limit ?? OUTREACH_QUEUE_LIMIT;
  const contacted = options?.contactedIds ?? new Set<string>();

  const pool = businesses.filter(
    (b) =>
      b.status !== "hidden" &&
      isUnclaimedListing(b) &&
      b.email?.trim() &&
      (options?.skipContacted === false || !contacted.has(b.id)),
  );

  const ranked: OutreachCandidateRanked[] = [];
  for (const b of pool) {
    const info = await getMarketRank(b, businesses);
    ranked.push({
      ...b,
      voteScore: info.voteScore,
      marketRank: info.rank,
      marketTotal: info.total,
      competitorsAbove: info.competitorsAbove,
    });
  }

  ranked.sort((a, b) => {
    const aHasCompetitors = a.competitorsAbove.length > 0 ? 0 : 1;
    const bHasCompetitors = b.competitorsAbove.length > 0 ? 0 : 1;
    if (aHasCompetitors !== bHasCompetitors) return aHasCompetitors - bHasCompetitors;
    if (b.marketRank !== a.marketRank) return b.marketRank - a.marketRank;
    return a.voteScore - b.voteScore;
  });

  return ranked.slice(0, limit);
}

export function findRankedCompetitors(
  business: Business,
  all: Business[],
  voteScores: Map<string, number>,
): Business[] {
  const peers = all.filter(
    (b) =>
      b.id !== business.id &&
      b.status !== "hidden" &&
      !isUnclaimedListing(b) &&
      b.city.toLowerCase() === business.city.toLowerCase() &&
      b.categorySlug === business.categorySlug,
  );

  const targetScore = voteScores.get(business.id) ?? 0;
  return peers
    .filter((b) => (voteScores.get(b.id) ?? 0) > targetScore)
    .sort((a, b) => (voteScores.get(b.id) ?? 0) - (voteScores.get(a.id) ?? 0))
    .slice(0, 3);
}
