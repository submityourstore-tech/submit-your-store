import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import type { SiteReview } from "@/types/business";

type ReviewRow = {
  id: string;
  business_id: string;
  user_id: string | null;
  user_name: string;
  user_image: string | null;
  email_verified: boolean;
  rating: number;
  title: string;
  body: string;
  created_at: string;
};

function mapRow(row: ReviewRow): SiteReview {
  return {
    id: row.id,
    businessId: row.business_id,
    userId: row.user_id ?? undefined,
    userName: row.user_name,
    userImage: row.user_image,
    emailVerified: row.email_verified,
    rating: row.rating,
    title: row.title,
    body: row.body,
    createdAt: row.created_at,
  };
}

async function fetchAllReviewsFromSupabase(): Promise<SiteReview[]> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("site_reviews")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    if (error.message.includes("Could not find the table")) return [];
    throw new Error(`Failed to load reviews from Supabase: ${error.message}`);
  }

  return ((data ?? []) as ReviewRow[]).map(mapRow);
}

const getCachedReviews = unstable_cache(fetchAllReviewsFromSupabase, ["site-reviews-all"], {
  revalidate: 60,
  tags: ["site-reviews"],
});

export const getAllReviewsCached = cache(async (): Promise<SiteReview[]> => getCachedReviews());

export async function getAllReviews(): Promise<SiteReview[]> {
  return getAllReviewsCached();
}

export async function getReviewsForBusiness(businessId: string): Promise<SiteReview[]> {
  const reviews = await getAllReviewsCached();
  return reviews
    .filter((r) => r.businessId === businessId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getReviewsForUser(userId: string): Promise<SiteReview[]> {
  const reviews = await getAllReviewsCached();
  return reviews
    .filter((r) => r.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getMemberIdsWithReviews(): Promise<string[]> {
  const reviews = await getAllReviewsCached();
  const ids = new Set<string>();
  for (const review of reviews) {
    if (review.userId) ids.add(review.userId);
  }
  return [...ids];
}

export async function getReviewSummary(
  businessId: string,
): Promise<{ average: number; count: number } | null> {
  const reviews = await getAllReviewsCached();
  const list = reviews.filter((r) => r.businessId === businessId);
  if (list.length === 0) return null;
  const average = list.reduce((sum, r) => sum + r.rating, 0) / list.length;
  return { average, count: list.length };
}

export async function getReviewSummariesForBusinesses(
  businessIds: string[],
): Promise<Record<string, { average: number; count: number }>> {
  const wanted = new Set(businessIds);
  const reviews = await getAllReviewsCached();
  const map: Record<string, { average: number; count: number; total: number }> = {};

  for (const review of reviews) {
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
