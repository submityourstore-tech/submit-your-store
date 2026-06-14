import { OverallRatingNote } from "@/components/OverallRatingNote";
import { filterCustomerReviews } from "@/lib/review-filters";
import type { DisplayRating } from "@/lib/display-rating";

type WhatCustomersSayProps = {
  reviews: string[];
  businessName: string;
  displayRating?: DisplayRating | null;
};

export function WhatCustomersSay({ reviews, businessName, displayRating }: WhatCustomersSayProps) {
  const filtered = filterCustomerReviews(reviews);
  if (filtered.length === 0) return null;

  return (
    <section className="mt-4 rounded border border-[#e0e0e0] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#1274c0]">💬 What Customers Say</h2>
          <p className="mt-1 text-xs text-[#717171]">
            Real feedback from verified Google reviewers for {businessName} — owner replies and
            promotional posts are excluded.
          </p>
        </div>
        {displayRating && displayRating.count > 0 && (
          <OverallRatingNote displayRating={displayRating} compact />
        )}
      </div>
      <ul className="mt-4 space-y-4">
        {filtered.map((item, index) => (
          <li key={index} className="border-t border-[#eee] pt-4 first:border-0 first:pt-0">
            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1274c0] text-sm font-bold text-white">
                G
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-[#717171]">Google reviewer</p>
                <p className="mt-1.5 text-sm leading-relaxed text-[#555]">&ldquo;{item}&rdquo;</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
