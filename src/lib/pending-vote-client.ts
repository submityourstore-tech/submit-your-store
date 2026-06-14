import type { VoteChoice } from "@/lib/business-votes.server";

const PENDING_VOTE_KEY = "sys_pending_business_vote";

export type PendingBusinessVote = {
  businessId: string;
  choice: VoteChoice;
};

export function savePendingVote(businessId: string, choice: VoteChoice) {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(PENDING_VOTE_KEY, JSON.stringify({ businessId, choice }));
}

export function loadPendingVote(businessId: string): PendingBusinessVote | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PENDING_VOTE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingBusinessVote;
    return parsed.businessId === businessId ? parsed : null;
  } catch {
    return null;
  }
}

export function clearPendingVote() {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(PENDING_VOTE_KEY);
}
