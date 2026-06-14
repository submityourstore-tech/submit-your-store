import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { LocationBrowsePanel } from "@/components/LocationBrowsePanel";
import { SearchBar } from "@/components/SearchBar";
import { SidePromoTabs } from "@/components/SidePromoTabs";
import { getActiveSubcategoryStats, getActiveVerticalStats } from "@/lib/categories.server";
import { getPublicBusinessCount } from "@/lib/businesses";
import { getLocationStats } from "@/lib/locations";

export const metadata: Metadata = {
  title: "Browse Listings",
  description: "Browse local business listings by city and category worldwide.",
};

export default function ListingsPage() {
  const verticals = getActiveVerticalStats();
  const primaryVertical = verticals[0];
  const browseVertical = primaryVertical?.slug ?? "hvac";
  const locations = getLocationStats("TX", browseVertical);
  const categories = getActiveSubcategoryStats(browseVertical);
  const total = getPublicBusinessCount(browseVertical);

  return (
    <div className="bg-white">
      <SidePromoTabs />

      <div className="border-b border-[#e0e0e0] bg-[#fafafa]">
        <div className="mx-auto max-w-6xl px-4 pt-4 pb-5">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Listings" }]} />
          <h1 className="mt-3 text-2xl font-bold text-[#111] sm:text-3xl">
            Browse <span className="text-[#1274c0]">Listings</span>
          </h1>
          <p className="mt-1 text-sm text-[#717171]">{total} businesses listed worldwide</p>
          <div className="mt-5 max-w-2xl">
            <SearchBar action={primaryVertical?.href ?? "/listings"} />
          </div>
        </div>
      </div>

      {locations.length > 0 && (
        <section className="border-b border-[#e0e0e0] bg-white">
          <div className="mx-auto max-w-6xl px-4 py-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#111]">Browse by location</h2>
                <p className="mt-1 text-sm text-[#717171]">Find businesses in your city</p>
              </div>
              {primaryVertical && (
                <Link
                  href={primaryVertical.href}
                  className="text-sm font-semibold text-[#1274c0] hover:underline"
                >
                  View all listings →
                </Link>
              )}
            </div>
            <div className="mt-4">
              <LocationBrowsePanel
                locations={locations}
                verticalSlug={browseVertical}
                variant="full"
              />
            </div>
          </div>
        </section>
      )}

      {categories.length > 0 && (
        <section className="border-b border-[#e0e0e0] bg-[#f7f7f7]">
          <div className="mx-auto max-w-6xl px-4 py-8">
            <h2 className="text-lg font-bold text-[#111]">Browse by category</h2>
            <p className="mt-1 text-sm text-[#717171]">
              Categories appear here as listings are added.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={category.href}
                  className="rounded border border-[#ddd] bg-white px-4 py-2 text-sm font-medium text-[#333] shadow-sm hover:border-[#1274c0] hover:text-[#1274c0]"
                >
                  {category.label}
                  <span className="ml-1.5 text-[#999]">({category.count})</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {verticals.length > 1 && (
        <section className="mx-auto max-w-6xl px-4 py-8">
          <h2 className="text-lg font-bold text-[#111]">Browse by industry</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {verticals.map((vertical) => (
              <Link
                key={vertical.slug}
                href={vertical.href}
                className="rounded border border-[#ddd] bg-white px-4 py-2 text-sm font-medium text-[#333] shadow-sm hover:border-[#1274c0] hover:text-[#1274c0]"
              >
                {vertical.navLabel}
                <span className="ml-1.5 text-[#999]">({vertical.count})</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
