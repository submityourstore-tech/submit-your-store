import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { GlobalSearchResults } from "@/components/GlobalSearchResults";
import { SidePromoTabs } from "@/components/SidePromoTabs";
import { getPublicBusinesses } from "@/lib/categories.server";
import { getReviewSummariesForBusinesses } from "@/lib/reviews.server";

export const metadata: Metadata = {
  title: "Search Businesses",
  description: "Search local business listings by name, city, or category.",
};

export default async function SearchPage() {
  const businesses = await getPublicBusinesses();
  const reviewSummaries = await getReviewSummariesForBusinesses(businesses.map((b) => b.id));

  return (
    <div className="bg-white">
      <SidePromoTabs />

      <div className="border-b border-[#e0e0e0] bg-[#fafafa]">
        <div className="mx-auto max-w-6xl px-4 pt-4 pb-6">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Search" }]} />
          <h1 className="mt-3 text-2xl font-bold text-[#111] sm:text-3xl">
            Search <span className="text-[#1274c0]">businesses</span>
          </h1>
          <p className="mt-1 text-sm text-[#717171]">
            Find listings by name, city, category, or phone number
          </p>
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <Suspense fallback={<p className="text-sm text-[#717171]">Loading search…</p>}>
          <GlobalSearchResults businesses={businesses} reviewSummaries={reviewSummaries} />
        </Suspense>
      </section>
    </div>
  );
}
