import { randomUUID } from "crypto";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import type { SiteReview } from "@/types/business";

const JSON_PATH = path.join(process.cwd(), "data", "reviews.json");

type ReviewsStore = { reviews: SiteReview[] };

function readStore(): ReviewsStore {
  return JSON.parse(readFileSync(JSON_PATH, "utf-8")) as ReviewsStore;
}

function writeStore(store: ReviewsStore): void {
  writeFileSync(JSON_PATH, JSON.stringify(store, null, 2), "utf-8");
}

export function addReview(input: {
  businessId: string;
  userId: string;
  userName: string;
  userImage?: string | null;
  emailVerified?: boolean;
  rating: number;
  title?: string;
  body?: string;
}): SiteReview {
  const store = readStore();
  const title = input.title?.trim() ?? "";
  const body = input.body?.trim() ?? "";

  const existingIdx = store.reviews.findIndex(
    (r) => r.businessId === input.businessId && r.userId === input.userId,
  );

  const review: SiteReview = {
    id: existingIdx >= 0 ? store.reviews[existingIdx]!.id : randomUUID(),
    businessId: input.businessId,
    userId: input.userId,
    userName: input.userName.trim(),
    userImage: input.userImage ?? null,
    emailVerified: input.emailVerified ?? false,
    rating: input.rating,
    title,
    body,
    createdAt: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    store.reviews[existingIdx] = review;
  } else {
    store.reviews.push(review);
  }

  writeStore(store);
  return review;
}
