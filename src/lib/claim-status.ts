import type { Business, ClaimStatus } from "@/types/business";

export type { ClaimStatus };

export const CLAIM_STATUS_LABELS: Record<ClaimStatus, string> = {
  unclaimed: "Unclaimed Business",
  verified: "Verified Business",
  claimed: "Claimed by Owner",
};

export function claimStatusFromMetadata(
  metadata: Record<string, unknown> | null | undefined,
): ClaimStatus {
  const raw = metadata?.claim_status;
  if (raw === "unclaimed" || raw === "verified" || raw === "claimed") return raw;
  return "verified";
}

export function metadataWithClaimStatus(
  existing: Record<string, unknown> | null | undefined,
  claimStatus: ClaimStatus,
): Record<string, unknown> {
  return { ...(existing ?? {}), claim_status: claimStatus };
}

export function isUnclaimedListing(business: Pick<Business, "claimStatus">): boolean {
  return business.claimStatus === "unclaimed";
}

export function isOwnerClaimed(business: Pick<Business, "claimStatus">): boolean {
  return business.claimStatus === "claimed";
}

/** Listings the business owner can still claim (not yet owner-verified). */
export function isClaimableListing(business: Pick<Business, "claimStatus">): boolean {
  return business.claimStatus === "unclaimed" || business.claimStatus === "verified";
}

export function resolveClaimStatus(business: Pick<Business, "claimStatus">): ClaimStatus {
  return business.claimStatus ?? "verified";
}

export function claimBadgeStyles(status: ClaimStatus): {
  border: string;
  bg: string;
  text: string;
  dot: string;
} {
  switch (status) {
    case "unclaimed":
      return {
        dot: "🟡",
        border: "border-[#f59e0b]",
        bg: "bg-[#fffbeb]",
        text: "text-[#b45309]",
      };
    case "verified":
      return {
        dot: "🔵",
        border: "border-[#1274c0]",
        bg: "bg-[#f0f7fd]",
        text: "text-[#0d5a94]",
      };
    case "claimed":
      return {
        dot: "🟢",
        border: "border-[#25a244]",
        bg: "bg-[#f0fdf4]",
        text: "text-[#166534]",
      };
  }
}
