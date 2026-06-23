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
  getBusinessesByLocationSlug,
  getLocationStats,
  getStateLabel,
  parseLocationSlug,
} from "@/lib/locations";
import type { ReviewSummaryMap } from "@/lib/listing";
import { getReviewSummariesForBusinesses } from "@/lib/reviews.server";
import {
  generateVerticalStaticParams,
  getActiveVerticalBrowse,
  resolveCanonicalVerticalSlug,
  resolveVerticalQuerySlug,
  verticalBreadcrumbLabel,
  verticalPageDescription,
  verticalPageTitle,
  verticalSlugsForRouting,
} from "@/lib/vertical-pages.server";

type PageProps = {
  params: Promise<{ vertical: string; location: string }>;
};

export const dynamicParams = true;

export async function generateStaticParams() {
  const params: { vertical: string; location: string }[] = [];
  for (const vertical of await getActiveVerticalStats()) {
    const querySlug = vertical.slug === "home-services" ? "hvac" : vertical.slug;
    for (const vSlug of verticalSlugsForRouting(vertical)) {
      for (const loc of await getLocationStats("TX", querySlug)) {
        params.push({ vertical: vSlug, location: loc.slug });
      }
    }
  }
  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { vertical, location } = await params;
  const meta = await getActiveVerticalBrowse(vertical);
  const parsed = parseLocationSlug(location);
  if (!meta || !parsed) return { title: "Location not found" };

  const label = formatLocationLabel(parsed.city, parsed.state);
  return {
    title: await verticalPageTitle(vertical, label),
    description: verticalPageDescription(vertical, label),
  };
}

async function buildReviewSummaries(businesses: { id: string }[]): Promise<ReviewSummaryMap> {
  return getReviewSummariesForBusinesses(businesses.map((b) => b.id));
}

export default async function VerticalCityPage({ params }: PageProps) {
  const { vertical: rawVertical, location } = await params;
  const meta = await getActiveVerticalBrowse(rawVertical);
  const parsed = parseLocationSlug(location);
  if (!meta || !parsed) notFound();

  const vertical = await resolveCanonicalVerticalSlug(rawVertical);
  const queryVertical = await resolveVerticalQuerySlug(rawVertical);
  const businesses = await getBusinessesByLocationSlug(location, queryVertical);

  const label = formatLocationLabel(parsed.city, parsed.state);
  const reviewSummaries = await buildReviewSummaries(businesses);
  const basePath = getVerticalCityPath(vertical, location);
  const breadcrumbLabel = await verticalBreadcrumbLabel(vertical);

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
            {businesses.length > 0
              ? `${businesses.length} businesses · Reviews from Submit Your Store members only`
              : "No listings in this area yet — browse Texas or add your business."}
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
