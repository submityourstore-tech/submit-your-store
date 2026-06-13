import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { HvacListing } from "@/components/HvacListing";
import { LocationBrowse } from "@/components/LocationBrowse";
import { SidePromoTabs } from "@/components/SidePromoTabs";
import { getBusinessesByState, getLocationStats } from "@/lib/locations";
import { getReviewSummary } from "@/lib/reviews.server";
import type { ReviewSummaryMap } from "@/lib/listing";

export const metadata: Metadata = {
  title: "HVAC Contractors in Texas",
  description:
    "Browse HVAC contractors across Texas by city. Dallas, Houston, and more on Submit Your Store.",
};

function buildReviewSummaries(businesses: { id: string }[]): ReviewSummaryMap {
  const map: ReviewSummaryMap = {};
  for (const b of businesses) {
    const summary = getReviewSummary(b.id);
    if (summary) map[b.id] = summary;
  }
  return map;
}

export default function HvacTexasPage() {
  const businesses = getBusinessesByState("TX", "hvac");
  const locations = getLocationStats("TX", "hvac");
  const reviewSummaries = buildReviewSummaries(businesses);

  return (
    <div className="bg-white">
      <SidePromoTabs />

      <div className="border-b border-[#e0e0e0] bg-[#fafafa]">
        <div className="mx-auto max-w-6xl px-4 pt-4">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "HVAC", href: "/hvac/texas" },
              { label: "Texas" },
            ]}
          />
          <h1 className="mt-3 text-2xl font-bold text-[#111] sm:text-3xl">
            HVAC Contractors in <span className="text-[#1274c0]">Texas</span>
          </h1>
          <p className="mt-1 pb-4 text-sm text-[#717171]">
            {businesses.length} businesses across {locations.length} cities
          </p>
        </div>
      </div>

      <div className="border-b border-[#e0e0e0] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-5">
          <h2 className="text-base font-bold text-[#111]">Browse by city</h2>
          <div className="mt-3">
            <LocationBrowse locations={locations} />
          </div>
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
          locationLabel="Texas"
          basePath="/hvac/texas"
          groupByCity
        />
      </Suspense>
    </div>
  );
}
