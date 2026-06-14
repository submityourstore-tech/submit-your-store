import { readFileSync } from "fs";
import path from "path";
import type { SiteReview } from "@/types/business";

const JSON_PATH = path.join(process.cwd(), "data", "reviews.json");

function loadReviews(): SiteReview[] {
  const data = JSON.parse(readFileSync(JSON_PATH, "utf-8")) as { reviews: SiteReview[] };
  return data.reviews;
}

export function getAllReviews(): SiteReview[] {
  return loadReviews();
}

export function getReviewsForBusiness(businessId: string): SiteReview[] {
  return loadReviews()
    .filter((r) => r.businessId === businessId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getReviewsForUser(userId: string): SiteReview[] {
  return loadReviews()
    .filter((r) => r.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getMemberIdsWithReviews(): string[] {
  const ids = new Set<string>();
  for (const review of loadReviews()) {
    if (review.userId) ids.add(review.userId);
  }
  return [...ids];
}

export function getReviewSummary(businessId: string): { average: number; count: number } | null {
  const list = getReviewsForBusiness(businessId);
  if (list.length === 0) return null;
  const average = list.reduce((sum, r) => sum + r.rating, 0) / list.length;
  return { average, count: list.length };
}

export function getReviewSummariesForBusinesses(
  businessIds: string[],
): Record<string, { average: number; count: number }> {
  const wanted = new Set(businessIds);
  const map: Record<string, { average: number; count: number; total: number }> = {};

  for (const review of loadReviews()) {
    if (!wanted.has(review.businessId)) continue;
    const entry = map[review.businessId] ?? { average: 0, count: 0, total: 0 };
    entry.count += 1;
    entry.total += review.rating;
    entry.average = entry.total / entry.count;
    map[review.businessId] = entry;
  }

  const out: Record<string, { average: number; count: number }> = {};
  for (const [id, { average, count }] of Object.entries(map)) {
    out[id] = { average, count };
  }
  return out;
}
