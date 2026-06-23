import Link from "next/link";
import type { SiteReview } from "@/types/business";
import { RatingBadge } from "./RatingBadge";
import { UserAvatar } from "./UserAvatar";
type SiteReviewsProps = {
  reviews: SiteReview[];
  average: number;
};

export function SiteReviews({ reviews, average }: SiteReviewsProps) {
  if (reviews.length === 0) return null;

  return (
    <section className="rounded border border-[#e0e0e0] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-bold text-[#111]">Member Reviews</h2>
        <RatingBadge rating={average} count={reviews.length} />
      </div>
      <ul className="mt-5 space-y-4">
        {reviews.map((review) => (
          <li key={review.id} className="border-t border-[#eee] pt-4 first:border-0 first:pt-0">
            <div className="flex gap-3">
              <UserAvatar
                name={review.userName}
                image={review.userImage}
                verified={review.emailVerified}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    {review.userId ? (
                      <Link
                        href={`/members/${review.userId}`}
                        className="font-semibold text-[#1274c0] hover:underline"
                      >
                        {review.userName}
                      </Link>
                    ) : (
                      <p className="font-semibold text-[#1274c0]">{review.userName}</p>
                    )}
                    {review.emailVerified && (
                      <span className="text-xs font-medium text-[#25a244]">Verified member</span>
                    )}
                  </div>
                  <RatingBadge rating={review.rating} />
                </div>
                {review.title ? <p className="mt-1 font-medium text-[#333]">{review.title}</p> : null}
                {review.body ? (
                  <p className="mt-1.5 text-sm leading-relaxed text-[#555]">{review.body}</p>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
