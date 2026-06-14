import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { HvacListing } from "@/components/HvacListing";
import { LocationBrowse } from "@/components/LocationBrowse";
import { SidePromoTabs } from "@/components/SidePromoTabs";
import { getActiveVerticalStats } from "@/lib/categories.server";
import { getVerticalPath } from "@/lib/categories-config";
import { getBusinessesByState, getLocationStats } from "@/lib/locations";
import type { ReviewSummaryMap } from "@/lib/listing";
import { getReviewSummary } from "@/lib/reviews.server";
import {
  getActiveVerticalBrowse,
  verticalBreadcrumbLabel,
  verticalPageDescription,
  verticalPageTitle,
} from "@/lib/vertical-pages.server";

type PageProps = {
  params: Promise<{ vertical: string }>;
};

export function generateStaticParams() {
  return getActiveVerticalStats().map((vertical) => ({ vertical: vertical.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { vertical } = await params;
  const meta = getActiveVerticalBrowse(vertical);
  if (!meta) return { title: "Category not found" };

  return {
    title: verticalPageTitle(vertical, "Texas"),
    description: verticalPageDescription(vertical, "Texas"),
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

export default async function VerticalTexasPage({ params }: PageProps) {
  const { vertical } = await params;
  const meta = getActiveVerticalBrowse(vertical);
  if (!meta) notFound();

  const businesses = getBusinessesByState("TX", vertical);
  const locations = getLocationStats("TX", vertical);
  const reviewSummaries = buildReviewSummaries(businesses);
  const basePath = getVerticalPath(vertical);
  const breadcrumbLabel = verticalBreadcrumbLabel(vertical);

  return (
    <div className="bg-white">
      <SidePromoTabs />

      <div className="border-b border-[#e0e0e0] bg-[#fafafa]">
        <div className="mx-auto max-w-6xl px-4 pt-4">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: breadcrumbLabel, href: basePath },
              { label: "Texas" },
            ]}
          />
          <h1 className="mt-3 text-2xl font-bold text-[#111] sm:text-3xl">
            {breadcrumbLabel} in <span className="text-[#1274c0]">Texas</span>
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
            <LocationBrowse locations={locations} verticalSlug={vertical} />
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
          basePath={basePath}
          groupByCity
          vertical={vertical}
        />
      </Suspense>
    </div>
  );
}
