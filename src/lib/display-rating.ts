import type { Business } from "@/types/business";

export type DisplayRating = {
  average: number;
  count: number;
  source: "site" | "google";
};

export function getDisplayRating(
  business: Business,
  siteSummary: { average: number; count: number } | null,
): DisplayRating | null {
  if (siteSummary && siteSummary.count > 0) {
    return { average: siteSummary.average, count: siteSummary.count, source: "site" };
  }
  if (business.googleRating != null && (business.googleReviewCount ?? 0) > 0) {
    return {
      average: business.googleRating,
      count: business.googleReviewCount ?? 0,
      source: "google",
    };
  }
  return null;
}

export function formatRatingCount(count: number): string {
  return count.toLocaleString("en-US");
}
