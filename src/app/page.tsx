import Link from "next/link";
import { BusinessCard } from "@/components/BusinessCard";
import { LocationBrowse } from "@/components/LocationBrowse";
import { SearchHero } from "@/components/SearchHero";
import { SidePromoTabs } from "@/components/SidePromoTabs";
import { getActiveSearchTags, getActiveSubcategoryStats, getActiveVerticalStats } from "@/lib/categories.server";
import { getFeaturedBusinesses, getPublicBusinessCount } from "@/lib/businesses";
import { getLocationStats } from "@/lib/locations";
import { getReviewSummary } from "@/lib/reviews.server";

export default function HomePage() {
  const verticals = getActiveVerticalStats();
  const primaryVertical = verticals[0];
  const browseVertical = primaryVertical?.slug ?? "hvac";
  const featured = getFeaturedBusinesses(6, browseVertical);
  const categories = getActiveSubcategoryStats(browseVertical);
  const locations = getLocationStats("TX", browseVertical);
  const total = getPublicBusinessCount(browseVertical);
  const searchTags = getActiveSearchTags();

  return (
    <div className="bg-white">
      <SidePromoTabs />
      <SearchHero tags={searchTags} searchAction={primaryVertical?.href ?? "/hvac/texas"} />

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e0e0e0] pb-4">
          <div>
            <h2 className="text-lg font-bold text-[#111]">
              Popular in <span className="text-[#1274c0]">Texas</span>
            </h2>
            <p className="mt-0.5 text-sm text-[#717171]">{total} businesses listed</p>
          </div>
          {primaryVertical && (
            <Link
              href={primaryVertical.href}
              className="text-sm font-semibold text-[#1274c0] hover:underline"
            >
              Browse by location →
            </Link>
          )}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((b) => (
            <BusinessCard
              key={b.id}
              business={b}
              layout="grid"
              reviewSummary={getReviewSummary(b.id)}
            />
          ))}
        </div>
      </section>

      {verticals.length > 0 && (
        <section className="border-t border-[#e0e0e0] bg-[#f7f7f7]">
          <div className="mx-auto max-w-6xl px-4 py-8">
            <h2 className="text-lg font-bold text-[#111]">Browse by location</h2>
            <p className="mt-1 text-sm text-[#717171]">
              {primaryVertical?.label ?? "Local"} businesses across Texas
            </p>
            <div className="mt-4">
              <LocationBrowse locations={locations} verticalSlug={browseVertical} />
            </div>
          </div>
        </section>
      )}

      {categories.length > 0 && (
        <section className="border-t border-[#e0e0e0] bg-white">
          <div className="mx-auto max-w-6xl px-4 py-8">
            <h2 className="text-lg font-bold text-[#111]">Browse by category</h2>
            <p className="mt-1 text-sm text-[#717171]">
              Categories appear here as listings are added.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={c.href}
                  className="rounded border border-[#ddd] bg-white px-4 py-2 text-sm font-medium text-[#333] shadow-sm hover:border-[#1274c0] hover:text-[#1274c0]"
                >
                  {c.label}
                  <span className="ml-1.5 text-[#999]">({c.count})</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded border border-[#e0e0e0] bg-white p-6 text-center shadow-sm">
          <h2 className="text-xl font-bold text-[#111]">List your business for free</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-[#717171]">
            Get discovered by local customers. Reviews on Submit Your Store come from our members only.
          </p>
          <Link
            href="/list-your-business"
            className="jd-btn-orange mt-4 inline-block rounded px-6 py-2.5 text-sm font-semibold"
          >
            Free Listing
          </Link>
        </div>
      </section>
    </div>
  );
}
