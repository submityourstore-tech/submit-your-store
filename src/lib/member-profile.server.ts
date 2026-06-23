import { findUserById } from "@/lib/user-store";
import { getReviewsForUser } from "@/lib/reviews.server";
import type { SiteReview } from "@/types/business";

export type MemberPublicProfile = {
  id: string;
  name: string;
  image: string | null;
  emailVerified: boolean;
  reviews: SiteReview[];
};

export async function getMemberPublicProfile(userId: string): Promise<MemberPublicProfile | null> {
  const [reviews, user] = await Promise.all([getReviewsForUser(userId), findUserById(userId)]);

  if (!user && reviews.length === 0) return null;

  return {
    id: userId,
    name: user?.name ?? reviews[0]?.userName ?? "Member",
    image: user?.image ?? reviews[0]?.userImage ?? null,
    emailVerified: user?.emailVerified ?? reviews.some((review) => review.emailVerified),
    reviews,
  };
}
