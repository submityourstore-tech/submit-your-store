import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { HvacListing } from "@/components/HvacListing";
import { SidePromoTabs } from "@/components/SidePromoTabs";
import { getActiveVerticalStats } from "@/lib/categories.server";
import { getVerticalCityPath, getVerticalPath } from "@/lib/categories-config";
import {
  formatLocationLabel,
  getBusinessesByLocation,
  getLocationStats,
  getStateLabel,
  parseLocationSlug,
} from "@/lib/locations";
import type { ReviewSummaryMap } from "@/lib/listing";
import { getReviewSummary } from "@/lib/reviews.server";
import {
  getActiveVerticalBrowse,
  verticalBreadcrumbLabel,
  verticalPageDescription,
  verticalPageTitle,
} from "@/lib/vertical-pages.server";

type PageProps = {
  params: Promise<{ vertical: string; location: string }>;
};

export function generateStaticParams() {
  const params: { vertical: string; location: string }[] = [];
  for (const vertical of getActiveVerticalStats()) {
    for (const loc of getLocationStats("TX", vertical.slug)) {
      params.push({ vertical: vertical.slug, location: loc.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { vertical, location } = await params;
  const meta = getActiveVerticalBrowse(vertical);
  const parsed = parseLocationSlug(location);
  if (!meta || !parsed) return { title: "Location not found" };

  const label = formatLocationLabel(parsed.city, parsed.state);
  return {
    title: verticalPageTitle(vertical, label),
    description: verticalPageDescription(vertical, label),
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

export default async function VerticalCityPage({ params }: PageProps) {
  const { vertical, location } = await params;
  const meta = getActiveVerticalBrowse(vertical);
  const parsed = parseLocationSlug(location);
  if (!meta || !parsed) notFound();

  const businesses = getBusinessesByLocation(parsed.city, parsed.state, vertical);
  if (businesses.length === 0) notFound();

  const label = formatLocationLabel(parsed.city, parsed.state);
  const reviewSummaries = buildReviewSummaries(businesses);
  const basePath = getVerticalCityPath(vertical, location);
  const breadcrumbLabel = verticalBreadcrumbLabel(vertical);

  return (
    <div className="bg-white">
      <SidePromoTabs />

      <div className="border-b border-[#e0e0e0] bg-[#fafafa]">
        <div className="mx-auto max-w-6xl px-4 pt-4">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: breadcrumbLabel, href: getVerticalPath(vertical) },
              { label: getStateLabel(parsed.state), href: getVerticalPath(vertical) },
              { label },
            ]}
          />
          <h1 className="mt-3 text-2xl font-bold text-[#111] sm:text-3xl">
            {breadcrumbLabel} in <span className="text-[#1274c0]">{label}</span>
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
          vertical={vertical}
        />
      </Suspense>
    </div>
  );
}
