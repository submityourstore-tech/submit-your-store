import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { HvacListing } from "@/components/HvacListing";
import { SidePromoTabs } from "@/components/SidePromoTabs";
import {
  formatLocationLabel,
  getBusinessesByLocation,
  getLocationStats,
  getStateLabel,
  parseLocationSlug,
} from "@/lib/locations";
import { getReviewSummary } from "@/lib/reviews.server";
import type { ReviewSummaryMap } from "@/lib/listing";

type PageProps = {
  params: Promise<{ location: string }>;
};

export async function generateStaticParams() {
  return getLocationStats().map((loc) => ({ location: loc.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { location } = await params;
  const parsed = parseLocationSlug(location);
  if (!parsed) return { title: "Location not found" };

  const label = formatLocationLabel(parsed.city, parsed.state);
  return {
    title: `HVAC Contractors in ${label}`,
    description: `Browse HVAC and AC contractors in ${label} on Submit Your Store.`,
  };
}

function buildReviewSummaries(businesses: { id: string }[]): ReviewSummaryMap {
  const map: ReviewSummaryMap = {};
  for (const b of businesses) {
    const summary = getReviewSummary(b.id);
    if (summary) map[b.id] = summary;
  }
  return map;
}

export default async function HvacCityPage({ params }: PageProps) {
  const { location } = await params;
  const parsed = parseLocationSlug(location);
  if (!parsed) notFound();

  const businesses = getBusinessesByLocation(parsed.city, parsed.state, "hvac");
  if (businesses.length === 0) notFound();

  const label = formatLocationLabel(parsed.city, parsed.state);
  const reviewSummaries = buildReviewSummaries(businesses);
  const basePath = `/hvac/${location}`;

  return (
    <div className="bg-white">
      <SidePromoTabs />

      <div className="border-b border-[#e0e0e0] bg-[#fafafa]">
        <div className="mx-auto max-w-6xl px-4 pt-4">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "HVAC", href: "/hvac/texas" },
              { label: getStateLabel(parsed.state), href: "/hvac/texas" },
              { label },
            ]}
          />
          <h1 className="mt-3 text-2xl font-bold text-[#111] sm:text-3xl">
            HVAC Contractors in <span className="text-[#1274c0]">{label}</span>
          </h1>
          <p className="mt-1 pb-4 text-sm text-[#717171]">
            {businesses.length} businesses · Reviews from Submit Your Store members only
          </p>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-[#717171]">
            Loading listings…
          </div>
        }
      >
        <HvacListing
          businesses={businesses}
          reviewSummaries={reviewSummaries}
          locationLabel={label}
          basePath={basePath}
        />
      </Suspense>
    </div>
  );
}
