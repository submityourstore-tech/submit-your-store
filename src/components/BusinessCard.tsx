import Link from "next/link";
import type { Business } from "@/types/business";
import { BusinessAddress } from "./BusinessAddress";
import { BusinessAvatar } from "./BusinessMedia";
import { RatingBadge } from "./RatingBadge";
import { SocialIconLinks } from "./SocialIcons";

type ReviewSummary = { average: number; count: number };

type BusinessCardProps = {
  business: Business;
  layout?: "grid" | "list";
  reviewSummary?: ReviewSummary | null;
};

export function BusinessCard({ business, layout = "list", reviewSummary }: BusinessCardProps) {

  if (layout === "grid") {
    return (
      <article className="rounded border border-[#e0e0e0] bg-white p-4 shadow-sm">
        <BusinessAvatar name={business.name} logo={business.logo} />
        <h2 className="mt-3 text-base font-bold text-[#111]">
          <Link href={`/business/${business.id}`} className="hover:text-[#1274c0]">
            {business.name}
          </Link>
        </h2>
        {reviewSummary && (
          <div className="mt-2">
            <RatingBadge rating={reviewSummary.average} count={reviewSummary.count} />
          </div>
        )}
        <BusinessAddress business={business} className="mt-2 text-[#717171]" />
      </article>
    );
  }

  return (
    <article className="rounded border border-[#e0e0e0] bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex gap-4">
        <BusinessAvatar name={business.name} logo={business.logo} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h2 className="text-lg font-bold text-[#111] sm:text-xl">
              <Link href={`/business/${business.id}`} className="hover:text-[#1274c0]">
                {business.name}
              </Link>
            </h2>
            {reviewSummary && (
              <RatingBadge rating={reviewSummary.average} count={reviewSummary.count} />
            )}
          </div>

          <BusinessAddress business={business} className="mt-1" />

          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="rounded border border-[#e8e8e8] bg-[#fafafa] px-2 py-0.5 text-xs text-[#555]">
              {business.category}
            </span>
            <span className="rounded border border-[#e8e8e8] bg-[#fafafa] px-2 py-0.5 text-xs text-[#555]">
              {business.city}
            </span>
          </div>

          <p className="mt-2 line-clamp-2 text-sm text-[#555]">{business.description}</p>

          <SocialIconLinks social={business.social} size="sm" className="mt-2" />

          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={`tel:${business.phone}`}
              className="jd-btn-call inline-flex items-center gap-1.5 rounded px-4 py-2 text-sm font-semibold"
            >
              <span aria-hidden>📞</span>
              {business.phone}
            </a>
            <Link
              href={`/business/${business.id}`}
              className="jd-btn-primary inline-flex items-center gap-1.5 rounded px-4 py-2 text-sm font-semibold"
            >
              View Details
            </Link>
            <Link
              href={`/business/${business.id}#write-review`}
              className="inline-flex items-center rounded border border-[#1274c0] px-4 py-2 text-sm font-semibold text-[#1274c0] hover:bg-[#f0f7fd]"
            >
              Write a Review
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
